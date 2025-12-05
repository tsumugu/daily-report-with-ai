import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { usersDb } from '../db/users.db.js';
import { User, toUserResponse } from '../models/user.model.js';
import {
  generateToken,
  authMiddleware,
  AuthenticatedRequest,
} from '../middleware/auth.middleware.js';

export const authRouter = Router();

const SALT_ROUNDS = 10;

/**
 * POST /api/auth/signup
 * 新規ユーザー登録
 */
authRouter.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // バリデーション
    if (!email || !password) {
      res.status(400).json({ message: 'メールアドレスとパスワードは必須です' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ message: 'パスワードは8文字以上で入力してください' });
      return;
    }

    // メール形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ message: '有効なメールアドレスを入力してください' });
      return;
    }

    // 重複チェック
    if (usersDb.existsByEmail(email)) {
      res.status(400).json({ message: 'このメールアドレスは既に登録されています' });
      return;
    }

    // パスワードハッシュ化
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // ユーザー作成
    const now = new Date().toISOString();
    const user: User = {
      id: uuidv4(),
      email,
      passwordHash,
      createdAt: now,
      updatedAt: now,
    };

    usersDb.save(user);

    // トークン生成（自動ログイン）
    const token = generateToken(user.id, user.email);

    res.status(201).json({
      user: toUserResponse(user),
      token,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

/**
 * POST /api/auth/login
 * ログイン
 */
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // バリデーション
    if (!email || !password) {
      res.status(400).json({ message: 'メールアドレスとパスワードは必須です' });
      return;
    }

    // ユーザー検索
    const user = usersDb.findByEmail(email);
    if (!user) {
      res.status(401).json({ message: 'メールアドレスまたはパスワードが正しくありません' });
      return;
    }

    // パスワード検証
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ message: 'メールアドレスまたはパスワードが正しくありません' });
      return;
    }

    // トークン生成
    const token = generateToken(user.id, user.email);

    res.status(200).json({
      user: toUserResponse(user),
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

/**
 * POST /api/auth/logout
 * ログアウト
 */
authRouter.post('/logout', (_req: Request, res: Response) => {
  // JWTはステートレスなので、サーバー側での処理は不要
  // クライアント側でトークンを削除する
  res.status(200).json({ message: 'ログアウトしました' });
});

/**
 * GET /api/auth/me
 * ログイン中のユーザー情報を取得
 */
authRouter.get('/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '認証が必要です' });
      return;
    }

    const user = usersDb.findById(req.user.id!);
    if (!user) {
      res.status(404).json({ message: 'ユーザーが見つかりません' });
      return;
    }

    res.status(200).json(toUserResponse(user));
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

