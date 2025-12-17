import { Followup } from '../models/daily-report.model.js';
import { getDatabase } from './database.js';
import type { Database as DatabaseType } from 'better-sqlite3';

/**
 * SQLiteベースのフォローアップデータベース
 */
export class FollowupsDatabase {
  private db: DatabaseType;

  constructor(db?: DatabaseType) {
    this.db = db || getDatabase();
  }

  save(followup: Followup): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO followups 
      (id, user_id, item_type, item_id, status, memo, date, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      followup.id,
      followup.userId,
      followup.itemType,
      followup.itemId,
      followup.status,
      followup.memo,
      followup.date,
      followup.createdAt,
      followup.updatedAt
    );
  }

  findById(id: string): Followup | undefined {
    const stmt = this.db.prepare('SELECT * FROM followups WHERE id = ?');
    const row = stmt.get(id) as any;
    return row ? this.mapRowToFollowup(row) : undefined;
  }

  findByItemId(itemType: 'goodPoint' | 'improvement', itemId: string): Followup[] {
    const stmt = this.db.prepare(
      'SELECT * FROM followups WHERE item_type = ? AND item_id = ?'
    );
    const rows = stmt.all(itemType, itemId) as any[];
    return rows.map(row => this.mapRowToFollowup(row));
  }

  findAllByUserId(userId: string): Followup[] {
    const stmt = this.db.prepare('SELECT * FROM followups WHERE user_id = ? ORDER BY created_at DESC');
    const rows = stmt.all(userId) as any[];
    return rows.map(row => this.mapRowToFollowup(row));
  }

  update(followup: Followup): void {
    const stmt = this.db.prepare(`
      UPDATE followups 
      SET user_id = ?, item_type = ?, item_id = ?, status = ?, memo = ?, date = ?, updated_at = ?
      WHERE id = ?
    `);
    stmt.run(
      followup.userId,
      followup.itemType,
      followup.itemId,
      followup.status,
      followup.memo,
      followup.date,
      followup.updatedAt,
      followup.id
    );
  }

  delete(id: string): void {
    this.db.prepare('DELETE FROM followups WHERE id = ?').run(id);
  }

  clear(): void {
    this.db.prepare('DELETE FROM followups').run();
  }

  private mapRowToFollowup(row: any): Followup {
    return {
      id: row.id,
      userId: row.user_id,
      itemType: row.item_type,
      itemId: row.item_id,
      status: row.status,
      memo: row.memo,
      date: row.date,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

// シングルトンインスタンス
export const followupsDb = new FollowupsDatabase();
