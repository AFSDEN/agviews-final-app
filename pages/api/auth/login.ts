import { NextApiRequest, NextApiResponse } from 'next';
import { getUserByEmail, verifyPassword, createToken, updateLastLogin } from '../../../lib/auth';
import { sendSuccess, sendError } from '../../../lib/utils';
import { logger } from '../../../lib/logger';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
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
  // Only allow POST requests
  if (req.method !== 'POST') {
    return sendError(res, 'Method not allowed', 405);
  }

  try {
    const { email, password } = req.body as LoginRequest;

    // Validation
    if (!email || !password) {
      return sendError(res, 'Email and password are required', 400);
    }

    // Get user from database
    const user = await getUserByEmail(email);
    if (!user) {
      logger.warn('Login attempt with non-existent email', { email });
      return sendError(res, 'Invalid email or password', 401);
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      logger.warn('Login attempt with wrong password', { email });
      return sendError(res, 'Invalid email or password', 401);
    }

    // Check if user is active
    if (user.status !== 'active') {
      logger.warn('Login attempt with inactive user', { email, status: user.status });
      return sendError(res, 'Account is not active', 403);
    }

    // Create JWT token
    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Update last login
    await updateLastLogin(user.id);

    // Set HTTP-only cookie
    res.setHeader(
      'Set-Cookie',
      `auth_token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`
    );

    logger.info('User logged in successfully', { userId: user.id, email });

    return sendSuccess<LoginResponse>(
      res,
      {
        token,
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
        },
      },
      'Login successful',
      200
    );
  } catch (error) {
    logger.error('Login error', error);
    return sendError(res, 'Internal server error', 500);
  }
}
