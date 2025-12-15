import { Goal } from '../models/daily-report.model.js';

/**
 * 目標インメモリデータベース
 */
export class GoalsDatabase {
  private goals = new Map<string, Goal>();

  save(goal: Goal): void {
    this.goals.set(goal.id, goal);
  }

  findById(id: string): Goal | undefined {
    return this.goals.get(id);
  }

  findAllByUserId(userId: string): Goal[] {
    const results: Goal[] = [];
    for (const goal of this.goals.values()) {
      if (goal.userId === userId) {
        results.push(goal);
      }
    }
    return results;
  }

  findByParentId(parentId: string | null): Goal[] {
    const results: Goal[] = [];
    for (const goal of this.goals.values()) {
      if (goal.parentId === parentId) {
        results.push(goal);
      }
    }
    return results;
  }

  update(goal: Goal): void {
    if (this.goals.has(goal.id)) {
      this.goals.set(goal.id, goal);
    }
  }

  delete(id: string): void {
    this.goals.delete(id);
  }

  clear(): void {
    this.goals.clear();
  }
}

// シングルトンインスタンス
export const goalsDb = new GoalsDatabase();

