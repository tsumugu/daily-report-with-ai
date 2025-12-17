import { DailyReport, GoodPoint, Improvement } from '../models/daily-report.model.js';
import { getDatabase } from './database.js';
import type { Database as DatabaseType } from 'better-sqlite3';

/**
 * SQLiteベースの日報データベース
 */
export class DailyReportsDatabase {
  private db: DatabaseType;

  constructor(db?: DatabaseType) {
    this.db = db || getDatabase();
  }

  save(report: DailyReport): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO daily_reports 
      (id, user_id, date, events, learnings, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      report.id,
      report.userId,
      report.date,
      report.events,
      report.learnings,
      report.createdAt,
      report.updatedAt
    );
  }

  findById(id: string): DailyReport | undefined {
    const stmt = this.db.prepare('SELECT * FROM daily_reports WHERE id = ?');
    const row = stmt.get(id) as any;
    if (!row) return undefined;

    // goodPointIdsとimprovementIdsを取得
    const goodPointIds = this.getGoodPointIdsByDailyReportId(id);
    const improvementIds = this.getImprovementIdsByDailyReportId(id);

    return this.mapRowToDailyReport(row, goodPointIds, improvementIds);
  }

  findByUserIdAndDate(userId: string, date: string): DailyReport | undefined {
    const stmt = this.db.prepare(
      'SELECT * FROM daily_reports WHERE user_id = ? AND date = ?'
    );
    const row = stmt.get(userId, date) as any;
    if (!row) return undefined;

    // goodPointIdsとimprovementIdsを取得
    const goodPointIds = this.getGoodPointIdsByDailyReportId(row.id);
    const improvementIds = this.getImprovementIdsByDailyReportId(row.id);

    return this.mapRowToDailyReport(row, goodPointIds, improvementIds);
  }

  findAllByUserId(userId: string): DailyReport[] {
    const stmt = this.db.prepare('SELECT * FROM daily_reports WHERE user_id = ? ORDER BY date DESC');
    const rows = stmt.all(userId) as any[];
    return rows.map(row => {
      const goodPointIds = this.getGoodPointIdsByDailyReportId(row.id);
      const improvementIds = this.getImprovementIdsByDailyReportId(row.id);
      return this.mapRowToDailyReport(row, goodPointIds, improvementIds);
    });
  }

  update(report: DailyReport): void {
    const stmt = this.db.prepare(`
      UPDATE daily_reports 
      SET user_id = ?, date = ?, events = ?, learnings = ?, updated_at = ?
      WHERE id = ?
    `);
    stmt.run(
      report.userId,
      report.date,
      report.events,
      report.learnings,
      report.updatedAt,
      report.id
    );
  }

  clear(): void {
    this.db.prepare('DELETE FROM daily_reports').run();
  }

  private getGoodPointIdsByDailyReportId(dailyReportId: string): string[] {
    const stmt = this.db.prepare(
      'SELECT id FROM good_points WHERE daily_report_id = ?'
    );
    const rows = stmt.all(dailyReportId) as any[];
    return rows.map(row => row.id);
  }

  private getImprovementIdsByDailyReportId(dailyReportId: string): string[] {
    const stmt = this.db.prepare(
      'SELECT id FROM improvements WHERE daily_report_id = ?'
    );
    const rows = stmt.all(dailyReportId) as any[];
    return rows.map(row => row.id);
  }

  private mapRowToDailyReport(
    row: any,
    goodPointIds: string[],
    improvementIds: string[]
  ): DailyReport {
    return {
      id: row.id,
      userId: row.user_id,
      date: row.date,
      events: row.events,
      learnings: row.learnings,
      goodPointIds,
      improvementIds,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

/**
 * SQLiteベースのよかったことデータベース
 */
export class GoodPointsDatabase {
  private db: DatabaseType;

  constructor(db?: DatabaseType) {
    this.db = db || getDatabase();
  }

  save(goodPoint: GoodPoint, dailyReportId?: string): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO good_points 
      (id, user_id, daily_report_id, content, factors, tags, status, success_count, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      goodPoint.id,
      goodPoint.userId,
      dailyReportId || null,
      goodPoint.content,
      goodPoint.factors,
      JSON.stringify(goodPoint.tags),
      goodPoint.status,
      goodPoint.success_count,
      goodPoint.createdAt,
      goodPoint.updatedAt
    );
  }

  findById(id: string): GoodPoint | undefined {
    const stmt = this.db.prepare('SELECT * FROM good_points WHERE id = ?');
    const row = stmt.get(id) as any;
    return row ? this.mapRowToGoodPoint(row) : undefined;
  }

  findByIds(ids: string[]): GoodPoint[] {
    if (ids.length === 0) return [];
    const placeholders = ids.map(() => '?').join(',');
    const stmt = this.db.prepare(`SELECT * FROM good_points WHERE id IN (${placeholders})`);
    const rows = stmt.all(...ids) as any[];
    return rows.map(row => this.mapRowToGoodPoint(row));
  }

  findAllByUserId(userId: string): GoodPoint[] {
    const stmt = this.db.prepare('SELECT * FROM good_points WHERE user_id = ?');
    const rows = stmt.all(userId) as any[];
    return rows.map(row => this.mapRowToGoodPoint(row));
  }

  update(goodPoint: GoodPoint, dailyReportId?: string): void {
    // 既存のdaily_report_idを取得（指定されていない場合）
    let currentDailyReportId = dailyReportId;
    if (!currentDailyReportId) {
      const existing = this.findById(goodPoint.id);
      if (existing) {
        const stmt = this.db.prepare('SELECT daily_report_id FROM good_points WHERE id = ?');
        const row = stmt.get(goodPoint.id) as any;
        currentDailyReportId = row?.daily_report_id || null;
      }
    }

    const stmt = this.db.prepare(`
      UPDATE good_points 
      SET user_id = ?, daily_report_id = ?, content = ?, factors = ?, tags = ?, status = ?, success_count = ?, updated_at = ?
      WHERE id = ?
    `);
    stmt.run(
      goodPoint.userId,
      currentDailyReportId || null,
      goodPoint.content,
      goodPoint.factors,
      JSON.stringify(goodPoint.tags),
      goodPoint.status,
      goodPoint.success_count,
      goodPoint.updatedAt,
      goodPoint.id
    );
  }

  delete(id: string): void {
    this.db.prepare('DELETE FROM good_points WHERE id = ?').run(id);
  }

  clear(): void {
    this.db.prepare('DELETE FROM good_points').run();
  }

  private mapRowToGoodPoint(row: any): GoodPoint {
    return {
      id: row.id,
      userId: row.user_id,
      content: row.content,
      factors: row.factors,
      tags: row.tags ? JSON.parse(row.tags) : [],
      status: row.status,
      success_count: row.success_count || 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

/**
 * SQLiteベースの改善点データベース
 */
export class ImprovementsDatabase {
  private db: DatabaseType;

  constructor(db?: DatabaseType) {
    this.db = db || getDatabase();
  }

  save(improvement: Improvement, dailyReportId?: string): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO improvements 
      (id, user_id, daily_report_id, content, action, status, success_count, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      improvement.id,
      improvement.userId,
      dailyReportId || null,
      improvement.content,
      improvement.action,
      improvement.status,
      improvement.success_count,
      improvement.createdAt,
      improvement.updatedAt
    );
  }

  findById(id: string): Improvement | undefined {
    const stmt = this.db.prepare('SELECT * FROM improvements WHERE id = ?');
    const row = stmt.get(id) as any;
    return row ? this.mapRowToImprovement(row) : undefined;
  }

  findByIds(ids: string[]): Improvement[] {
    if (ids.length === 0) return [];
    const placeholders = ids.map(() => '?').join(',');
    const stmt = this.db.prepare(`SELECT * FROM improvements WHERE id IN (${placeholders})`);
    const rows = stmt.all(...ids) as any[];
    return rows.map(row => this.mapRowToImprovement(row));
  }

  findAllByUserId(userId: string): Improvement[] {
    const stmt = this.db.prepare('SELECT * FROM improvements WHERE user_id = ?');
    const rows = stmt.all(userId) as any[];
    return rows.map(row => this.mapRowToImprovement(row));
  }

  update(improvement: Improvement, dailyReportId?: string): void {
    // 既存のdaily_report_idを取得（指定されていない場合）
    let currentDailyReportId = dailyReportId;
    if (!currentDailyReportId) {
      const existing = this.findById(improvement.id);
      if (existing) {
        const stmt = this.db.prepare('SELECT daily_report_id FROM improvements WHERE id = ?');
        const row = stmt.get(improvement.id) as any;
        currentDailyReportId = row?.daily_report_id || null;
      }
    }

    const stmt = this.db.prepare(`
      UPDATE improvements 
      SET user_id = ?, daily_report_id = ?, content = ?, action = ?, status = ?, success_count = ?, updated_at = ?
      WHERE id = ?
    `);
    stmt.run(
      improvement.userId,
      currentDailyReportId || null,
      improvement.content,
      improvement.action,
      improvement.status,
      improvement.success_count,
      improvement.updatedAt,
      improvement.id
    );
  }

  delete(id: string): void {
    this.db.prepare('DELETE FROM improvements WHERE id = ?').run(id);
  }

  clear(): void {
    this.db.prepare('DELETE FROM improvements').run();
  }

  private mapRowToImprovement(row: any): Improvement {
    return {
      id: row.id,
      userId: row.user_id,
      content: row.content,
      action: row.action,
      status: row.status,
      success_count: row.success_count || 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

// シングルトンインスタンス
export const dailyReportsDb = new DailyReportsDatabase();
export const goodPointsDb = new GoodPointsDatabase();
export const improvementsDb = new ImprovementsDatabase();
