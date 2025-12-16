# Eng/Des クロスレビュー

**機能名**: 日報と目標の関連付け機能
**レビュー日**: 2025-12-16
**レビュアー**: Eng, Des
**ステータス**: Approved

---

## 1. レビュー観点

### 1.1 UIが必要とするデータがAPIで提供されるか

#### GoalMultiSelectField

**必要なデータ**:

- 目標一覧（id, name, startDate, endDate, parentId）

**API**:

- `GET /api/goals` で目標一覧を取得可能
- レスポンスに必要な情報（id, name, startDate, endDate, parentId）が含まれている

**判定**: ✅ APIで提供されている

#### GoalChip

**必要なデータ**:

- 目標ID、目標名

**API**:

- `GET /api/daily-reports/:id` で日報詳細を取得時に、`goals` フィールドに目標情報（id, name等）が含まれている
- `GET /api/daily-reports` で日報一覧を取得時に、各日報の `goals` フィールドに目標情報が含まれている

**判定**: ✅ APIで提供されている

#### RelatedDailyReportsList

**必要なデータ**:

- 関連日報一覧（id, date, events, createdAt）
- 関連日報の総数

**API**:

- `GET /api/goals/:id` で目標詳細を取得時に、`relatedDailyReports` フィールドに関連日報情報が含まれている
- `relatedDailyReportsCount` フィールドに関連日報の総数が含まれている
- `limit`, `offset`, `sort` パラメータでページネーション・並び替えが可能

**判定**: ✅ APIで提供されている

### 1.2 UIの操作（ボタン押下等）に対応するAPIが定義されているか

#### 日報作成時の目標関連付け

**UI操作**:

- 目標選択フィールドで目標を選択
- 保存ボタンをクリック

**API**:

- `POST /api/daily-reports` に `goalIds` パラメータを指定して日報を作成
- リクエストボディに `goalIds: string[]` を含める

**判定**: ✅ APIが定義されている

#### 日報編集時の目標変更

**UI操作**:

- 目標チップの削除ボタンをクリック
- 目標選択フィールドで新しい目標を追加
- 保存ボタンをクリック

**API**:

- `PUT /api/daily-reports/:id` に `goalIds` パラメータを指定して日報を更新
- リクエストボディに `goalIds: string[]` を含める

**判定**: ✅ APIが定義されている

#### 目標詳細画面での関連日報取得

**UI操作**:

- 目標詳細画面を開く
- 並び替えセレクトで並び順を変更
- 「もっと見る」ボタンをクリック

**API**:

- `GET /api/goals/:id?limit=10&offset=0&sort=desc` で目標詳細と関連日報を取得
- `limit`, `offset`, `sort` パラメータでページネーション・並び替えが可能

**判定**: ✅ APIが定義されている

### 1.3 齟齬がないか

#### データモデルの整合性

**Tech Spec（データモデル）**:

```typescript
export interface DailyReportResponse {
  id: string;
  userId: string;
  date: string;
  events: string;
  learnings: string | null;
  goals: GoalSummary[]; // 関連する目標のサマリー
  goodPoints: GoodPoint[];
  improvements: Improvement[];
  createdAt: string;
  updatedAt: string;
}

export interface GoalSummary {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  parentId: string | null;
}
```

**UI Design（コンポーネント）**:

```typescript
interface GoalChipProps {
  goalId: string; // 目標ID
  goalName: string; // 目標名
  onClick?: () => void;
  onRemove?: () => void;
  showRemoveButton?: boolean;
  size?: "small" | "medium";
}
```

**齟齬の確認**:

- `GoalSummary` には `id`, `name`, `startDate`, `endDate`, `parentId` が含まれている
- `GoalChip` は `goalId` と `goalName` を受け取る
- `GoalSummary` から `id` と `name` を抽出して `GoalChip` に渡すことができる

**判定**: ✅ 齟齬なし

#### APIレスポンスとUIの整合性

**Tech Spec（APIレスポンス）**:

```json
{
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

**UI Design（コンポーネント）**:

```typescript
interface DailyReportListItemProps {
  reportId: string; // 日報ID
  date: string; // 日付（YYYY-MM-DD）
  events: string; // やったこと
  onClick?: () => void;
}
```

**齟齬の確認**:

- APIレスポンスには `id`, `date`, `events`, `createdAt` が含まれている
- `DailyReportListItem` は `reportId`, `date`, `events` を受け取る
- APIレスポンスから必要な情報を抽出して `DailyReportListItem` に渡すことができる

**判定**: ✅ 齟齬なし

---

## 2. 改善提案

### 2.1 UI Design の改善提案

#### 提案1: 目標選択フィールドのレスポンス型定義

**問題**: UI Design では、目標選択フィールドがどのような API レスポンスを期待しているか明確でない

**提案**:

- Tech Spec で定義された `Goal` または `GoalSummary` 型を使用することを明記する
- または、UI Design で期待するレスポンス型を明記する

**対応**:

- UI Design に「APIレスポンス: `GET /api/goals` で取得した `Goal` の一覧を使用」と明記する

#### 提案2: 関連日報一覧の空状態メッセージ

**問題**: Tech Spec では空状態メッセージが定義されているが、UI Design では「空状態の表示」としか記載されていない

**提案**:

- UI Design で空状態メッセージを明記する

**対応**:

- UI Design に「空状態メッセージ: 『この目標に関連する日報はまだありません』」と明記する

### 2.2 Tech Spec の改善提案

#### 提案3: 目標選択用の専用APIエンドポイント

**問題**: 現在の `GET /api/goals` は目標詳細（階層構造を含む）を返すが、目標選択フィールドでは簡易情報（id, name, parentId）のみで十分

**提案**:

- 目標選択用の専用APIエンドポイント `GET /api/goals/summary` を追加する
- または、`GET /api/goals?fields=id,name,parentId` のようにクエリパラメータでフィールドを指定できるようにする

**判断**:

- Phase 1では `GET /api/goals` をそのまま使用する
- Phase 2以降で、パフォーマンス改善のために専用APIを検討する

---

## 3. 承認

Tech Spec と UI Design の整合性を確認しました。UIが必要とするデータはすべてAPIで提供されており、UIの操作に対応するAPIも定義されています。齟齬もありません。

上記の改善提案（提案1、提案2）は軽微なものであり、実装時に対応可能です。提案3はPhase 2以降で検討します。

**承認日**: 2025-12-16
**承認者**: Eng, Des

**ステータス**: Approved

次のステップ（プロトタイプ作成）に進むことを承認します。

---

_本クロスレビューは、Tech Spec と UI Design の整合性を確認したものです。_
