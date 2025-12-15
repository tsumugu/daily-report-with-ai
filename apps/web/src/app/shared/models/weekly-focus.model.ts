/**
 * 週次フォーカスモデル
 */
export interface WeeklyFocus {
  id: string;
  userId: string;
  itemType: 'goodPoint' | 'improvement';
  itemId: string;
  weekStartDate: string; // YYYY-MM-DD（月曜日）
  createdAt: string;
}

/**
 * 週次フォーカス作成リクエスト
 */
export interface CreateWeeklyFocusRequest {
  itemType: 'goodPoint' | 'improvement';
  itemId: string;
}

/**
 * 週次フォーカスレスポンス（よかったこと/改善点の情報を含む）
 */
export interface WeeklyFocusResponse extends WeeklyFocus {
  item: {
    id: string;
    content: string;
    status: string;
    success_count: number;
  } | null;
  reportId: string | null; // 日報ID
  goalId: string | null; // 短期目標のID（接続時、Phase 1で追加）
  goal?: {
    id: string;
    name: string;
  } | null; // 短期目標の情報（接続時）
}

/**
 * 週次フォーカス一覧レスポンス
 */
export interface WeeklyFocusesResponse {
  data: WeeklyFocusResponse[];
}

