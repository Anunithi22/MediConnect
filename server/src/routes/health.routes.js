import { Router } from 'express';
import mongoose from 'mongoose';

const router = Router();

router.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.status(200).json({
    success: true,
    platform: 'MediConnect — AI-Assisted Doctor & Hospital Recommendation Platform',
    tagline: 'Find the Right Care, Closer to You',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    database: {
      status: dbStatus,
      name: mongoose.connection.name || 'mediconnect',
    },
    version: '1.0.0',
    disclaimer: 'MediConnect provides informational recommendations to assist in finding healthcare professionals and facilities. It does NOT provide medical diagnosis or treatment advice.',
  });
});

export default router;
