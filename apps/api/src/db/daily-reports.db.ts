import { DailyReport, GoodPoint, Improvement } from '../models/daily-report.model.js';

/**
 * 日報インメモリデータベース
 */
export class DailyReportsDatabase {
  private reports = new Map<string, DailyReport>();

  save(report: DailyReport): void {
    this.reports.set(report.id, report);
  }

  findById(id: string): DailyReport | undefined {
    return this.reports.get(id);
  }

  findByUserIdAndDate(userId: string, date: string): DailyReport | undefined {
    for (const report of this.reports.values()) {
      if (report.userId === userId && report.date === date) {
        return report;
      }
    }
    return undefined;
  }

  findAllByUserId(userId: string): DailyReport[] {
    const results: DailyReport[] = [];
    for (const report of this.reports.values()) {
      if (report.userId === userId) {
        results.push(report);
      }
    }
    return results;
  }

  update(report: DailyReport): void {
    if (this.reports.has(report.id)) {
      this.reports.set(report.id, report);
    }
  }

  clear(): void {
    this.reports.clear();
  }
}

/**
 * よかったことインメモリデータベース
 */
export class GoodPointsDatabase {
  private goodPoints = new Map<string, GoodPoint>();

  save(goodPoint: GoodPoint): void {
    this.goodPoints.set(goodPoint.id, goodPoint);
  }

  findById(id: string): GoodPoint | undefined {
    return this.goodPoints.get(id);
  }

  findByIds(ids: string[]): GoodPoint[] {
    const results: GoodPoint[] = [];
    for (const id of ids) {
      const goodPoint = this.goodPoints.get(id);
      if (goodPoint) {
        results.push(goodPoint);
      }
    }
    return results;
  }

  findAllByUserId(userId: string): GoodPoint[] {
    const results: GoodPoint[] = [];
    for (const goodPoint of this.goodPoints.values()) {
      if (goodPoint.userId === userId) {
        results.push(goodPoint);
      }
    }
    return results;
  }

  update(goodPoint: GoodPoint): void {
    if (this.goodPoints.has(goodPoint.id)) {
      this.goodPoints.set(goodPoint.id, goodPoint);
    }
  }

  clear(): void {
    this.goodPoints.clear();
  }
}

/**
 * 改善点インメモリデータベース
 */
export class ImprovementsDatabase {
  private improvements = new Map<string, Improvement>();

  save(improvement: Improvement): void {
    this.improvements.set(improvement.id, improvement);
  }

  findById(id: string): Improvement | undefined {
    return this.improvements.get(id);
  }

  findByIds(ids: string[]): Improvement[] {
    const results: Improvement[] = [];
    for (const id of ids) {
      const improvement = this.improvements.get(id);
      if (improvement) {
        results.push(improvement);
      }
    }
    return results;
  }

  findAllByUserId(userId: string): Improvement[] {
    const results: Improvement[] = [];
    for (const improvement of this.improvements.values()) {
      if (improvement.userId === userId) {
        results.push(improvement);
      }
    }
    return results;
  }

  update(improvement: Improvement): void {
    if (this.improvements.has(improvement.id)) {
      this.improvements.set(improvement.id, improvement);
    }
  }

  clear(): void {
    this.improvements.clear();
  }
}

// シングルトンインスタンス
export const dailyReportsDb = new DailyReportsDatabase();
export const goodPointsDb = new GoodPointsDatabase();
export const improvementsDb = new ImprovementsDatabase();

