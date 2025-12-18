import { WeeklyFocus } from '../models/daily-report.model.js';
import { getDatabase } from './database.js';
import type { Database as DatabaseType } from 'better-sqlite3';
import { markAsChanged } from './storage-adapter.js';

/**
 * SQLiteベースの週次フォーカスデータベース
 */
export class WeeklyFocusesDatabase {
  private db: DatabaseType;

  constructor(db: DatabaseType) {
    this.db = db;
  }

  save(weeklyFocus: WeeklyFocus): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO weekly_focuses 
      (id, user_id, item_type, item_id, goal_id, week_start_date, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      weeklyFocus.id,
      weeklyFocus.userId,
      weeklyFocus.itemType,
      weeklyFocus.itemId,
      weeklyFocus.goalId,
      weeklyFocus.weekStartDate,
      weeklyFocus.createdAt
    );
    markAsChanged();
  }

  findById(id: string): WeeklyFocus | undefined {
    const stmt = this.db.prepare('SELECT * FROM weekly_focuses WHERE id = ?');
    const row = stmt.get(id) as any;
    return row ? this.mapRowToWeeklyFocus(row) : undefined;
  }

  findByUserIdAndWeek(userId: string, weekStartDate: string): WeeklyFocus[] {
    const stmt = this.db.prepare(
      'SELECT * FROM weekly_focuses WHERE user_id = ? AND week_start_date = ?'
    );
    const rows = stmt.all(userId, weekStartDate) as any[];
    return rows.map(row => this.mapRowToWeeklyFocus(row));
  }

  findByUserId(userId: string): WeeklyFocus[] {
    const stmt = this.db.prepare('SELECT * FROM weekly_focuses WHERE user_id = ? ORDER BY week_start_date DESC');
    const rows = stmt.all(userId) as any[];
    return rows.map(row => this.mapRowToWeeklyFocus(row));
  }

  findByGoalId(goalId: string): WeeklyFocus[] {
    const stmt = this.db.prepare('SELECT * FROM weekly_focuses WHERE goal_id = ?');
    const rows = stmt.all(goalId) as any[];
    return rows.map(row => this.mapRowToWeeklyFocus(row));
  }

  delete(id: string): void {
    this.db.prepare('DELETE FROM weekly_focuses WHERE id = ?').run(id);
    markAsChanged();
  }

  clear(): void {
    this.db.prepare('DELETE FROM weekly_focuses').run();
    markAsChanged();
  }

  private mapRowToWeeklyFocus(row: any): WeeklyFocus {
    return {
      id: row.id,
      userId: row.user_id,
      itemType: row.item_type,
      itemId: row.item_id,
      goalId: row.goal_id,
      weekStartDate: row.week_start_date,
      createdAt: row.created_at,
    };
  }
}

// ファクトリーパターンで非同期初期化
let weeklyFocusesDbPromise: Promise<WeeklyFocusesDatabase> | null = null;

export async function getWeeklyFocusesDatabase(): Promise<WeeklyFocusesDatabase> {
  if (!weeklyFocusesDbPromise) {
    weeklyFocusesDbPromise = (async () => {
      const db = await getDatabase();
      return new WeeklyFocusesDatabase(db);
    })();
  }
  return await weeklyFocusesDbPromise;
}

// 後方互換性のため、既存のシングルトンも維持（非推奨）
export const weeklyFocusesDb = new Proxy({} as WeeklyFocusesDatabase, {
  get: () => {
    throw new Error(
      "weeklyFocusesDb is no longer available synchronously. Use getWeeklyFocusesDatabase() instead.",
    );
  },
});
