# 日報と目標の関連付け機能 技術設計書（Tech Spec）

**バージョン**: v1
**作成日**: 2025-12-16
**作成者**: Eng
**ステータス**: Approved
**承認日**: 2025-12-16
**承認者**: Helper, PdM

---

## 1. 概要

日報と目標を関連付ける機能の技術的な設計・実装方針を定義する。
日報作成・編集時に目標を選択し、目標詳細画面で関連日報を表示できるようにする。

---

## 2. データモデル

### 2.1 DailyReportGoal（日報と目標の関連付け）

日報と目標の多対多（Many-to-Many）関係を管理する中間テーブル。

| フィールド    | 型            | 必須 | 説明                           |
| :------------ | :------------ | :--- | :----------------------------- |
| id            | string (UUID) | ○    | 一意識別子                     |
| dailyReportId | string        | ○    | 日報ID（DailyReport.idに対応） |
| goalId        | string        | ○    | 目標ID（Goal.idに対応）        |
| createdAt     | string        | ○    | 作成日時                       |

**制約**:

- `dailyReportId` と `goalId` の組み合わせは一意（ユニーク制約）
- `dailyReportId` は DailyReport.id に対応する外部キー
- `goalId` は Goal.id に対応する外部キー

**インデックス**:

- `dailyReportId` にインデックス（日報から目標を検索）
- `goalId` にインデックス（目標から日報を検索）
- `(dailyReportId, goalId)` にユニークインデックス

### 2.2 DailyReportモデルの拡張

既存の `DailyReport` モデルは変更しない。
関連付けは `DailyReportGoal` テーブルで管理する。

```typescript
// 既存のDailyReportモデル（変更なし）
export interface DailyReport {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  events: string;
  learnings: string | null;
  goodPointIds: string[];
  improvementIds: string[];
  createdAt: string;
  updatedAt: string;
}

// 新規: 日報と目標の関連付けモデル
export interface DailyReportGoal {
  id: string;
  dailyReportId: string;
  goalId: string;
  createdAt: string;
}
```

### 2.3 リクエスト・レスポンスモデルの拡張

#### CreateDailyReportRequest

```typescript
export interface CreateDailyReportRequest {
  date: string;
  events: string;
  learnings?: string;
  goalIds?: string[]; // 新規追加: 関連する目標のIDリスト（任意）
  goodPoints?: {
    content: string;
    factors?: string;
    tags?: string[];
  }[];
  improvements?: {
    content: string;
    action?: string;
  }[];
}
```

#### UpdateDailyReportRequest

```typescript
export interface UpdateDailyReportRequest {
  date: string;
  events: string;
  learnings?: string;
  goalIds?: string[]; // 新規追加: 関連する目標のIDリスト（任意）
  goodPoints?: {
    id?: string;
    content: string;
    factors?: string;
    tags?: string[];
  }[];
  improvements?: {
    id?: string;
    content: string;
    action?: string;
  }[];
}
```

#### DailyReportResponse

```typescript
export interface DailyReportResponse {
  id: string;
  userId: string;
  date: string;
  events: string;
  learnings: string | null;
  goals: GoalSummary[]; // 新規追加: 関連する目標のサマリー
  goodPoints: GoodPoint[];
  improvements: Improvement[];
  createdAt: string;
  updatedAt: string;
}

// 新規: 目標サマリー（日報レスポンスで使用）
export interface GoalSummary {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  parentId: string | null;
}
```

#### GoalDetailResponse

```typescript
export interface GoalDetailResponse extends Goal {
  parent: {
    id: string;
    name: string;
  } | null;
  children: {
    id: string;
    name: string;
  }[];
  relatedDailyReports: DailyReportSummary[]; // 新規追加: 関連する日報のサマリー
  relatedDailyReportsCount: number; // 新規追加: 関連日報の総数
}

// 新規: 日報サマリー（目標詳細レスポンスで使用）
export interface DailyReportSummary {
  id: string;
  date: string;
  events: string;
  createdAt: string;
}
```

---

## 3. API設計

### 3.1 POST /api/daily-reports

