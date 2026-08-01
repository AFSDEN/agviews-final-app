import { NextApiRequest, NextApiResponse } from 'next';
import { createUser, createToken, getUserByEmail } from '../../../lib/auth';
import { sendSuccess, sendError, isValidEmail, isValidPassword } from '../../../lib/utils';
import { logger } from '../../../lib/logger';

interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
}

interface RegisterResponse {
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
    const { email, password, firstName, lastName, companyName } =
      req.body as RegisterRequest;

    // Validation
    if (!email || !password) {
      return sendError(res, 'Email and password are required', 400);
    }

    if (!isValidEmail(email)) {
      return sendError(res, 'Invalid email format', 400);
    }

    if (!isValidPassword(password)) {
      return sendError(
        res,
        'Password must be at least 8 characters with uppercase, lowercase, and numbers',
        400
      );
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      logger.warn('Registration attempt with existing email', { email });
      return sendError(res, 'Email already registered', 409);
    }

    // Create user
    const user = await createUser(email, password, firstName, lastName, companyName);

    logger.info('New user registered', { userId: user.id, email });

    // Create JWT token
    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Set HTTP-only cookie
    res.setHeader(
      'Set-Cookie',
      `auth_token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`
    );

    return sendSuccess<RegisterResponse>(
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
      'Registration successful',
      201
    );
  } catch (error) {
    logger.error('Registration error', error);
    return sendError(res, 'Internal server error', 500);
  }
}
