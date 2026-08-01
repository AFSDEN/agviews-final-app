import { jwtVerify, SignJWT } from 'jose';
import * as bcrypt from 'bcryptjs';
import { query, queryOne } from './db';
import { User } from './schema';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '24h';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Hash password with bcrypt
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Verify password against hash
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Create JWT token
export async function createToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRATION)
    .sign(JWT_SECRET);
}

// Verify and decode JWT token
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as JWTPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// Get user from database by ID
export async function getUserById(userId: string): Promise<User | null> {
  return queryOne<User>(
    'SELECT * FROM users WHERE id = $1',
    [userId]
  );
}

// Get user from database by email
export async function getUserByEmail(email: string): Promise<User | null> {
  return queryOne<User>(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
}

// Create new user
export async function createUser(
  email: string,
  password: string,
  firstName?: string,
  lastName?: string,
  companyName?: string
): Promise<User> {
  const passwordHash = await hashPassword(password);
  
  const result = await queryOne<User>(
    `INSERT INTO users (email, password_hash, first_name, last_name, company_name, role, status)
     VALUES ($1, $2, $3, $4, $5, 'user', 'active')
     RETURNING *`,
    [email, passwordHash, firstName || null, lastName || null, companyName || null]
  );

  if (!result) {
    throw new Error('Failed to create user');
  }

  return result;
}

// Update user last login
export async function updateLastLogin(userId: string): Promise<void> {
  await query(
    'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
    [userId]
  );
}

// Create session token
export async function createSession(
  userId: string,
  token: string,
  ipAddress?: string,
  userAgent?: string
): Promise<string> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 1); // 24 hours

  await query(
    `INSERT INTO sessions (user_id, token, token_expires_at, ip_address, user_agent)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, token, expiresAt, ipAddress || null, userAgent || null]
  );

  return token;
}

// Verify session exists and is valid
export async function verifySession(token: string): Promise<boolean> {
  const result = await queryOne<{ id: string }>(
    `SELECT id FROM sessions 
     WHERE token = $1 AND token_expires_at > CURRENT_TIMESTAMP`,
    [token]
  );

  return !!result;
}

// Revoke session
export async function revokeSession(token: string): Promise<void> {
  await query(
    'DELETE FROM sessions WHERE token = $1',
    [token]
  );
}

// Extract token from Authorization header
export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
}

// Check if user has permission
export function hasPermission(
  userRole: string,
  requiredRole: string | string[]
): boolean {
  if (typeof requiredRole === 'string') {
    return userRole === requiredRole || userRole === 'admin';
  }
  return requiredRole.includes(userRole) || userRole === 'admin';
}