日報を作成する。`goalIds` フィールドを追加し、目標との関連付けを可能にする。

**Request Body**:

```json
{
  "date": "2025-12-16",
  "events": "今日やったこと",
  "learnings": "学んだこと",
  "goalIds": ["goal-id-1", "goal-id-2"],
  "goodPoints": [...],
  "improvements": [...]
}
```

**Response**:

- 201 Created: 成功

```json
{
  "id": "report-id",
  "userId": "user-id",
  "date": "2025-12-16",
  "events": "今日やったこと",
  "learnings": "学んだこと",
  "goals": [
    {
      "id": "goal-id-1",
      "name": "目標名1",
      "startDate": "2025-01-01",
      "endDate": "2025-06-30",
      "parentId": null
    }
  ],
  "goodPoints": [...],
  "improvements": [...],
  "createdAt": "2025-12-16T00:00:00Z",
  "updatedAt": "2025-12-16T00:00:00Z"
}
```

**ビジネスロジック**:

- `goalIds` が指定された場合、各目標IDが有効か検証する
  - 目標が存在するか確認
  - 目標がユーザーの所有物か確認
  - 無効な目標IDが含まれる場合は 400 Bad Request を返す
- `goalIds` が指定された場合、`DailyReportGoal` テーブルにレコードを作成する
- `goalIds` が指定されない場合は、目標との関連付けなしで日報を作成する

**エラーレスポンス**:

- 400 Bad Request: バリデーションエラー、無効な目標ID
- 401 Unauthorized: 未認証
- 409 Conflict: 同じ日付の日報が既に存在する

### 3.2 PUT /api/daily-reports/:id

日報を更新する。`goalIds` フィールドを追加し、目標との関連付けを変更可能にする。

**Request Body**:

```json
{
  "date": "2025-12-16",
  "events": "今日やったこと（更新）",
  "learnings": "学んだこと（更新）",
  "goalIds": ["goal-id-1", "goal-id-3"],
  "goodPoints": [...],
  "improvements": [...]
}
```

**Response**:

- 200 OK: 成功
- 404 Not Found: 日報が見つからない
- 403 Forbidden: アクセス権限なし

**ビジネスロジック**:

- `goalIds` が指定された場合、既存の関連付けを削除し、新しい関連付けを作成する
  - 既存の `DailyReportGoal` レコードをすべて削除
  - 新しい `goalIds` に基づいて `DailyReportGoal` レコードを作成
- `goalIds` が指定されない（undefinedまたは空配列）場合は、既存の関連付けを削除する

**エラーレスポンス**:

- 400 Bad Request: バリデーションエラー、無効な目標ID
- 401 Unauthorized: 未認証
- 403 Forbidden: アクセス権限なし
- 404 Not Found: 日報が見つからない

### 3.3 GET /api/daily-reports/:id

日報詳細を取得する。関連する目標の情報も含める。

**Response**:

- 200 OK: 成功

```json
{
  "id": "report-id",
  "userId": "user-id",
  "date": "2025-12-16",
  "events": "今日やったこと",
  "learnings": "学んだこと",
  "goals": [
    {
      "id": "goal-id-1",
      "name": "目標名1",
      "startDate": "2025-01-01",
      "endDate": "2025-06-30",
      "parentId": null
    }
  ],
  "goodPoints": [...],
  "improvements": [...],
  "createdAt": "2025-12-16T00:00:00Z",
  "updatedAt": "2025-12-16T00:00:00Z"
}
```

**ビジネスロジック**:

- `DailyReportGoal` テーブルから関連する目標IDを取得
- 目標IDから目標の詳細情報を取得
- 削除された目標は除外する（または「削除済み」としてマーク）

### 3.4 GET /api/daily-reports

日報一覧を取得する。各日報に関連する目標の情報も含める。

**Query Parameters**:

- `month`: string (YYYY-MM)（オプション）- 特定月の日報を取得
- `startDate`: string (YYYY-MM-DD)（オプション）- 開始日
- `endDate`: string (YYYY-MM-DD)（オプション）- 終了日

**Response**:

- 200 OK: 成功

