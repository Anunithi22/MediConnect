// swagger.routes.js – expose OpenAPI docs via swagger-ui-express
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '../swagger.js';

const router = express.Router();

// Serve JSON spec
router.get('/json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Serve UI
router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default router;
