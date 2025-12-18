import { Goal } from '../models/daily-report.model.js';
import { getDatabase } from './database.js';
import type { Database as DatabaseType } from 'better-sqlite3';
import { markAsChanged } from './storage-adapter.js';

/**
 * SQLiteベースの目標データベース
 */
export class GoalsDatabase {
  private db: DatabaseType;

  constructor(db: DatabaseType) {
    this.db = db;
  }

  save(goal: Goal): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO goals 
      (id, user_id, name, description, start_date, end_date, parent_id, goal_type, success_criteria, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      goal.id,
      goal.userId,
      goal.name,
      goal.description,
      goal.startDate,
      goal.endDate,
      goal.parentId,
      goal.goalType,
      goal.successCriteria,
      goal.createdAt,
      goal.updatedAt
    );
    markAsChanged();
  }

  findById(id: string): Goal | undefined {
    const stmt = this.db.prepare('SELECT * FROM goals WHERE id = ?');
    const row = stmt.get(id) as any;
    return row ? this.mapRowToGoal(row) : undefined;
  }

  findAllByUserId(userId: string): Goal[] {
    const stmt = this.db.prepare('SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC');
    const rows = stmt.all(userId) as any[];
    return rows.map(row => this.mapRowToGoal(row));
  }

  findByParentId(parentId: string | null): Goal[] {
    if (parentId === null) {
      const stmt = this.db.prepare('SELECT * FROM goals WHERE parent_id IS NULL');
      const rows = stmt.all() as any[];
      return rows.map(row => this.mapRowToGoal(row));
    } else {
      const stmt = this.db.prepare('SELECT * FROM goals WHERE parent_id = ?');
      const rows = stmt.all(parentId) as any[];
      return rows.map(row => this.mapRowToGoal(row));
    }
  }

  update(goal: Goal): void {
    const stmt = this.db.prepare(`
      UPDATE goals 
      SET user_id = ?, name = ?, description = ?, start_date = ?, end_date = ?, parent_id = ?, goal_type = ?, success_criteria = ?, updated_at = ?
      WHERE id = ?
    `);
    stmt.run(
      goal.userId,
      goal.name,
      goal.description,
      goal.startDate,
      goal.endDate,
      goal.parentId,
      goal.goalType,
      goal.successCriteria,
      goal.updatedAt,
      goal.id
    );
    markAsChanged();
  }

  delete(id: string): void {
    this.db.prepare('DELETE FROM goals WHERE id = ?').run(id);
    markAsChanged();
  }

  clear(): void {
    this.db.prepare('DELETE FROM goals').run();
    markAsChanged();
  }

  private mapRowToGoal(row: any): Goal {
    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      description: row.description,
      startDate: row.start_date,
      endDate: row.end_date,
      parentId: row.parent_id,
      goalType: row.goal_type,
      successCriteria: row.success_criteria,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

// ファクトリーパターンで非同期初期化
let goalsDbPromise: Promise<GoalsDatabase> | null = null;

export async function getGoalsDatabase(): Promise<GoalsDatabase> {
  if (!goalsDbPromise) {
    goalsDbPromise = (async () => {
      const db = await getDatabase();
      return new GoalsDatabase(db);
    })();
  }
  return await goalsDbPromise;
}

// 後方互換性のため、既存のシングルトンも維持（非推奨）
export const goalsDb = new Proxy({} as GoalsDatabase, {
  get: () => {
    throw new Error(
      "goalsDb is no longer available synchronously. Use getGoalsDatabase() instead.",
    );
  },
});
