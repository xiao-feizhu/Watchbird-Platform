/**
 * In-memory store for verification codes with automatic expiry
 * TODO: Replace with Redis in production
 */

interface VerificationCodeEntry {
  code: string
  expiresAt: number
}

const verificationCodes = new Map<string, VerificationCodeEntry>()

const CODE_EXPIRY_MS = 5 * 60 * 1000 // 5 minutes

/**
 * Store verification code for a phone number
 */
export function storeVerificationCode(phone: string, code: string): void {
  const expiresAt = Date.now() + CODE_EXPIRY_MS
  verificationCodes.set(phone, { code, expiresAt })
}

/**
 * Get and verify code for a phone number
 * Returns true if code matches and hasn't expired, false otherwise
 */
export function verifyCode(phone: string, code: string): boolean {
  const entry = verificationCodes.get(phone)

  if (!entry) {
    return false
  }

  if (Date.now() > entry.expiresAt) {
    verificationCodes.delete(phone)
    return false
  }

  if (entry.code !== code) {
    return false
  }

  // Delete code after successful verification (one-time use)
  verificationCodes.delete(phone)
  return true
}

/**
 * Clean up expired codes (can be called periodically)
 */
export function cleanupExpiredCodes(): void {
  const now = Date.now()
  const entries = Array.from(verificationCodes.entries())
  for (const [phone, entry] of entries) {
    if (entry.expiresAt < now) {
      verificationCodes.delete(phone)
    }
  }
}
