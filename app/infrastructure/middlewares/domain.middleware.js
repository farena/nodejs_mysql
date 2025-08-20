const ProviderSettings = require("../libs/providerSettings.js");

module.exports = async (req, res, next) => {
  try {
    // Add Default provider token for CRON TASKS
    const cronTaskToken = process.env.CRON_TASK_TOKEN || "599ec2df03ab";
    if (req.headers["x-provider-token"] === cronTaskToken) {
      return next();
    }

    const providerSettings = ProviderSettings.getInstance();

    const domain = req.headers.origin?.split("//").pop() || "default";
    const provider_public_token = req.headers["x-provider-public-token"];
    const provider_token =
      req.headers["x-provider-token"] || req.query.x_provider_token;

    let providerSettingsData;
    try {
      providerSettingsData = await providerSettings.getProviderSettings({
        domain,
        provider_public_token,
        provider_token,
      });
    } catch (error) {
      // Handle specific database connection errors
      if (error.message && error.message.includes("Database connection")) {
        console.error(
          `Database connection error for domain ${domain}:`,
          error.message
        );

        // Return 503 Service Unavailable for database issues
        return res.status(503).json({
          code: 503,
          message:
            "Service temporarily unavailable. Database connection issues.",
          success: false,
          data: [],
          error: "DATABASE_CONNECTION_ERROR",
        });
      }

      // Handle authentication/authorization errors
      if (error.status === 401 || error.message.includes("Unauthorized")) {
        return res.status(401).json({
          code: 401,
          message: "Unauthorized access",
          success: false,
          data: [],
          error: "UNAUTHORIZED",
        });
      }

      // For other errors, log and return generic error
      console.error(
        `Error getting college settings for domain ${domain}:`,
        error
      );
      throw error;
    }

    const {
      db,
      models,
      controllers,
      settings,
      signRequest,
      mailer,
      // stripe,
      jwt,
      algolia,
    } = providerSettingsData;

    // Settings for provider
    req.settings = settings;

    // DB connection for provider
    req.db = db;

    // SignRequest connection for provider
    req.signRequest = signRequest;

    // Mailer connection for provider
    req.mailer = mailer;

    // Stripe connection for provider
    // req.stripe = stripe;

    // Algolia connection for provider
    req.algolia = algolia;

    // Jwt plugin for provider
    req.jwt = jwt;

    // Register models into req variable
    req.models = models;

    // Register controllers into req variable
    req.controllers = controllers;

    return next();
  } catch (error) {
    // Enhanced error logging
    console.error("Domain middleware error:", {
      domain: req.headers.origin?.split("//").pop(),
      error: error.message,
      stack: error.stack,
      ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress || null,
      userAgent: req.headers["user-agent"],
      requestId: req.id || "unknown",
    });

    return next(error);
  }
};
