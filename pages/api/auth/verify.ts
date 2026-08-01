import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken, extractTokenFromHeader, getUserById } from '../../../lib/auth';
import { sendSuccess, sendError } from '../../../lib/utils';
import { logger } from '../../../lib/logger';

interface VerifyResponse {
  user: {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    role: string;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET and POST requests
  if (req.method !== 'GET' && req.method !== 'POST') {
    return sendError(res, 'Method not allowed', 405);
  }

  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return sendError(res, 'No token provided', 401);
    }

    // Verify token
    const payload = await verifyToken(token);
    if (!payload) {
      return sendError(res, 'Invalid or expired token', 401);
    }

    // Get user from database
    const user = await getUserById(payload.userId);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Check if user is active
    if (user.status !== 'active') {
      return sendError(res, 'Account is not active', 403);
    }

    logger.debug('Token verified', { userId: user.id });

    return sendSuccess<VerifyResponse>(
      res,
      {
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
        },
      },
      'Token verified',
      200
    );
  } catch (error) {
    logger.error('Token verification error', error);
    return sendError(res, 'Internal server error', 500);
  }
}
