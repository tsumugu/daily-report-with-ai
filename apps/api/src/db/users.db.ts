import { User } from '../models/user.model.js';

/**
 * インメモリユーザーデータベース（MVP用）
 * 本番環境では PostgreSQL/Firestore 等に置き換え
 */
class UsersDatabase {
  private users = new Map<string, User>();

  /**
   * ユーザーを保存
   */
  save(user: User): User {
    this.users.set(user.id, user);
    return user;
  }

  /**
   * IDでユーザーを取得
   */
  findById(id: string): User | undefined {
    return this.users.get(id);
  }

  /**
   * メールアドレスでユーザーを取得
   */
  findByEmail(email: string): User | undefined {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return undefined;
  }

  /**
   * メールアドレスの重複チェック
   */
  existsByEmail(email: string): boolean {
    return this.findByEmail(email) !== undefined;
  }

  /**
   * 全ユーザーを取得（デバッグ用）
   */
  findAll(): User[] {
    return Array.from(this.users.values());
  }

  /**
   * データベースをクリア（テスト用）
   */
  clear(): void {
    this.users.clear();
  }
}

// シングルトンインスタンス
export const usersDb = new UsersDatabase();

