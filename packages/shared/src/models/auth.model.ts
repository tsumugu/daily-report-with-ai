import { User } from './user.model';

/**
 * 認証関連の型定義（FE/BE共通）
 */

/** ログインリクエスト */
export interface LoginRequest {
  email: string;
  password: string;
}

/** サインアップリクエスト */
export interface SignupRequest {
  email: string;
  password: string;
}

/** 認証レスポンス */
export interface AuthResponse {
  user: User;
  token: string;
}

/** APIエラーレスポンス */
export interface ApiError {
  message: string;
  statusCode?: number;
}

