/**
 * 認証関連の型定義
 */

/** ユーザー情報 */
export interface User {
  id: string;
  email: string;
  createdAt: string;
}

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
export interface AuthError {
  message: string;
  statusCode: number;
}

