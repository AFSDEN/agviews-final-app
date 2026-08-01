import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken, extractTokenFromHeader } from '../../../lib/auth';
import { query, queryOne, queryMany } from '../../../lib/db';
import { sendSuccess, sendError, isValidUUID } from '../../../lib/utils';
import { logger } from '../../../lib/logger';
import { Assessment } from '../../../lib/schema';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  // Validate ID format
  if (!id || !isValidUUID(String(id))) {
    return sendError(res, 'Invalid assessment ID', 400);
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

  // GET - Fetch specific assessment
  if (req.method === 'GET') {
    try {
      const assessment = await queryOne<Assessment>(
        `SELECT * FROM assessments 
         WHERE id = $1 AND user_id = $2`,
        [id, userId]
      );

      if (!assessment) {
        return sendError(res, 'Assessment not found', 404);
      }

      // Get questions
      const questions = await queryMany(
        `SELECT id, assessment_id, question_text, question_type, options, correct_answer, points, "order"
         FROM assessment_questions 
         WHERE assessment_id = $1 
         ORDER BY "order" ASC`,
        [id]
      );

      logger.info('Assessment retrieved', { userId, assessmentId: id });

      return sendSuccess(
        res,
        { assessment, questions },
        'Assessment retrieved',
        200
      );
    } catch (error) {
      logger.error('Failed to fetch assessment', error);
      return sendError(res, 'Internal server error', 500);
    }
  }

  // PUT - Update assessment
  if (req.method === 'PUT') {
    try {
      const { title, description, status, passingScore } = req.body;

      // Check if assessment exists and belongs to user
      const assessment = await queryOne<Assessment>(
        `SELECT * FROM assessments WHERE id = $1 AND user_id = $2`,
        [id, userId]
      );

      if (!assessment) {
        return sendError(res, 'Assessment not found', 404);
      }

      // Update assessment
      const updated = await queryOne<Assessment>(
        `UPDATE assessments 
         SET title = COALESCE($1, title), 
             description = COALESCE($2, description),
             status = COALESCE($3, status),
             passing_score = COALESCE($4, passing_score),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $5 AND user_id = $6
         RETURNING *`,
        [
          title || null,
          description || null,
          status || null,
          passingScore || null,
          id,
          userId,
        ]
      );

      logger.info('Assessment updated', { userId, assessmentId: id });

      return sendSuccess(res, { assessment: updated }, 'Assessment updated', 200);
    } catch (error) {
      logger.error('Failed to update assessment', error);
      return sendError(res, 'Internal server error', 500);
    }
  }

  // DELETE - Delete assessment
  if (req.method === 'DELETE') {
    try {
      // Check if assessment exists and belongs to user
      const assessment = await queryOne<Assessment>(
        `SELECT * FROM assessments WHERE id = $1 AND user_id = $2`,
        [id, userId]
      );

      if (!assessment) {
        return sendError(res, 'Assessment not found', 404);
      }

      // Delete questions first (cascade)
      await query('DELETE FROM assessment_questions WHERE assessment_id = $1', [id]);

      // Delete responses
      await query('DELETE FROM assessment_responses WHERE assessment_id = $1', [id]);

      // Delete assessment
      await query('DELETE FROM assessments WHERE id = $1 AND user_id = $2', [id, userId]);

      logger.info('Assessment deleted', { userId, assessmentId: id });

      return sendSuccess(res, { id }, 'Assessment deleted', 200);
    } catch (error) {
      logger.error('Failed to delete assessment', error);
      return sendError(res, 'Internal server error', 500);
    }
  }

  return sendError(res, 'Method not allowed', 405);
}