```json
{
  "data": [
    {
      "id": "report-id",
      "date": "2025-12-16",
      "events": "今日やったこと",
      "goals": [
        {
          "id": "goal-id-1",
          "name": "目標名1",
          "startDate": "2025-01-01",
          "endDate": "2025-06-30",
          "parentId": null
        }
      ],
      "goodPointIds": [...],
      "improvementIds": [...],
      "goodPointSummary": {...},
      "improvementSummary": {...}
    }
  ]
}
```

**ビジネスロジック**:

- 各日報に対して、関連する目標の情報を取得
- 日報一覧では最大3つまでの目標を表示（フロントエンドで制御）

### 3.5 GET /api/goals/:id

目標詳細を取得する。関連する日報の情報も含める。

**Query Parameters**:

- `limit`: number（オプション）- 関連日報の取得件数（デフォルト: 10）
- `offset`: number（オプション）- 関連日報の取得開始位置（デフォルト: 0）
- `sort`: 'asc' | 'desc'（オプション）- 日報の並び順（デフォルト: 'desc'）

**Response**:

- 200 OK: 成功

```json
{
  "id": "goal-id",
  "userId": "user-id",
  "name": "目標名",
  "description": "目標の説明",
  "startDate": "2025-01-01",
  "endDate": "2025-06-30",
  "parentId": null,
  "goalType": "skill",
  "successCriteria": "達成基準",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z",
  "parent": {...},
  "children": [...],
  "relatedDailyReports": [
    {
      "id": "report-id",
      "date": "2025-12-16",
      "events": "今日やったこと",
      "createdAt": "2025-12-16T00:00:00Z"
    }
  ],
  "relatedDailyReportsCount": 15
}
```

**ビジネスロジック**:

- `DailyReportGoal` テーブルから関連する日報IDを取得
- 日報IDから日報の詳細情報を取得
- `limit` と `offset` でページネーション対応
- `sort` で日報の並び順を制御（新しい順/古い順）
- 関連日報の総数を `relatedDailyReportsCount` に設定

---

## 4. データベース実装

### 4.1 DailyReportGoalsDatabase

```typescript
export class DailyReportGoalsDatabase {
  private dailyReportGoals = new Map<string, DailyReportGoal>();

  save(dailyReportGoal: DailyReportGoal): void {
    this.dailyReportGoals.set(dailyReportGoal.id, dailyReportGoal);
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

  findByGoalId(goalId: string): DailyReportGoal[] {
    const results: DailyReportGoal[] = [];
    for (const drg of this.dailyReportGoals.values()) {
      if (drg.goalId === goalId) {
        results.push(drg);
      }
    }
    return results;
  }

  findByDailyReportIds(
    dailyReportIds: string[],
  ): Map<string, DailyReportGoal[]> {
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

  deleteByDailyReportId(dailyReportId: string): void {
    for (const [id, drg] of this.dailyReportGoals.entries()) {
      if (drg.dailyReportId === dailyReportId) {
        this.dailyReportGoals.delete(id);
      }
    }
  }

  exists(dailyReportId: string, goalId: string): boolean {
    for (const drg of this.dailyReportGoals.values()) {
      if (drg.dailyReportId === dailyReportId && drg.goalId === goalId) {
        return true;
      }
    }
    return false;
  }

  clear(): void {
    this.dailyReportGoals.clear();
  }
}

// シングルトンインスタンス
export const dailyReportGoalsDb = new DailyReportGoalsDatabase();
```

---

## 5. フロントエンド設計

### 5.1 コンポーネント設計

#### 5.1.1 GoalSelectField（新規コンポーネント）

目標を選択するためのセレクトフィールド。

**Props**:

```typescript
interface GoalSelectFieldProps {
  value: string[]; // 選択された目標のIDリスト
  onChange: (goalIds: string[]) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  multiple?: boolean; // 複数選択可能か（デフォルト: true）
}
```

**機能**:

- 目標を検索・選択できる
- 複数選択可能
- 目標の階層構造を視覚的に表示（親目標名を表示）
- 選択された目標をチップ形式で表示

**使用箇所**:

