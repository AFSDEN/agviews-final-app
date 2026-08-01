import { jwtVerify, SignJWT } from 'jose';
import * as bcrypt from 'bcryptjs';
import { query, queryOne } from './db';
import { User } from './schema';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-use-env-variable-in-production'
);

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  [key: string]: any;
}

export async function generateToken(payload: any): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    // Explicitly fallback cast to satisfy strict compiler type properties
    return payload as unknown as JWTPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}
