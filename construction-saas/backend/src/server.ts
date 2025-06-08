import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { config } from './config';
import { errorHandler } from './api/middlewares/error.middleware';
import { apiRouter } from './api/routes';
import { prisma } from './core/database/prisma';
import { logger } from './core/utils/logger';
import { createServer } from 'http';
import { initializeSocketIO } from './core/services/socket.service';
import path from 'path';


class Server {
  private app: Application;
  private port: number;
  private httpServer: any;

  constructor() {
    this.app = express();
    this.port = config.port;
    this.httpServer = createServer(this.app);
  }

  private async initializeMiddlewares() {
    this.app.use(helmet());
    this.app.use(cors(config.cors));
    this.app.use(compression());
    this.app.use(morgan('combined'));
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    if (config.upload.localStorage) {
      this.app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
    }
  }

  private async initializeRoutes() {
    // Health check
    this.app.get('/health', (_req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // API routes
    this.app.use(`/api/${config.apiVersion}`, apiRouter);

    // 404 handler - Express v5 compatible
    this.app.use((req, res) => {
      res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    });

    // Error handling (must be last)
    this.app.use(errorHandler);
  }

  private async initializeDatabase() {
    try {
      await prisma.$connect();
      logger.info('Database connected successfully');
    } catch (error) {
      logger.error('Database connection failed:', error);
      process.exit(1);
    }
  }

  public async start() {
    await this.initializeDatabase();
    await this.initializeMiddlewares();
    await this.initializeRoutes();
    
    // Initialize WebSocket
    initializeSocketIO(this.httpServer);

    this.httpServer.listen(this.port, () => {
      logger.info(`Server running on port ${this.port} in ${config.env} mode`);
    });
  }
}

// Start server
const server = new Server();
server.start().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});