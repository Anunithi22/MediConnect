// swagger.js – generates OpenAPI spec for MediConnect APIs using swagger-jsdoc
import swaggerJSDoc from 'swagger-jsdoc';
import { ENV } from './config/env.js';

// Basic API info – can be extended later.
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'MediConnect API',
    version: '1.0.0',
    description: 'API documentation for MediConnect – healthcare discovery, appointments, reviews, notifications, and AI matching.',
  },
  servers: [
    {
      url: ENV.NODE_ENV === 'production' ? process.env.API_BASE_URL || '/api' : 'http://localhost:5000/api',
      description: ENV.NODE_ENV === 'production' ? 'Production server' : 'Local development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [{ bearerAuth: [] }],
};

// Paths are generated from JSDoc comments in source files (routes/controllers).
const options = {
  definition: swaggerDefinition,
  // Glob pattern – look in the src folder for .js files with JSDoc @openapi tags.
  apis: ['./src/**/*.js'],
};

export const swaggerSpec = swaggerJSDoc(options);
