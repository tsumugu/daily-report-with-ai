import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * JWTペイロード型
 */
export interface JwtPayload {
  userId: string;
  email: string;
}

/**
 * 認証済みリクエスト型
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
  };
}

/**
 * JWTトークンを生成
 */
export function generateToken(userId: string, email?: string): string {
  const payload: JwtPayload = { userId, email: email || '' };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * JWTトークンを検証
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * 認証ミドルウェア
 */
export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: '認証が必要です' });
    return;
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);

  if (!payload) {
    res.status(401).json({ message: 'トークンが無効です' });
    return;
  }

  req.user = {
    id: payload.userId,
    email: payload.email,
  };
  next();
}

