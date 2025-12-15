/**
 * 目標モデル
 */
export type GoalType = 'skill' | 'project' | 'habit' | 'other';

export interface Goal {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  parentId: string | null;
  goalType: GoalType | null;
  successCriteria: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * 目標作成リクエスト
 */
export interface CreateGoalRequest {
  name: string;
  description?: string | null;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  parentId?: string | null;
  goalType?: GoalType | null;
  successCriteria?: string | null;
}

/**
 * 目標更新リクエスト
 */
export interface UpdateGoalRequest {
  name?: string;
  description?: string | null;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  parentId?: string | null;
  goalType?: GoalType | null;
  successCriteria?: string | null;
}

/**
 * 目標（階層構造を含む）
 */
export interface GoalWithChildren extends Goal {
  children: GoalWithChildren[];
}

/**
 * 目標詳細レスポンス
 */
export interface GoalDetailResponse extends Goal {
  parent: {
    id: string;
    name: string;
  } | null;
  children: {
    id: string;
    name: string;
  }[];
}

/**
 * 目標一覧レスポンス
 */
export interface GoalsResponse {
  data: GoalWithChildren[] | Goal[];
}

