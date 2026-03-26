import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.NEXTAUTH_SECRET!
const JWT_EXPIRES_IN = '7d'
const SALT_ROUNDS = 10

export interface JWTPayload {
  userId: string
  phone: string
  role: string
}

/**
 * Generate JWT token with 7-day expiry
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload
}

/**
 * Hash password with bcrypt (salt rounds: 10)
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

/**
 * Verify password against hashed password
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

/**
 * Generate 6-digit random verification code
 */
export function generateVerifyCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Validate Chinese phone number format
 * Pattern: starts with 1, followed by 3-9, then 9 digits
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}