- 日報作成画面
- 日報編集画面

#### 5.1.2 GoalChip（新規コンポーネント）

目標を表示するためのチップコンポーネント。

**Props**:

```typescript
interface GoalChipProps {
  goal: GoalSummary;
  onClick?: () => void;
  onRemove?: () => void; // 削除ボタンのハンドラ（編集時のみ）
  showRemoveButton?: boolean; // 削除ボタンを表示するか（デフォルト: false）
}
```

**機能**:

- 目標名を表示
- クリックすると目標詳細画面に遷移
- 編集時は削除ボタンを表示

**使用箇所**:

- 日報一覧（各日報カード）
- 日報詳細画面
- 日報作成・編集画面（選択済み目標の表示）

#### 5.1.3 RelatedDailyReportsList（新規コンポーネント）

目標詳細画面で関連日報を表示するコンポーネント。

**Props**:

```typescript
interface RelatedDailyReportsListProps {
  goalId: string;
  limit?: number; // 初期表示件数（デフォルト: 10）
  sort?: "asc" | "desc"; // 並び順（デフォルト: 'desc'）
}
```

**機能**:

- 関連日報を一覧表示
- 並び替え機能（新しい順/古い順）
- 「もっと見る」ボタンで追加読み込み
- 空状態の表示

**使用箇所**:

- 目標詳細画面

### 5.2 Stateマネジメント

#### 5.2.1 DailyReportForm

```typescript
interface DailyReportFormState {
  date: string;
  events: string;
  learnings: string;
  goalIds: string[]; // 新規追加: 選択された目標のIDリスト
  goodPoints: GoodPointInput[];
  improvements: ImprovementInput[];
}
```

#### 5.2.2 GoalDetail

```typescript
interface GoalDetailState {
  goal: GoalDetailResponse;
  relatedDailyReports: DailyReportSummary[];
  relatedDailyReportsCount: number;
  relatedDailyReportsLimit: number;
  relatedDailyReportsOffset: number;
  relatedDailyReportsSort: "asc" | "desc";
}
```

### 5.3 API Service

#### 5.3.1 DailyReportService

```typescript
export class DailyReportService {
  // 既存のメソッドに goalIds パラメータを追加
  async createDailyReport(
    request: CreateDailyReportRequest,
  ): Promise<DailyReportResponse> {
    // ...
  }

  async updateDailyReport(
    id: string,
    request: UpdateDailyReportRequest,
  ): Promise<DailyReportResponse> {
    // ...
  }

  async getDailyReportById(id: string): Promise<DailyReportResponse> {
    // ...
  }

  async getDailyReports(
    params: GetDailyReportsParams,
  ): Promise<DailyReportListResponse> {
    // ...
  }
}
```

#### 5.3.2 GoalService

```typescript
export class GoalService {
  // 既存のメソッドを拡張
  async getGoalById(
    id: string,
    options?: {
      limit?: number;
      offset?: number;
      sort?: "asc" | "desc";
    },
  ): Promise<GoalDetailResponse> {
    // ...
  }

  // 新規メソッド
  async getGoalsForSelect(): Promise<GoalSummary[]> {
    // 目標選択用の簡易リストを取得
  }
}
```

---

## 6. バリデーション

### 6.1 バックエンドバリデーション

#### 日報作成・更新時

- `goalIds` が指定された場合:
  - 各目標IDが有効なUUID形式か確認
  - 各目標が存在するか確認
  - 各目標がユーザーの所有物か確認
  - 関連付け可能な目標数の上限チェック（最大10個）
  - 無効な目標IDが含まれる場合は 400 Bad Request を返す

```typescript
// バリデーション例
function validateGoalIds(goalIds: string[], userId: string): void {
  for (const goalId of goalIds) {
    // UUID形式チェック
    if (!isValidUUID(goalId)) {
      throw new BadRequestError(`Invalid goal ID format: ${goalId}`);
    }

    // 目標の存在チェック
    const goal = goalsDb.findById(goalId);
    if (!goal) {
      throw new BadRequestError(`Goal not found: ${goalId}`);
    }

    // 所有権チェック
    if (goal.userId !== userId) {
      throw new ForbiddenError(`Access denied to goal: ${goalId}`);
    }
  }
}
```

