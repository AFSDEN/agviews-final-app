import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken, extractTokenFromHeader } from '../../../lib/auth';
import { query, queryMany, transaction } from '../../../lib/db';
import { sendSuccess, sendError, isValidUUID } from '../../../lib/utils';
import { logger } from '../../../lib/logger';
import { Assessment, AssessmentQuestion } from '../../../lib/schema';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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

  // GET - Fetch user's assessments
  if (req.method === 'GET') {
    try {
      const assessments = await queryMany<Assessment>(
        `SELECT id, user_id, title, description, status, assessment_type, total_questions, 
                time_limit_minutes, passing_score, created_at, updated_at, published_at
         FROM assessments 
         WHERE user_id = $1 
         ORDER BY created_at DESC`,
        [userId]
      );

      logger.info('Assessments fetched', { userId, count: assessments.length });

      return sendSuccess(res, { assessments }, 'Assessments retrieved', 200);
    } catch (error) {
      logger.error('Failed to fetch assessments', error);
      return sendError(res, 'Internal server error', 500);
    }
  }

  // POST - Create new assessment
  if (req.method === 'POST') {
    try {
      const { title, description, assessmentType, timeLimit, passingScore, questions } =
        req.body;

      // Validation
      if (!title || !title.trim()) {
        return sendError(res, 'Title is required', 400);
      }

      if (!questions || !Array.isArray(questions) || questions.length === 0) {
        return sendError(res, 'At least one question is required', 400);
      }

      // Create assessment in transaction
      const result = await transaction(async (client) => {
        // Create assessment
        const assessmentResult = await client.query(
          `INSERT INTO assessments (user_id, title, description, assessment_type, time_limit_minutes, passing_score, total_questions, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, 'draft')
           RETURNING id, user_id, title, description, status, assessment_type, total_questions, time_limit_minutes, passing_score, created_at, updated_at, published_at`,
          [
            userId,
            title.trim(),
            description || null,
            assessmentType || 'general',
            timeLimit || null,
            passingScore || 70,
            questions.length,
          ]
        );

        const assessment = assessmentResult.rows[0] as Assessment;

        // Create questions
        for (let i = 0; i < questions.length; i++) {
          const q = questions[i];
          await client.query(
            `INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, points, "order")
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              assessment.id,
              q.text || '',
              q.type || 'multiple_choice',
              q.options ? JSON.stringify(q.options) : null,
              q.correctAnswer || null,
              q.points || 1,
              i + 1,
            ]
          );
        }

        return assessment;
      });

      logger.info('Assessment created', { userId, assessmentId: result.id });

      return sendSuccess(
        res,
        { assessment: result },
        'Assessment created successfully',
        201
      );
    } catch (error) {
      logger.error('Failed to create assessment', error);
      return sendError(res, 'Internal server error', 500);
    }
  }

  return sendError(res, 'Method not allowed', 405);
}
