module.exports = class DbTransaction {
  constructor(models) {
    this.models = models;
  }

  async handleTransaction(callback) {
    const transactionId = Math.random().toString(36).substring(7);
    console.log(`[Transaction ${transactionId}] Starting transaction`);

    // Check if connection manager is closed before starting transaction
    if (this.models.sequelize.connectionManager.isClosed) {
      const error = new Error('Database connection manager is closed');
      error.code = 'CONNECTION_CLOSED';
      throw error;
    }

    try {
      const result = await this.models.sequelize.transaction(
        async (transaction) => {
          try {
            console.log(`[Transaction ${transactionId}] Executing callback`);
            const callbackResult = await callback(transaction);
            console.log(
              `[Transaction ${transactionId}] Callback completed successfully`,
            );
            return callbackResult;
          } catch (error) {
            console.error(
              `[Transaction ${transactionId}] Error in transaction callback:`,
              error,
            );
            throw error;
          }
        },
      );

      console.log(
        `[Transaction ${transactionId}] Transaction committed successfully`,
      );
      return result;
    } catch (error) {
      // Enhanced error logging with connection state
      const connectionState = this.getConnectionState();

      console.error(`[Transaction ${transactionId}] Transaction failed:`, {
        error: error.message,
        stack: error.stack,
        connectionState,
        isClosed: this.models.sequelize.connectionManager.isClosed,
      });

      // Check if error is related to closed connection
      if (DbTransaction.isConnectionError(error)) {
        error.code = 'CONNECTION_ERROR';
        error.message = `Database connection error: ${error.message}`;
      }

      throw error;
    }
  }

  getConnectionState() {
    try {
      if (this.models.sequelize.connectionManager.isClosed) {
        return 'Connection manager is closed';
      }

      if (this.models.sequelize.connectionManager.pool) {
        const { pool } = this.models.sequelize.connectionManager;
        return {
          total: pool.size,
          available: pool.available,
          pending: pool.pending,
        };
      }

      return 'No pool information available';
    } catch (error) {
      return `Error getting connection state: ${error.message}`;
    }
  }

  static isConnectionError(error) {
    const connectionErrorPatterns = [
      /ConnectionManager\.getConnection was called after the connection manager was closed/,
      /Connection terminated/,
      /Connection lost/,
      /ECONNRESET/,
      /ECONNREFUSED/,
      /ETIMEDOUT/,
      /PROTOCOL_CONNECTION_LOST/,
      /CONNECTION_ERROR/,
      /ConnectionError/,
      /TimeoutError/,
    ];

    return connectionErrorPatterns.some((pattern) =>
      pattern.test(error.message),
    );
  }
};
