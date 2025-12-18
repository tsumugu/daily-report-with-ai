import { User } from '../models/user.model.js';
import { getDatabase } from './database.js';
import type { Database as DatabaseType } from 'better-sqlite3';
import { markAsChanged } from './storage-adapter.js';

/**
 * SQLiteベースのユーザーデータベース
 */
export class UsersDatabase {
  private db: DatabaseType;

  constructor(db: DatabaseType) {
    this.db = db;
  }

  /**
   * ユーザーを保存
   */
  save(user: User): User {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO users (id, email, password_hash, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(user.id, user.email, user.passwordHash, user.createdAt, user.updatedAt);
    markAsChanged();
    return user;
  }

  /**
   * IDでユーザーを取得
   */
  findById(id: string): User | undefined {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
    const row = stmt.get(id) as any;
    return row ? this.mapRowToUser(row) : undefined;
  }

  /**
   * メールアドレスでユーザーを取得
   */
  findByEmail(email: string): User | undefined {
    const stmt = this.db.prepare('SELECT * FROM users WHERE email = ?');
    const row = stmt.get(email) as any;
    return row ? this.mapRowToUser(row) : undefined;
  }

  /**
   * メールアドレスの重複チェック
   */
  existsByEmail(email: string): boolean {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM users WHERE email = ?');
    const row = stmt.get(email) as any;
    return row.count > 0;
  }

  /**
   * 全ユーザーを取得（デバッグ用）
   */
  findAll(): User[] {
    const stmt = this.db.prepare('SELECT * FROM users');
    const rows = stmt.all() as any[];
    return rows.map(row => this.mapRowToUser(row));
  }

  /**
   * データベースをクリア（テスト用）
   */
  clear(): void {
    this.db.prepare('DELETE FROM users').run();
    markAsChanged();
  }

  /**
   * 行データをUserモデルにマッピング
   */
  private mapRowToUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

// ファクトリーパターンで非同期初期化
let usersDbPromise: Promise<UsersDatabase> | null = null;

export async function getUsersDatabase(): Promise<UsersDatabase> {
  if (!usersDbPromise) {
    usersDbPromise = (async () => {
      const db = await getDatabase();
      return new UsersDatabase(db);
    })();
  }
  return await usersDbPromise;
}

// 後方互換性のため、既存のシングルトンも維持（非推奨）
export const usersDb = new Proxy({} as UsersDatabase, {
  get: () => {
    throw new Error(
      "usersDb is no longer available synchronously. Use getUsersDatabase() instead.",
    );
  },
});
