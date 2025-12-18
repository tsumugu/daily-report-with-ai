import { Followup } from '../models/daily-report.model.js';
import { getDatabase } from './database.js';
import type { Database as DatabaseType } from 'better-sqlite3';
import { markAsChanged } from './storage-adapter.js';

/**
 * SQLiteベースのフォローアップデータベース
 */
export class FollowupsDatabase {
  private db: DatabaseType;

  constructor(db: DatabaseType) {
    this.db = db;
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
    markAsChanged();
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
    markAsChanged();
  }

  delete(id: string): void {
    this.db.prepare('DELETE FROM followups WHERE id = ?').run(id);
    markAsChanged();
  }

  clear(): void {
    this.db.prepare('DELETE FROM followups').run();
    markAsChanged();
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

// ファクトリーパターンで非同期初期化
let followupsDbPromise: Promise<FollowupsDatabase> | null = null;

export async function getFollowupsDatabase(): Promise<FollowupsDatabase> {
  if (!followupsDbPromise) {
    followupsDbPromise = (async () => {
      const db = await getDatabase();
      return new FollowupsDatabase(db);
    })();
  }
  return await followupsDbPromise;
}

// 後方互換性のため、既存のシングルトンも維持（非推奨）
export const followupsDb = new Proxy({} as FollowupsDatabase, {
  get: () => {
    throw new Error(
      "followupsDb is no longer available synchronously. Use getFollowupsDatabase() instead.",
    );
  },
});
