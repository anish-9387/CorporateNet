import { app } from './app';
import { config } from './config';
import { connectDatabase } from './utils/database';
import { logger } from './utils/logger';

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    const host = process.env.HOST ?? '0.0.0.0';
    const server = app.listen(config.port, host, () => {
      logger.info({ port: config.port, host, env: config.nodeEnv }, 'Server started');
    });

    server.on('error', (err) => {
      logger.error({ err }, 'Server error');
    });

    server.on('listening', () => {
      const address = server.address();
      logger.info({ address }, 'Server is listening');
    });

    server.on('close', () => {
      logger.info('Server closed');
    });

    // Handle unhandled rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error({ reason, promise }, 'Unhandled Rejection');
    });

    process.on('uncaughtException', (error) => {
      logger.error({ err: error }, 'Uncaught Exception');
      process.exit(1);
    });

    const shutdown = async (signal: string) => {
      logger.info({ signal }, 'Shutting down');
      server.close(async () => {
        await import('./utils/database.js').then(({ disconnectDatabase }) => disconnectDatabase());
        process.exit(0);
      });

      setTimeout(() => {
        logger.error('Forced shutdown');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    logger.error({ err: error }, 'Failed to start server');
    process.exit(1);
  }
};

startServer();