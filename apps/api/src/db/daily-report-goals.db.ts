import { DailyReportGoal } from '../models/daily-report.model.js';

/**
 * 日報と目標の関連付けインメモリデータベース
 */
export class DailyReportGoalsDatabase {
  private dailyReportGoals = new Map<string, DailyReportGoal>();

  save(dailyReportGoal: DailyReportGoal): void {
    this.dailyReportGoals.set(dailyReportGoal.id, dailyReportGoal);
  }

  findById(id: string): DailyReportGoal | undefined {
    return this.dailyReportGoals.get(id);
  }

  findByDailyReportId(dailyReportId: string): DailyReportGoal[] {
    const results: DailyReportGoal[] = [];
    for (const drg of this.dailyReportGoals.values()) {
      if (drg.dailyReportId === dailyReportId) {
        results.push(drg);
      }
    }
    return results;
  }

  /**
   * 複数の日報IDに関連付けられた目標を一括取得（N+1問題対策）
   * @param dailyReportIds 日報IDの配列
   * @returns 日報IDをキーとし、関連する DailyReportGoal の配列を値とするMap
   */
  findByDailyReportIds(dailyReportIds: string[]): Map<string, DailyReportGoal[]> {
    const result = new Map<string, DailyReportGoal[]>();

    for (const drg of this.dailyReportGoals.values()) {
      if (dailyReportIds.includes(drg.dailyReportId)) {
        if (!result.has(drg.dailyReportId)) {
          result.set(drg.dailyReportId, []);
        }
        result.get(drg.dailyReportId)!.push(drg);
      }
    }

    return result;
  }

  findByGoalId(goalId: string): DailyReportGoal[] {
    const results: DailyReportGoal[] = [];
    for (const drg of this.dailyReportGoals.values()) {
      if (drg.goalId === goalId) {
        results.push(drg);
      }
    }
    return results;
  }

  /**
   * 指定した日報IDの関連付けをすべて削除（カスケード削除）
   * @param dailyReportId 日報ID
   */
  deleteByDailyReportId(dailyReportId: string): void {
    const idsToDelete: string[] = [];
    for (const drg of this.dailyReportGoals.values()) {
      if (drg.dailyReportId === dailyReportId) {
        idsToDelete.push(drg.id);
      }
    }

    for (const id of idsToDelete) {
      this.dailyReportGoals.delete(id);
    }
  }

  delete(id: string): void {
    this.dailyReportGoals.delete(id);
  }

  clear(): void {
    this.dailyReportGoals.clear();
  }
}

// シングルトンインスタンス
export const dailyReportGoalsDb = new DailyReportGoalsDatabase();
