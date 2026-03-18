import crypto from 'crypto';

// Хэшируем пароль через sha256
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Сравниваем пароль с хэшем
export function comparePassword(
  password: string,
  hash: string
): boolean {
  const inputHash = hashPassword(password);
  return inputHash === hash;
}