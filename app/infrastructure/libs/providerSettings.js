/* eslint-disable no-console */
const moment = require("moment");
const Sequelize = require("sequelize");
const CustomError = require("../../domain/exceptions/CustomError.js");
const registerModels = require("../../models/index.js");
const registerControllers = require("../injectors/index.js");
const JWT = require("./jwt.js");
// const Stripe = require('./stripe.js');

const env = process.env.NODE_ENV || "development";
const {
  username,
  password,
  database,
  ...config
} = require("../../config/db.config.js")[env];

module.exports = class ProviderSettings {
  // Constructor is only called inside getInstance function
  constructor({ db_logging } = {}) {
    this.providers = {};
    this.logging = db_logging !== undefined ? db_logging : config.logging;
    this.isRefreshing = false;
    this.refreshQueue = [];
    this.connectionTimeout = 20000; // 20 seconds timeout for connections (increased)
    this.retryTimeouts = new Map(); // Track ongoing retry timeouts
    this.erroredDomains = [];

    this.db = new Sequelize(database, username, password, {
      ...config,
      logging: this.logging,
      pool: {
        max: 15, // Increased slightly for main connection
        min: 2,
        acquire: 20000, // Consistent with config
        idle: 10000,
        evict: 10000,
        handleDisconnects: true,
      },
    });

    // Handle process cleanup
    this.setupGracefulShutdown();
  }

  setupGracefulShutdown() {
    const gracefulShutdown = async () => {
      console.log("Graceful shutdown initiated...");

      // Clear all pending retry timeouts
      this.retryTimeouts.forEach((timeout) => {
        clearTimeout(timeout);
      });
      this.retryTimeouts.clear();

      // Stop connection monitoring
      this.connectionMonitor.stopMonitoring();

      await this.closeAllConnections();
      process.exit(0);
    };

    process.on("SIGTERM", gracefulShutdown);
    process.on("SIGINT", gracefulShutdown);
  }

  async closeAllConnections() {
    console.log("Closing all database connections...");
    try {
      // Close main db connection
      if (this.db && !this.db.connectionManager.isClosed) {
        await this.db.close();
      }

      // Close all provider connections
      await this.closePreviousConnections();
    } catch (error) {
      console.error("Error during shutdown:", error);
    }
  }

  // Calculate Fibonacci delay for retry attempt
  static getFibonacciDelay(attemptNumber) {
    if (attemptNumber <= 0) return 1;
    if (attemptNumber === 1) return 2;

    let a = 1;
    let b = 2;
    for (let i = 2; i <= attemptNumber; i += 1) {
      const temp = a + b;
      a = b;
      b = temp;
    }
    return b;
  }

  // Schedule a retry for a specific domain using Fibonacci backoff
  scheduleRetryForDomain(domain, attemptNumber = 0) {
    // Clear any existing timeout for this domain
    const existingTimeout = this.retryTimeouts.get(domain);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    const delaySeconds = ProviderSettings.getFibonacciDelay(attemptNumber);
    console.log(
      `Scheduling retry ${
        attemptNumber + 1
      } for domain ${domain} in ${delaySeconds} seconds`
    );

    const timeout = setTimeout(async () => {
      try {
        console.log(
          `Attempting connection retry ${
            attemptNumber + 1
          } for domain: ${domain}`
        );
        await this.refreshProviders();

        // Clear timeout on successful refresh
        this.retryTimeouts.delete(domain);

        console.log(`Connection retry successful for domain: ${domain}`);
      } catch (error) {
        console.error(
          `Connection retry ${attemptNumber + 1} failed for domain ${domain}:`,
          error.message
        );

        // Schedule next retry with next Fibonacci number
        this.scheduleRetryForDomain(domain, attemptNumber + 1);
      }
    }, delaySeconds * 1000);

    this.retryTimeouts.set(domain, timeout);
  }

  // Singleton pattern
  static getInstance({ db_logging } = {}) {
    if (ProviderSettings.instance === undefined) {
      ProviderSettings.instance = new ProviderSettings({ db_logging });
    }
    return ProviderSettings.instance;
  }

  providersToArray() {
    return Object.values(this.providers);
  }

  async getProviderSettings({ domain, provider_public_token, provider_token }) {
    if (provider_public_token || provider_token) {
      return this.getProviderSettingsByToken({
        provider_public_token,
        provider_token,
      });
    }

    console.log("domain", domain);

    // If we're currently refreshing connections, wait for completion
    if (this.isRefreshing) {
      console.log(`Waiting for refresh to complete for domain: ${domain}`);
      await new Promise((resolve) => this.refreshQueue.push(resolve));
    }

    let providerSettings = this.providers[domain];

    if (!providerSettings) {
      // Avoid multiple requests from same errored domain
      if (this.erroredDomains.includes(domain)) {
        throw new CustomError("Unauthorized domain", 401);
      }

      await this.refreshProviders();
      providerSettings = this.providers[domain];

      if (!providerSettings) {
        if (!this.erroredDomains.includes(domain)) {
          this.erroredDomains.push(domain);
        }

        throw new CustomError("Unauthorized domain", 401);
      }
    }

    try {
      // Check if connection manager is closed
      if (providerSettings.db.connectionManager.isClosed) {
        console.log(
          `Connection manager closed for ${domain}, scheduling retries...`
        );
        this.scheduleRetryForDomain(domain, 0);
        throw new CustomError("Database connection unavailable", 503);
      }

      // Verify connection is still valid with timeout
      await Promise.race([
        providerSettings.db.authenticate(),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Connection timeout")),
            this.connectionTimeout
          )
        ),
      ]);

      // Clear any pending retry timeout since connection is working
      const existingTimeout = this.retryTimeouts.get(domain);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
        this.retryTimeouts.delete(domain);
      }

      return providerSettings;
    } catch (error) {
      console.warn(
        `Connection validation failed for ${domain}:`,
        error.message
      );

      // Schedule Fibonacci retries
      this.scheduleRetryForDomain(domain, 0);
      throw new CustomError("Database connection unavailable", 503);
    }
  }

  async getProviderSettingsByToken({
    provider_public_token,
    provider_token,
    tried = false,
  }) {
    const providers = this.providersToArray();

    const providerSettings = providers.find(
      (o) =>
        o.settings.provider_public_token === provider_public_token ||
        o.settings.provider_token === provider_token
    );

    if (!providerSettings) {
      if (tried) {
        throw new CustomError("Unauthorized token", 401);
      }

      await this.refreshProviders();

      return this.getProviderSettingsByToken({
        provider_public_token,
        provider_token,
        tried: true,
      });
    }

    return providerSettings;
  }

  async refreshProviders() {
    // If already refreshing, wait for completion
    if (this.isRefreshing) {
      console.log("Refresh already in progress, waiting...");
      await new Promise((resolve) => this.refreshQueue.push(resolve));
      return;
    }

    this.isRefreshing = true;
    console.log("Starting provider refresh...");

    try {
      const today = moment().format("YYYY-MM-DD");
      const [providers] = await this.db.query(`
      SELECT * FROM provider WHERE active_until > "${today}";
    `);

      await this.createProvidersHashMap(providers);

      // Notify all waiting requests that refresh is complete
      this.refreshQueue.forEach((resolve) => resolve());
      this.refreshQueue = [];
    } catch (error) {
      console.error("Error during refresh:", error);
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  async createProvidersHashMap(providersSettings) {
    console.log("Creating new provider connections...");

    // Create new connections before closing old ones
    const newConnections = {};
    const connectionPromises = [];

    for (const settings of providersSettings) {
      const connectionPromise = this.createSingleConnection(settings)
        .then((connection) => {
          if (connection) {
            newConnections[settings.domain] = connection;
            console.log(
              `Connection setup completed for domain: ${settings.domain}`
            );
          }
        })
        .catch((error) => {
          console.error(
            `Failed to create connection for domain ${settings.domain}:`,
            error.message
          );
          // Don't throw, just skip this connection
        });

      connectionPromises.push(connectionPromise);
    }

    // Wait for all connection attempts to complete
    await Promise.allSettled(connectionPromises);

    // Only after all new connections are attempted, close old ones
    await this.closePreviousConnections();
    this.providers = newConnections;

    console.log(
      `Successfully created ${Object.keys(newConnections).length} out of ${
        providersSettings.length
      } connections`
    );

    // Start connection monitoring for the new providers
    if (Object.keys(newConnections).length > 0) {
      this.connectionMonitor.startMonitoring(newConnections);
    }
  }

  async createSingleConnection(settings) {
    try {
      console.log(`Initializing connection for domain: ${settings.domain}`);
      const db = new Sequelize(
        settings.db_name,
        settings.db_user,
        settings.db_password,
        {
          ...config,
          host: settings.db_host,
          logging: this.logging,
          pool: {
            max: 10,
            min: 2,
            acquire: 20000, // Consistent with main config
            idle: 10000,
            evict: 10000,
            handleDisconnects: true,
          },
        }
      );

      // Test the connection before proceeding with timeout
      await Promise.race([
        db.authenticate(),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Connection timeout during setup")),
            25000 // Increased timeout for setup
          )
        ),
      ]);

      console.log(`Connection authenticated for domain: ${settings.domain}`);

      const models = await registerModels(db, settings);
      const jwt = new JWT(settings.jwt_token);

      const {
        provider_settings,
        signRequest,
        mailer,
        stripe,
      } = await ProviderSettings.getProviderSettings({
        models,
        domain: settings.domain,
      });

      const controllers = registerControllers({
        models,
        signRequest,
        mailer,
        stripe,
        jwt,
        settings: {
          ...settings,
          ...provider_settings,
        },
        refreshProviders: this.refreshProviders.bind(this),
      });

      return {
        settings: {
          ...settings,
          ...provider_settings,
        },
        db,
        models,
        controllers,
        signRequest,
        mailer,
        stripe,
        jwt,
      };
    } catch (error) {
      console.error(
        `Error setting up connection for domain ${settings.domain}:`,
        error
      );
      throw error;
    }
  }

  static async getProviderSettings({ models, domain, aws_ses }, tries = 2) {
    let mailer = {};
    // TO-DO: Implement Stripe
    // let stripe = {};

    if (tries <= 0) {
      return {
        provider_settings: {},
        mailer,
        // stripe,
      };
    }

    try {
      const mailer_settings = await models.mailer.findOne({
        where: {
          is_default: true,
        },
      });

      // const provider_settings = await models.provider_setting.getLastRecord();

      // stripe = new Stripe({
      //   frontend_url: domain,
      //   secret_key: provider_settings?.stripe_secret,
      // });

      mailer = aws_ses.registerMailer({
        identity: mailer_settings?.identity,
        sender_name: mailer_settings?.sender_name,
      });

      return {
        // provider_settings: provider_settings?.toJSON() || {},
        mailer,
        // stripe,
      };
    } catch (error) {
      return ProviderSettings.getProviderSettings(
        {
          models,
          domain,
          aws_ses,
        },
        tries - 1
      );
    }
  }

  async closePreviousConnections() {
    console.log("Starting to close previous connections...");
    const closePromises = [];

    Object.entries(this.providers).forEach(([domain, provider]) => {
      const closePromise = ProviderSettings.closeSingleConnection(
        domain,
        provider
      );
      closePromises.push(closePromise);
    });

    try {
      await Promise.allSettled(closePromises);
      console.log("All previous connections have been closed");
    } catch (error) {
      console.error("Error while closing previous connections:", error);
      // Don't throw, allow new connections to be established
    }
  }

  static async closeSingleConnection(domain, provider) {
    try {
      if (!provider || !provider.db) {
        console.log(`No database connection to close for domain: ${domain}`);
        return;
      }

      // Check if connection is already closed
      if (provider.db.connectionManager.isClosed) {
        console.log(`Connection already closed for domain: ${domain}`);
        return;
      }

      console.log(`Closing connection for domain: ${domain}`);

      // Set a timeout for the close operation
      await Promise.race([
        provider.db.close(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Close timeout")), 10000)
        ),
      ]);

      console.log(`Connection closed successfully for domain: ${domain}`);
    } catch (error) {
      console.error(`Error closing connection for ${domain}:`, error.message);

      // Force close if regular close failed
      try {
        if (
          provider.db &&
          provider.db.connectionManager &&
          !provider.db.connectionManager.isClosed
        ) {
          console.log(`Force closing connection for ${domain}`);
          provider.db.connectionManager.close();
        }
      } catch (forceError) {
        console.error(
          `Force close also failed for ${domain}:`,
          forceError.message
        );
      }
    }
  }
};
