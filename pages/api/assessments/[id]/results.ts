import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken, extractTokenFromHeader } from '../../../../lib/auth';
import { queryOne, queryMany } from '../../../../lib/db';
import { sendSuccess, sendError, isValidUUID } from '../../../../lib/utils';
import { logger } from '../../../../lib/logger';
import { Assessment } from '../../../../lib/schema';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  // Validate ID format
  if (!id || !isValidUUID(String(id))) {
    return sendError(res, 'Invalid assessment ID', 400);
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return sendError(res, 'Method not allowed', 405);
  }

  // Extract and verify token
  const authHeader = req.headers.authorization;
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    return sendError(res, 'No token provided', 401);
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return sendError(res, 'Invalid or expired token', 401);
  }

  const userId = payload.userId;

  try {
    // Check if assessment exists and belongs to user
    const assessment = await queryOne<Assessment>(
      `SELECT * FROM assessments WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (!assessment) {
      return sendError(res, 'Assessment not found', 404);
    }

    // Get responses
    const responses = await queryMany(
      `SELECT id, assessment_id, respondent_email, respondent_name, status, score, percentage, 
              started_at, completed_at, time_taken_seconds, created_at
       FROM assessment_responses 
       WHERE assessment_id = $1 
       ORDER BY created_at DESC`,
      [id]
    );

    logger.info('Assessment results fetched', {
      userId,
      assessmentId: id,
      responseCount: responses.length,
    });

    return sendSuccess(
      res,
      { assessment, responses },
      'Results retrieved',
      200
    );
  } catch (error) {
    logger.error('Failed to fetch assessment results', error);
    return sendError(res, 'Internal server error', 500);
  }
}
