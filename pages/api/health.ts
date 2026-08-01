import { NextApiRequest, NextApiResponse } from 'next';
import { healthCheck } from '../../lib/db';
import { logger } from '../../lib/logger';

interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  database: 'connected' | 'disconnected';
  environment: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthResponse>
) {
  try {
    // Check database connection
    const dbConnected = await healthCheck();

    const response: HealthResponse = {
      status: dbConnected ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbConnected ? 'connected' : 'disconnected',
      environment: process.env.NODE_ENV || 'development',
    };

    const statusCode = dbConnected ? 200 : 503;
    res.status(statusCode).json(response);

    if (!dbConnected) {
      logger.warn('Health check failed - database disconnected');
    }
  } catch (error) {
    logger.error('Health check error', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'disconnected',
      environment: process.env.NODE_ENV || 'development',
    });
  }
}
