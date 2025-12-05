import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Response, NextFunction } from 'express';
import {
  generateToken,
  verifyToken,
  authMiddleware,
  AuthenticatedRequest,
} from './auth.middleware.js';

describe('Auth Middleware', () => {
  describe('generateToken', () => {
    it('JWTトークンを生成すること', () => {
      const token = generateToken('1', 'test@example.com');

      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      // JWTは3つのパートからなる
      expect(token.split('.')).toHaveLength(3);
    });

    it('emailがなくてもトークンを生成できること', () => {
      const token = generateToken('1');

      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
    });
  });

  describe('verifyToken', () => {
    it('有効なトークンの場合、ペイロードを返すこと', () => {
      const token = generateToken('1', 'test@example.com');

      const result = verifyToken(token);

      expect(result).toBeTruthy();
      expect(result?.userId).toBe('1');
      expect(result?.email).toBe('test@example.com');
    });

    it('無効なトークンの場合、nullを返すこと', () => {
      const result = verifyToken('invalid-token');
      expect(result).toBeNull();
    });

    it('改ざんされたトークンの場合、nullを返すこと', () => {
      const token = generateToken('1', 'test@example.com');
      const tamperedToken = token + 'tampered';

      const result = verifyToken(tamperedToken);
      expect(result).toBeNull();
    });
  });

  describe('authMiddleware', () => {
    let mockReq: Partial<AuthenticatedRequest>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;
    let jsonMock: ReturnType<typeof vi.fn>;
    let statusMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      jsonMock = vi.fn();
      statusMock = vi.fn().mockReturnValue({ json: jsonMock });
      mockReq = {
        headers: {},
      };
      mockRes = {
        status: statusMock,
        json: jsonMock,
      };
      mockNext = vi.fn();
    });

    it('Authorizationヘッダーがない場合、401を返すこと', () => {
      authMiddleware(
        mockReq as AuthenticatedRequest,
        mockRes as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({ message: '認証が必要です' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('Bearerプレフィックスがない場合、401を返すこと', () => {
      mockReq.headers = { authorization: 'InvalidToken' };

      authMiddleware(
        mockReq as AuthenticatedRequest,
        mockRes as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({ message: '認証が必要です' });
    });

    it('無効なトークンの場合、401を返すこと', () => {
      mockReq.headers = { authorization: 'Bearer invalid-token' };

      authMiddleware(
        mockReq as AuthenticatedRequest,
        mockRes as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'トークンが無効です' });
    });

    it('有効なトークンの場合、req.userを設定しnextを呼ぶこと', () => {
      const token = generateToken('1', 'test@example.com');
      mockReq.headers = { authorization: `Bearer ${token}` };

      authMiddleware(
        mockReq as AuthenticatedRequest,
        mockRes as Response,
        mockNext
      );

      expect(mockReq.user).toBeTruthy();
      expect(mockReq.user?.id).toBe('1');
      expect(mockReq.user?.email).toBe('test@example.com');
      expect(mockNext).toHaveBeenCalled();
    });
  });
});
