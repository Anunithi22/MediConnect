import app from './app.js';
import { connectDB } from './config/db.js';
import { ENV } from './config/env.js';

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    const PORT = ENV.PORT;
    const HOST = '0.0.0.0';
    const server = app.listen(PORT, HOST, () => {
      console.log(`=================================================`);
      console.log(`  MediConnect API Server`);
      console.log(`  Mode: ${ENV.NODE_ENV}`);
      console.log(`  Listening on: http://localhost:${PORT}`);
      console.log(`  Health Check: http://localhost:${PORT}/api/health`);
      console.log(`=================================================`);
    });

    // Graceful shutdown
    const handleShutdown = (signal) => {
      console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        console.log('[Server] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));
  } catch (error) {
    console.error(`[Fatal] Failed to launch server:`, error);
    process.exit(1);
  }
};

startServer();
