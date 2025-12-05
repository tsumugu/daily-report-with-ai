/**
 * ユーザーモデル
 */
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * ユーザー作成リクエスト
 */
export interface CreateUserRequest {
  email: string;
  password: string;
}

/**
 * ユーザーレスポンス（パスワードハッシュを除外）
 */
export interface UserResponse {
  id: string;
  email: string;
  createdAt: string;
}

/**
 * ユーザーをレスポンス形式に変換
 */
export function toUserResponse(user: User): UserResponse {
  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
  };
}

