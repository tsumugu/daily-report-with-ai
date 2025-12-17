import { User } from '../models/user.model.js';
import { getDatabase } from './database.js';
import type { Database as DatabaseType } from 'better-sqlite3';

/**
 * SQLiteベースのユーザーデータベース
 */
export class UsersDatabase {
  private db: DatabaseType;

  constructor(db?: DatabaseType) {
    this.db = db || getDatabase();
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

// シングルトンインスタンス
export const usersDb = new UsersDatabase();
