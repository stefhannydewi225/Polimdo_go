import crypto from 'crypto';

/**
 * Menghasilkan token sesi acak menggunakan crypto.randomBytes.
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Melakukan hashing token menggunakan algoritma SHA-256.
 * Disimpan di database untuk mencegah kebocoran token langsung.
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Membandingkan token mentah dengan token ter-hash secara aman menggunakan timingSafeEqual.
 */
export function compareToken(token: string, hashedToken: string): boolean {
  try {
    const hashedInput = hashToken(token);
    return crypto.timingSafeEqual(
      Buffer.from(hashedInput, 'hex'),
      Buffer.from(hashedToken, 'hex')
    );
  } catch (error) {
    return false;
  }
}
