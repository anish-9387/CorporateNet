import { app } from './app';
import { config } from './config';
import { connectDatabase } from './utils/database';
import { logger } from './utils/logger';

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    const server = app.listen(config.port, () => {
      logger.info({ port: config.port, env: config.nodeEnv }, 'Server started');
    });

    const shutdown = async (signal: string) => {
      logger.info({ signal }, 'Shutting down');
      server.close(async () => {
        await import('./utils/database').then(({ disconnectDatabase }) => disconnectDatabase());
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