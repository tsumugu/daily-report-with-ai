import { DailyReportGoal } from '../models/daily-report.model.js';
import { getDatabase } from './database.js';
import type { Database as DatabaseType } from 'better-sqlite3';

/**
 * SQLiteベースの日報と目標の関連付けデータベース
 */
export class DailyReportGoalsDatabase {
  private db: DatabaseType;

  constructor(db?: DatabaseType) {
    this.db = db || getDatabase();
  }

  save(dailyReportGoal: DailyReportGoal): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO daily_report_goals 
      (id, daily_report_id, goal_id, created_at)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(
      dailyReportGoal.id,
      dailyReportGoal.dailyReportId,
      dailyReportGoal.goalId,
      dailyReportGoal.createdAt
    );
  }

  findById(id: string): DailyReportGoal | undefined {
    const stmt = this.db.prepare('SELECT * FROM daily_report_goals WHERE id = ?');
    const row = stmt.get(id) as any;
    return row ? this.mapRowToDailyReportGoal(row) : undefined;
  }

  findByDailyReportId(dailyReportId: string): DailyReportGoal[] {
    const stmt = this.db.prepare(
      'SELECT * FROM daily_report_goals WHERE daily_report_id = ?'
    );
    const rows = stmt.all(dailyReportId) as any[];
    return rows.map(row => this.mapRowToDailyReportGoal(row));
  }

  /**
   * 複数の日報IDに関連付けられた目標を一括取得（N+1問題対策）
   * @param dailyReportIds 日報IDの配列
   * @returns 日報IDをキーとし、関連する DailyReportGoal の配列を値とするMap
   */
  findByDailyReportIds(dailyReportIds: string[]): Map<string, DailyReportGoal[]> {
    if (dailyReportIds.length === 0) {
      return new Map();
    }

    const placeholders = dailyReportIds.map(() => '?').join(',');
    const stmt = this.db.prepare(
      `SELECT * FROM daily_report_goals WHERE daily_report_id IN (${placeholders})`
    );
    const rows = stmt.all(...dailyReportIds) as any[];

    const result = new Map<string, DailyReportGoal[]>();
    for (const row of rows) {
      const drg = this.mapRowToDailyReportGoal(row);
      if (!result.has(drg.dailyReportId)) {
        result.set(drg.dailyReportId, []);
      }
      result.get(drg.dailyReportId)!.push(drg);
    }

    return result;
  }

  findByGoalId(goalId: string): DailyReportGoal[] {
    const stmt = this.db.prepare('SELECT * FROM daily_report_goals WHERE goal_id = ?');
    const rows = stmt.all(goalId) as any[];
    return rows.map(row => this.mapRowToDailyReportGoal(row));
  }

  /**
   * 指定した日報IDの関連付けをすべて削除（カスケード削除）
   * @param dailyReportId 日報ID
   */
  deleteByDailyReportId(dailyReportId: string): void {
    this.db.prepare('DELETE FROM daily_report_goals WHERE daily_report_id = ?').run(dailyReportId);
  }

  delete(id: string): void {
    this.db.prepare('DELETE FROM daily_report_goals WHERE id = ?').run(id);
  }

  clear(): void {
    this.db.prepare('DELETE FROM daily_report_goals').run();
  }

  private mapRowToDailyReportGoal(row: any): DailyReportGoal {
    return {
      id: row.id,
      dailyReportId: row.daily_report_id,
      goalId: row.goal_id,
      createdAt: row.created_at,
    };
  }
}

// シングルトンインスタンス
export const dailyReportGoalsDb = new DailyReportGoalsDatabase();
