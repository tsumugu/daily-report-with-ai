import { WeeklyFocus } from '../models/daily-report.model.js';

/**
 * 週次フォーカスインメモリデータベース
 */
export class WeeklyFocusesDatabase {
  private weeklyFocuses = new Map<string, WeeklyFocus>();

  save(weeklyFocus: WeeklyFocus): void {
    this.weeklyFocuses.set(weeklyFocus.id, weeklyFocus);
  }

  findById(id: string): WeeklyFocus | undefined {
    return this.weeklyFocuses.get(id);
  }

  findByUserIdAndWeek(userId: string, weekStartDate: string): WeeklyFocus[] {
    const results: WeeklyFocus[] = [];
    for (const weeklyFocus of this.weeklyFocuses.values()) {
      if (weeklyFocus.userId === userId && weeklyFocus.weekStartDate === weekStartDate) {
        results.push(weeklyFocus);
      }
    }
    return results;
  }

  findByUserId(userId: string): WeeklyFocus[] {
    const results: WeeklyFocus[] = [];
    for (const weeklyFocus of this.weeklyFocuses.values()) {
      if (weeklyFocus.userId === userId) {
        results.push(weeklyFocus);
      }
    }
    return results;
  }

  findByGoalId(goalId: string): WeeklyFocus[] {
    const results: WeeklyFocus[] = [];
    for (const weeklyFocus of this.weeklyFocuses.values()) {
      if (weeklyFocus.goalId === goalId) {
        results.push(weeklyFocus);
      }
    }
    return results;
  }

  delete(id: string): void {
    this.weeklyFocuses.delete(id);
  }

  clear(): void {
    this.weeklyFocuses.clear();
  }
}

// シングルトンインスタンス
export const weeklyFocusesDb = new WeeklyFocusesDatabase();