### 6.2 フロントエンドバリデーション

- 目標選択時:
  - 選択された目標が有効か確認
  - 同じ目標が重複して選択されないようにする

---

## 7. エラーハンドリング

### 7.1 無効な目標IDが指定された場合

**シナリオ**: 日報作成・更新時に、存在しない目標IDまたはアクセス権限のない目標IDが指定された

**対応**:

- 400 Bad Request を返す
- エラーメッセージ: "Invalid goal ID: {goalId}" または "Goal not found: {goalId}"
- フロントエンドでエラーメッセージを表示

### 7.2 削除された目標が関連付けられている場合

**シナリオ**: 日報に関連付けられた目標が削除された

**対応**:

- 関連付けデータ（`DailyReportGoal`）は削除しない
- 日報取得時に、削除された目標は除外する（または「削除済み」としてマーク）

```typescript
// 削除された目標の除外例
const goals = dailyReportGoals
  .map((drg) => goalsDb.findById(drg.goalId))
  .filter((goal): goal is Goal => goal !== undefined);
```

### 7.3 目標詳細取得時のエラー

**シナリオ**: 目標詳細取得時に、関連日報の取得に失敗した

**対応**:

- 目標詳細は正常に返し、関連日報は空配列にする
- エラーログを出力

---

## 8. パフォーマンス最適化

### 8.1 N+1問題の回避

- 日報一覧取得時に、各日報に対して個別に目標情報を取得すると N+1 問題が発生する
- `findByDailyReportIds()` メソッドを使用して一括取得する
- 将来的にRDBMS導入時は、JOIN クエリで一度に取得する

### 8.2 目標選択のサジェスト表示

- 目標リストをキャッシュする（5分間）
- 検索時は、クライアント側でフィルタリングする
- フロントエンドで debounce を実装し、検索APIの呼び出し回数を減らす（300ms）

### 8.3 目標詳細画面での関連日報表示

- 初期表示は最大10件
- 「もっと見る」ボタンで追加読み込み（10件ずつ）
- 無限スクロールは実装しない（Phase 1）

### 8.4 日報一覧での目標表示

- 各日報に関連する目標は最大3つまで表示
- それ以上の目標がある場合は「+N」と表示
- 目標の詳細情報は必要最小限（id, name, startDate, endDate, parentId）
- 目標の表示優先順位: ユーザーが選択した順序（最初の3つ）

---

## 9. テスト方針

### 9.1 ユニットテスト

#### バックエンド

- `DailyReportGoalsDatabase` クラスのすべてのメソッドをテスト
  - `save()`: 日報と目標の関連付けを保存
  - `findByDailyReportId()`: 日報IDから関連目標を取得
  - `findByGoalId()`: 目標IDから関連日報を取得
  - `deleteByDailyReportId()`: 日報IDに関連する関連付けを削除
  - `exists()`: 関連付けが存在するか確認

- 日報作成・更新APIのテスト
  - `goalIds` が指定された場合の正常系
  - `goalIds` が指定されない場合の正常系
  - 無効な目標IDが指定された場合のエラーハンドリング
  - 削除された目標が指定された場合のエラーハンドリング

- 目標詳細取得APIのテスト
  - 関連日報が正しく取得されること
  - ページネーション（limit, offset）が正しく動作すること
  - 並び替え（sort）が正しく動作すること

#### フロントエンド

- `GoalSelectField` コンポーネントのテスト
  - 目標が正しく表示されること
  - 複数選択が可能なこと
  - 選択された目標がチップ形式で表示されること

- `GoalChip` コンポーネントのテスト
  - 目標名が正しく表示されること
  - クリック時に目標詳細画面に遷移すること
  - 削除ボタンが正しく動作すること

- `RelatedDailyReportsList` コンポーネントのテスト
  - 関連日報が正しく表示されること
  - 並び替えが正しく動作すること
  - 「もっと見る」ボタンが正しく動作すること

### 9.2 統合テスト

