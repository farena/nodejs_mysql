const Sequelize = require("sequelize");
const registerModels = require("../../models/index");
const registerControllers = require("../injectors/index");
const JWT = require("./jwt");
const Mailer = require("./mailer");

const env = process.env.NODE_ENV || "development";
const { username, password, database, ...config } =
  require("../../config/db.config")[env];

module.exports = class ProviderSettings {
  // Constructor is only called inside getInstance function
  constructor({ db_logging } = {}) {
    this.provider = null;
    this.logging = db_logging !== undefined ? db_logging : config.logging;

    // Handle process cleanup
    this.setupGracefulShutdown();
  }

  setupGracefulShutdown() {
    const gracefulShutdown = async () => {
      console.log("Graceful shutdown initiated...");

      await this.closeConnection();
      process.exit(0);
    };

    process.on("SIGTERM", gracefulShutdown);
    process.on("SIGINT", gracefulShutdown);
  }

  // Singleton pattern
  static getInstance({ db_logging } = {}) {
    if (ProviderSettings.instance === undefined) {
      ProviderSettings.instance = new ProviderSettings({ db_logging });
    }
    return ProviderSettings.instance;
  }

  async getProviderSettings() {
    if (!this.provider) {
      await this.createConnection();
    }

    return this.provider;
  }

  async refreshConnection() {
    await this.closeConnection();
    await this.createConnection();
  }

  async createConnection() {
    try {
      const db = new Sequelize(database, username, password, {
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

      const models = await registerModels(db);
      const jwt = new JWT(process.env.JWT_SECRET_KEY);
      const mailer = new Mailer({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        user: process.env.MAIL_USER,
        password: process.env.MAIL_PWD,
        from: process.env.MAIL_FROM,
      });

      const settings = {
        slug: "default",
        // Base URL used to build links sent by email
        domain: (process.env.FRONTEND_URL || process.env.BACKEND_URL || "").replace(
          /\/$/,
          ""
        ),
      };

      const instances = {
        db,
        settings,
        models,
        mailer,
        jwt,
        refreshConnection: this.refreshConnection.bind(this),
      };

      const controllers = registerControllers(instances);

      this.provider = {
        ...instances,
        controllers,
      };
    } catch (error) {
      console.error(`Error setting up connection:`, error);
      throw error;
    }
  }

  async closeConnection() {
    try {
      if (!this.provider || !this.provider.db) {
        console.log(`No database connection to close`);
        return;
      }

      // Check if connection is already closed
      if (this.provider.db.connectionManager.isClosed) {
        console.log(`Connection already closed`);
        return;
      }

      console.log(`Closing connection`);

      // Set a timeout for the close operation
      await Promise.race([
        this.provider.db.close(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Close timeout")), 10000)
        ),
      ]);

      console.log(`Connection closed successfully`);
    } catch (error) {
      console.error(`Error closing connection:`, error.message);

      // Force close if regular close failed
      try {
        if (
          this.provider.db &&
          this.provider.db.connectionManager &&
          !this.provider.db.connectionManager.isClosed
        ) {
          console.log(`Force closing connection`);
          this.provider.db.connectionManager.close();
        }
      } catch (forceError) {
        console.error(`Force close also failed:`, forceError.message);
      }
    }
  }
};
