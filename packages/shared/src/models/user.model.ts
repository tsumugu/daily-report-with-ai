/**
 * ユーザーモデル（FE/BE共通）
 */
export interface User {
  id: string;
  email: string;
  createdAt: string;
}

/**
 * ユーザー作成リクエスト
 */
export interface CreateUserRequest {
  email: string;
  password: string;
}

/**
 * ユーザーレスポンス
 */
export interface UserResponse {
  id: string;
  email: string;
  createdAt: string;
}