- 日報作成時に目標を関連付ける一連の流れをテスト
- 日報編集時に目標の関連付けを変更する一連の流れをテスト
- 目標詳細画面で関連日報を表示する一連の流れをテスト

### 9.3 E2Eテスト

- US-1: 日報作成時の目標関連付け
- US-2: 日報編集時の目標関連付けの変更
- US-3: 日報一覧での目標表示
- US-4: 目標詳細画面での関連日報表示
- US-5: 目標階層構造との整合性

---

## 10. マイグレーション

### 10.1 既存データへの影響

- 既存の日報データには影響なし
- 既存の目標データには影響なし
- 新規テーブル `DailyReportGoal` を追加

### 10.2 データ移行

Phase 1では、既存の日報に対して目標を自動的に関連付けることはしない。
ユーザーが手動で関連付けを追加する必要がある。

（Phase 2で自動関連付け機能を検討）

---

## 11. セキュリティ

### 11.1 アクセス制御

- 日報作成・更新時に、関連付ける目標がユーザーの所有物であることを確認
- 目標詳細取得時に、目標がユーザーの所有物であることを確認
- 日報詳細取得時に、日報がユーザーの所有物であることを確認

### 11.2 データ整合性

- `DailyReportGoal` テーブルに外部キー制約を追加（実装時）
- 日報削除時に、関連付けデータも削除する
  - `DailyReportsDatabase.delete()` メソッドで `dailyReportGoalsDb.deleteByDailyReportId()` を呼び出す
  - 将来的にRDBMS導入時は、CASCADE DELETE を使用
- 目標削除時に、関連付けデータは削除しない（目標は「削除済み」としてマーク）
  - Phase 2以降で、削除された目標の関連付けデータのクリーンアップを検討

---

## 12. Phase 2以降の検討事項

### 12.1 自動関連付けの提案

- 週次フォーカスに設定された目標を、その週の日報作成時に自動的に提案する
- キーワードベースの関連付け提案（日報の内容から目標を推薦）

### 12.2 関連付けの分析

- 目標ごとの貢献度を定量化（複数の目標に関連付けられた日報の扱い）
- 目標達成率の計算に関連日報を活用

---

## 13. 依存関係

### 13.1 前提となる機能

- **BL-01: 目標階層管理機能**（必須、実装済み）
  - `Goal` モデル
  - 目標の作成・編集・削除API
  - 目標詳細取得API

### 13.2 関連する機能

- **日報機能**（既存）
  - `DailyReport` モデル
  - 日報作成・編集・削除API
  - 日報一覧・詳細取得API

### 13.3 後続機能への影響

- **BL-04: フォローアップと目標の接続機能**
  - 本機能と同様の設計パターンを採用予定（`FollowupGoal` テーブル）

- **BL-06: 目標別取り組み集約表示機能**
  - 本機能で実装される `DailyReportGoal` テーブルを活用

- **BL-07: アクティビティタイムライン機能**
  - 本機能で実装される `DailyReportGoal` テーブルを活用

---

## 14. セルフレビュー結果

### 14.1 データモデルの妥当性

- [x] 多対多関係を中間テーブルで管理している
- [x] ユニーク制約とインデックスが適切に設定されている
- [x] 外部キー制約が考慮されている

### 14.2 API設計の妥当性

- [x] 既存APIを適切に拡張している
- [x] レスポンスに必要な情報が含まれている
- [x] ページネーション対応している
- [x] エラーハンドリングが定義されている

### 14.3 パフォーマンスへの配慮

- [x] 目標選択時のキャッシュが考慮されている
- [x] 目標詳細画面での関連日報表示にページネーション対応
- [x] 日報一覧での目標表示は必要最小限の情報のみ

### 14.4 テスト方針の妥当性

- [x] ユニットテスト、統合テスト、E2Eテストが定義されている
- [x] 各ユーザーストーリーをカバーするE2Eテストが計画されている

**ステータス**: Approved（Helperレビュー完了、PdMレビュー完了）

---

_本Tech Specは、日報と目標の関連付け機能の技術的な設計を定義したものです。_
