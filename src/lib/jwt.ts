import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { User } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compare a password with its hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a JWT token
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Register a new user with email/password
 */
export async function registerUser(
  email: string,
  password: string,
  name: string
): Promise<{ user: User; token: string } | null> {
  try {
    // Check if user already exists
    const existingUser = await query<User>('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.length > 0) {
      throw new Error('User already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const result = await query<User>(
      `INSERT INTO users (email, name, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [email, name, passwordHash, 'customer']
    );

    const user = result[0];
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return { user, token };
  } catch (error) {
    console.error('Error registering user:', error);
    return null;
  }
}

/**
 * Login user with email/password
 */
export async function loginUser(
  email: string,
  password: string
): Promise<{ user: User; token: string } | null> {
  try {
    // Get user with password hash
    const result = await query<User & { password_hash: string }>(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.length === 0) {
      throw new Error('Invalid credentials');
    }

    const user = result[0];

    // Check password
    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Return user without password_hash
    const { password_hash, ...userWithoutPassword } = user;
    return { user: userWithoutPassword as User, token };
  } catch (error) {
    console.error('Error logging in user:', error);
    return null;
  }
}

/**
 * Get user from JWT token
 */
export async function getUserFromToken(token: string): Promise<User | null> {
  const payload = verifyToken(token);
  if (!payload) return null;

  const result = await query<User>('SELECT * FROM users WHERE id = $1', [payload.userId]);
  return result[0] || null;
}
