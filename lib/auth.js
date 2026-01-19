import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { headers } from 'next/headers';
import { getAuth } from 'firebase-admin/auth';


const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required but not defined. Please add it to your .env.local file.');
}

/**
 * Generate a JWT token for a user
 * @param {Object} user - User object with id, email, name
 * @returns {string} JWT token with 7-day expiry
 */
export function generateToken(user) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  const payload = {
    userId: user.id,
    email: user.email,
    name: user.name,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Verify and decode a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
export function verifyToken(token) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw error;
  }
}

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
export async function hashPassword(password) {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compare a plain text password with a hashed password
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} True if passwords match
 */
export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Extract and verify Bearer token from Authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is missing or invalid
 */
export function authenticateRequest(authHeader) {
  if (!authHeader) {
    throw new Error('Authorization header is required');
  }

  if (!authHeader.startsWith('Bearer ')) {
    throw new Error('Invalid authorization header format. Use: Bearer <token>');
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  if (!token) {
    throw new Error('Token is required');
  }

  return verifyToken(token);
}
