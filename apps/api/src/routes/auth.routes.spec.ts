import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import express, { Express } from 'express';
import request from 'supertest';
import Database, { type Database as DatabaseType } from 'better-sqlite3';
import { authRouter } from './auth.routes.js';
import { UsersDatabase } from '../db/users.db.js';
import { initializeTables } from '../db/database.js';

// モジュールをモック（実際のインスタンスを返すようにする）
const mockDbInstances = {
  usersDb: null as UsersDatabase | null,
};

vi.mock('../db/users.db.js', async () => {
  const actual = await vi.importActual('../db/users.db.js');
  return {
    ...actual,
    getUsersDatabase: async () => {
      return mockDbInstances.usersDb || (actual as any).usersDb;
    },
  };
});

describe('Auth Routes', () => {
  let app: Express;
  let db: DatabaseType;
  let usersDb: UsersDatabase;

  beforeEach(() => {
    // インメモリデータベースを作成
    db = new Database(':memory:');
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeTables(db);

    // UsersDatabase インスタンスを作成
    usersDb = new UsersDatabase(db);

    // モックインスタンスを設定
    mockDbInstances.usersDb = usersDb;

    app = express();
    app.use(express.json());
    app.use('/api/auth', authRouter);
  });

  afterEach(() => {
    // モックインスタンスをクリア
    mockDbInstances.usersDb = null;
    db.close();
  });

  describe('POST /api/auth/signup', () => {
    it('正常なリクエストで201を返すこと', async () => {
      const response = await request(app).post('/api/auth/signup').send({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(201);
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.token).toBeTruthy();
    });

    it('メールアドレスがない場合、400を返すこと', async () => {
      const response = await request(app).post('/api/auth/signup').send({
        password: 'password123',
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('メールアドレスとパスワードは必須です');
    });

    it('パスワードが短い場合、400を返すこと', async () => {
      const response = await request(app).post('/api/auth/signup').send({
        email: 'test@example.com',
        password: 'short',
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('パスワードは8文字以上で入力してください');
    });

    it('無効なメールアドレス形式の場合、400を返すこと', async () => {
      const response = await request(app).post('/api/auth/signup').send({
        email: 'invalid-email',
        password: 'password123',
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('有効なメールアドレスを入力してください');
    });

    it('重複するメールアドレスの場合、400を返すこと', async () => {
      // 最初のユーザーを作成
      await request(app).post('/api/auth/signup').send({
        email: 'test@example.com',
        password: 'password123',
      });

      // 同じメールアドレスで再度登録
      const response = await request(app).post('/api/auth/signup').send({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('このメールアドレスは既に登録されています');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // テスト用ユーザーを作成
      await request(app).post('/api/auth/signup').send({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('正しい認証情報で200を返すこと', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.token).toBeTruthy();
    });

    it('存在しないメールアドレスの場合、401を返すこと', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'nonexistent@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('メールアドレスまたはパスワードが正しくありません');
    });

    it('間違ったパスワードの場合、401を返すこと', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('メールアドレスまたはパスワードが正しくありません');
    });

    it('メールアドレスがない場合、400を返すこと', async () => {
      const response = await request(app).post('/api/auth/login').send({
        password: 'password123',
      });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('200を返すこと', async () => {
      const response = await request(app).post('/api/auth/logout');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('ログアウトしました');
    });
  });

  describe('GET /api/auth/me', () => {
    let authToken: string;

    beforeEach(async () => {
      const signupResponse = await request(app).post('/api/auth/signup').send({
        email: 'test@example.com',
        password: 'password123',
      });
      authToken = signupResponse.body.token;
    });

    it('有効なトークンで200を返すこと', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.email).toBe('test@example.com');
    });

    it('トークンがない場合、401を返すこと', async () => {
      const response = await request(app).get('/api/auth/me');

      expect(response.status).toBe(401);
    });

    it('無効なトークンの場合、401を返すこと', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });
});

