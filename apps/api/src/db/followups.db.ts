import { Followup } from '../models/daily-report.model.js';

/**
 * フォローアップインメモリデータベース
 */
export class FollowupsDatabase {
  private followups = new Map<string, Followup>();

  save(followup: Followup): void {
    this.followups.set(followup.id, followup);
  }

  findById(id: string): Followup | undefined {
    return this.followups.get(id);
  }

  findByItemId(itemType: 'goodPoint' | 'improvement', itemId: string): Followup[] {
    const results: Followup[] = [];
    for (const followup of this.followups.values()) {
      if (followup.itemType === itemType && followup.itemId === itemId) {
        results.push(followup);
      }
    }
    return results;
  }

  findAllByUserId(userId: string): Followup[] {
    const results: Followup[] = [];
    for (const followup of this.followups.values()) {
      if (followup.userId === userId) {
        results.push(followup);
      }
    }
    return results;
  }

  delete(id: string): void {
    this.followups.delete(id);
  }

  clear(): void {
    this.followups.clear();
  }
}

// シングルトンインスタンス
export const followupsDb = new FollowupsDatabase();

