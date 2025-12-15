# 目標階層管理機能 技術設計書（Tech Spec）

**バージョン**: v1  
**作成日**: 2025-12-13  
**作成者**: Eng  
**ステータス**: Approved  
**承認日**: 2025-12-13  
**承認者**: Helper, PdM

---

## 1. 概要

目標階層管理機能の技術的な設計・実装方針を定義する。  
目標を階層的に定義・管理し、既存の週次フォーカス機能と接続する。

---

## 2. データモデル

### 2.1 Goal（目標）

| フィールド      | 型                  | 必須 | 説明                                                     |
| :-------------- | :------------------ | :--- | :------------------------------------------------------- |
| id              | string (UUID)       | ○    | 一意識別子                                               |
| userId          | string              | ○    | 作成者のユーザーID                                       |
| name            | string              | ○    | 目標名（最大100文字）                                    |
| description     | string \| null      | -    | 目標の説明（最大1000文字）                               |
| startDate       | string (YYYY-MM-DD) | ○    | 開始日                                                   |
| endDate         | string (YYYY-MM-DD) | ○    | 終了日                                                   |
| parentId        | string \| null      | -    | 上位目標のID（最上位の場合はnull）                       |
| goalType        | enum \| null        | -    | 目標の性質（'skill' \| 'project' \| 'habit' \| 'other'） |
| successCriteria | string \| null      | -    | 達成基準（最大500文字）                                  |
| createdAt       | string              | ○    | 作成日時                                                 |
| updatedAt       | string              | ○    | 更新日時                                                 |

**制約**:

- `startDate <= endDate` であること
- `parentId` が設定されている場合、下位目標の期間は上位目標の期間内に収まること
- 循環参照が発生しないこと
- 階層の深さは最大4階層まで

**目標の性質（goalType）**:

- `'skill'`: スキル習得
- `'project'`: プロジェクト完了
- `'habit'`: 習慣形成
- `'other'`: その他
- `null`: 未設定（Phase 1では任意）

### 2.2 WeeklyFocus（週次フォーカス）の拡張

既存の `WeeklyFocus` モデルに `goalId` フィールドを追加する。

| フィールド    | 型                  | 必須 | 説明                                  |
| :------------ | :------------------ | :--- | :------------------------------------ |
| id            | string (UUID)       | ○    | 一意識別子                            |
| userId        | string              | ○    | 作成者のユーザーID                    |
| itemType      | enum                | ○    | 'goodPoint' \| 'improvement'          |
| itemId        | string              | ○    | 対象のよかったこと/改善点のID         |
| goalId        | string \| null      | -    | 短期目標のID（接続時、Phase 1で追加） |
| weekStartDate | string (YYYY-MM-DD) | ○    | 週の開始日（月曜日、ISO 8601準拠）    |
| createdAt     | string              | ○    | 作成日時                              |

**制約**:

- `goalId` が設定されている場合、その目標は短期目標（最下位階層）であること
- `goalId` が設定されている場合、その目標はユーザーの所有物であること

---

## 3. API設計

### 3.1 GET /api/goals

目標一覧を取得する。階層構造を含む。

**Query Parameters**:

- `hierarchy`: boolean（オプション）- 階層構造を含めるかどうか（デフォルト: true）

**Response**:

- 200 OK: 成功

```json
{
  "data": [
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
      "children": [
        {
          "id": "child-goal-id",
          "userId": "user-id",
          "name": "下位目標名",
          "parentId": "goal-id",
          "children": []
        }
      ]
    }
  ]
}
```

**ビジネスロジック**:

- ユーザーの所有する目標のみを返却
- `hierarchy=true` の場合、階層構造を再帰的に構築して返却
- `hierarchy=false` の場合、フラットなリストを返却

### 3.2 GET /api/goals/:id

目標詳細を取得する。

**Response**:

- 200 OK: 成功
- 404 Not Found: 目標が見つからない
- 403 Forbidden: アクセス権限なし

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
  "parent": {
    "id": "parent-goal-id",
    "name": "上位目標名"
  },
  "children": [
    {
      "id": "child-goal-id",
      "name": "下位目標名"
    }
  ]
}
```

### 3.3 POST /api/goals

目標を作成する。

**Request Body**:

```json
{
  "name": "目標名",
  "description": "目標の説明",
  "startDate": "2025-01-01",
  "endDate": "2025-06-30",
  "parentId": null,
  "goalType": "skill",
  "successCriteria": "達成基準"
}
```

**Response**:

- 201 Created: 作成成功
- 400 Bad Request: バリデーションエラー
- 401 Unauthorized: 未認証

**バリデーション**:

- `name`: 必須、最大100文字
- `description`: 任意、最大1000文字
- `startDate`: 必須、YYYY-MM-DD形式
- `endDate`: 必須、YYYY-MM-DD形式、`startDate <= endDate`
- `parentId`: 任意、存在する目標のID
- `goalType`: 任意、enum値のみ許可
- `successCriteria`: 任意、最大500文字
- 期間の整合性: `parentId` が設定されている場合、下位目標の期間は上位目標の期間内に収まること
- 循環参照の防止: 循環参照が発生しないこと

### 3.4 PUT /api/goals/:id

目標を更新する。

**Request Body**:

```json
{
  "name": "更新後の目標名",
  "description": "更新後の説明",
  "startDate": "2025-01-01",
  "endDate": "2025-06-30",
  "parentId": null,
  "goalType": "skill",
  "successCriteria": "更新後の達成基準"
}
```

**Response**:

- 200 OK: 更新成功
- 400 Bad Request: バリデーションエラー
- 401 Unauthorized: 未認証
- 404 Not Found: 目標が見つからない
- 403 Forbidden: アクセス権限なし

**バリデーション**:

- POST /api/goals と同じ
- 期間を変更する際、下位目標の期間との整合性を確認

### 3.5 DELETE /api/goals/:id

目標を削除する。

**Response**:

- 200 OK: 削除成功
- 401 Unauthorized: 未認証
- 404 Not Found: 目標が見つからない
- 403 Forbidden: アクセス権限なし
- 400 Bad Request: 下位目標が存在する場合（将来実装）

**ビジネスロジック**:

- 下位目標が存在する場合、削除前に確認が必要（将来実装）
- Phase 1では、下位目標が存在する場合は削除を許可しない（エラーメッセージを返却）
- 削除対象の目標に接続されている週次フォーカス（`goalId` が削除対象の目標ID）を検索し、該当する週次フォーカスの `goalId` を `null` に更新する

### 3.6 GET /api/goals/hierarchy

階層構造を取得する（将来実装）。

**Response**:

- 200 OK: 成功

```json
{
  "data": [
    {
      "id": "goal-id",
      "name": "目標名",
      "children": [
        {
          "id": "child-goal-id",
          "name": "下位目標名",
          "children": []
        }
      ]
    }
  ]
}
```

**ビジネスロジック**:

- 階層構造を効率的に取得するためのAPI（パフォーマンス最適化用）
- Phase 1では実装しない（将来実装）

### 3.7 PUT /api/weekly-focuses/:id/goal

週次フォーカスと短期目標を接続する。

**Request Body**:

```json
{
  "goalId": "short-term-goal-id"
}
```

**Response**:

- 200 OK: 接続成功
- 400 Bad Request: バリデーションエラー
- 401 Unauthorized: 未認証
- 404 Not Found: 週次フォーカスまたは目標が見つからない
- 403 Forbidden: アクセス権限なし

**バリデーション**:

- `goalId`: 必須、存在する目標のID
- 接続する目標は短期目標（最下位階層）であること
- 接続する目標はユーザーの所有物であること

### 3.8 DELETE /api/weekly-focuses/:id/goal

週次フォーカスと短期目標の接続を解除する。

**Response**:

- 200 OK: 解除成功
- 401 Unauthorized: 未認証
- 404 Not Found: 週次フォーカスが見つからない
- 403 Forbidden: アクセス権限なし

---

## 4. バリデーション

### 4.1 基本バリデーション

| フィールド      | ルール                                       |
| :-------------- | :------------------------------------------- |
| name            | 必須、最大100文字                            |
| description     | 任意、最大1000文字                           |
| startDate       | 必須、YYYY-MM-DD形式                         |
| endDate         | 必須、YYYY-MM-DD形式、`startDate <= endDate` |
| parentId        | 任意、存在する目標のID                       |
| goalType        | 任意、enum値のみ許可                         |
| successCriteria | 任意、最大500文字                            |

### 4.2 期間の整合性チェック

**ルール**: 下位目標の期間は上位目標の期間内に収まること

**実装**:

```typescript
function validatePeriod(goal: Goal, parentGoal: Goal | null): boolean {
  if (!parentGoal) {
    return true;
  }

  const goalStart = new Date(goal.startDate);
  const goalEnd = new Date(goal.endDate);
  const parentStart = new Date(parentGoal.startDate);
  const parentEnd = new Date(parentGoal.endDate);

  return goalStart >= parentStart && goalEnd <= parentEnd;
}
```

**エラーメッセージ**: "下位目標の期間は上位目標の期間内に収まる必要があります"

### 4.3 循環参照の防止

**ルール**: 循環参照が発生しないこと

**実装**:

```typescript
function validateCircularReference(
  goalId: string,
  newParentId: string | null,
  goals: Goal[],
): boolean {
  if (!newParentId) {
    return true;
  }

  let currentId = newParentId;
  const visited = new Set<string>();

  while (currentId) {
    if (currentId === goalId) {
      return false; // 循環参照が発生
    }

    if (visited.has(currentId)) {
      break;
    }

    visited.add(currentId);
    const goal = goals.find((g) => g.id === currentId);
    currentId = goal?.parentId || null;
  }

  return true;
}
```

**エラーメッセージ**: "この目標を上位目標に設定することはできません（循環参照が発生します）"

### 4.4 階層の深さチェック

**ルール**: 階層の深さは最大4階層まで

**実装**:

```typescript
function getDepth(goalId: string, goals: Goal[]): number {
  const goal = goals.find((g) => g.id === goalId);
  if (!goal || !goal.parentId) {
    return 1;
  }

  return 1 + getDepth(goal.parentId, goals);
}

function validateDepth(goal: Goal, goals: Goal[]): boolean {
  const depth = getDepth(goal.id, goals);
  return depth <= 4;
}
```

**エラーメッセージ**: "階層の深さは最大4階層までです"

### 4.5 週次フォーカスとの接続バリデーション

**ルール**: 接続する目標は短期目標（最下位階層）であること

**実装**:

```typescript
function isLeafGoal(goalId: string, goals: Goal[]): boolean {
  const hasChildren = goals.some((g) => g.parentId === goalId);
  return !hasChildren;
}
```

**エラーメッセージ**: "週次フォーカスと接続できるのは短期目標（最下位階層）のみです"

---

## 5. シーケンス図

### 5.1 目標の作成

```
[Client] -> [API] POST /api/goals
[API] -> [Validation] バリデーション実行
[Validation] -> [API] バリデーション結果
[API] -> [DB] 目標を保存
[DB] -> [API] 保存結果
[API] -> [Client] 201 Created
```

### 5.2 目標の階層的ブレイクダウン

```
[Client] -> [API] POST /api/goals (parentId指定)
[API] -> [Validation] 期間の整合性チェック
[Validation] -> [API] 検証結果
[API] -> [DB] 下位目標を保存
[DB] -> [API] 保存結果
[API] -> [Client] 201 Created
```

### 5.3 週次フォーカスと短期目標の接続

```
[Client] -> [API] PUT /api/weekly-focuses/:id/goal
[API] -> [Validation] 短期目標の検証
[Validation] -> [API] 検証結果
[API] -> [DB] WeeklyFocus.goalIdを更新
[DB] -> [API] 更新結果
[API] -> [Client] 200 OK
```

---

## 6. 実装方針

### 6.1 データベース設計

**インメモリDB**: 既存のパターンに従い、`apps/api/src/db/goals.db.ts` を作成する。

**主要メソッド**:

- `save(goal: Goal): void` - 目標を保存
- `findById(id: string): Goal | undefined` - IDで目標を取得
- `findByUserId(userId: string): Goal[]` - ユーザーIDで目標一覧を取得
- `findByParentId(parentId: string): Goal[]` - 上位目標IDで下位目標一覧を取得
- `delete(id: string): void` - 目標を削除
- `hasChildren(id: string): boolean` - 下位目標が存在するか確認

### 6.2 API実装

**ルーティング**: `apps/api/src/routes/goals.routes.ts` を作成する。

**認証**: 既存の `authMiddleware` を活用する。

**エラーハンドリング**: 既存のパターンに従い、適切なHTTPステータスコードとエラーメッセージを返却する。

### 6.3 週次フォーカスとの接続

**モデル拡張**: `apps/api/src/models/daily-report.model.ts` の `WeeklyFocus` インターフェースに `goalId` フィールドを追加する。

**DB拡張**: `apps/api/src/db/weekly-focuses.db.ts` の実装は変更不要（フィールド追加のみ）。

**API拡張**: `apps/api/src/routes/weekly-focuses.routes.ts` に接続・解除のエンドポイントを追加する。

---

## 7. エラーハンドリング

| エラーケース                 | HTTPステータス | レスポンス                                                                            |
| :--------------------------- | :------------- | :------------------------------------------------------------------------------------ |
| バリデーションエラー         | 400            | `{ message: "エラーメッセージ" }`                                                     |
| 未認証                       | 401            | `{ message: "認証が必要です" }`                                                       |
| アクセス権限なし             | 403            | `{ message: "アクセス権限がありません" }`                                             |
| 目標が見つからない           | 404            | `{ message: "目標が見つかりません" }`                                                 |
| 下位目標が存在する（削除時） | 400            | `{ message: "下位目標が存在するため削除できません" }`                                 |
| 期間の整合性エラー           | 400            | `{ message: "下位目標の期間は上位目標の期間内に収まる必要があります" }`               |
| 循環参照エラー               | 400            | `{ message: "この目標を上位目標に設定することはできません（循環参照が発生します）" }` |
| 階層の深さエラー             | 400            | `{ message: "階層の深さは最大4階層までです" }`                                        |
| サーバーエラー               | 500            | `{ message: "エラーが発生しました。しばらく経ってから再試行してください" }`           |

---

## 8. セキュリティ考慮事項

### 8.1 認証・認可

- 既存の `authMiddleware` を活用し、認証済みユーザーのみアクセス可能
- 目標作成・更新・削除時は、ユーザーIDを確認
- 他のユーザーの目標にアクセスできないようにする

### 8.2 入力値の検証

- すべての入力値をバリデーション
- SQLインジェクション対策（インメモリDBのため現時点では不要）
- XSS対策（フロントエンド側で実装）

---

## 9. パフォーマンス考慮事項

### 9.1 階層構造の取得

**現状**:

- インメモリDBを使用しているため、現時点ではパフォーマンス問題は発生しにくい
- 階層構造の取得は再帰的に行うが、目標数が少ない場合は問題なし

**将来の考慮事項**:

- DBに移行する場合は、インデックスを適切に設定する必要がある
- `parentId` と `userId` の複合インデックスを設定
- 階層構造の取得を最適化（一括取得APIの実装）

### 9.2 循環参照の検証

**実装方針**:

- 目標作成・更新時に循環参照を検証
- 検証処理は再帰的に行うが、階層の深さが最大4階層のため、パフォーマンス問題は発生しにくい

---

## 10. 既存実装との互換性

### 10.1 週次フォーカス機能

**モデル拡張**:

- `WeeklyFocus` モデルに `goalId` フィールドを追加（任意）
- 既存の週次フォーカスは `goalId` が `null` のまま動作
- 後方互換性を保つ

**API互換性**:

- 既存の週次フォーカスAPIは維持
- 新規API（接続・解除）を追加
- 既存のクライアントコードへの影響を最小限に抑える

---

## 11. テスト戦略

### 11.1 ユニットテスト

**テスト対象**:

- 期間の整合性チェックロジック
- 循環参照の防止ロジック
- 階層構造の取得ロジック
- バリデーション処理

### 11.2 統合テスト

**テスト対象**:

- 目標作成API
- 目標更新API
- 目標削除API
- 階層構造取得API
- 週次フォーカスとの接続API

### 11.3 E2Eテスト

**テスト対象**:

- 目標の作成フロー
- 目標の階層的ブレイクダウン
- 目標間の関係性の可視化
- 週次フォーカスと短期目標の接続

---

## 関連ドキュメント

- PRD: `docs/features/goal-hierarchy-management/prd.md`
- UI Design: `docs/features/goal-hierarchy-management/ui_design.md`
- Tech Research: `docs/features/goal-hierarchy-management/tech_research.md`
- Discovery成果物: `.discovery/archived/2025-12-13/`
- 既存機能: `docs/features/weekly-focus-management/tech_spec.md`（週次フォーカス管理機能）

---

## 12. 実装チェックリスト

### Phase 1（MVP）

- [ ] データモデル定義（Goalモデル）
- [ ] データベース実装（goals.db.ts）
- [ ] API実装（goals.routes.ts）
- [ ] バリデーションロジック実装
- [ ] 週次フォーカスモデルの拡張（goalId追加）
- [ ] 週次フォーカス接続API実装
- [ ] ユニットテスト実装
- [ ] 統合テスト実装
- [ ] E2Eテスト実装

---

---

## 13. セルフレビュー結果

### 13.1 PRD ↔ Tech Spec 整合性チェック

#### ✅ 整合している項目

| 項目                     | PRD                                      | Tech Spec                                      | 状態 |
| :----------------------- | :--------------------------------------- | :--------------------------------------------- | :--- |
| 目標の階層構造定義・管理 | 目標を階層的に定義・管理できる           | Goalモデル、parentIdによる階層表現             | ✅   |
| 目標の期間設定           | 柔軟な期間設定（半期、四半期、1ヶ月等）  | startDate/endDateで柔軟に設定可能              | ✅   |
| 目標間の関係性可視化     | 階層構造をツリー形式で表示               | GET /api/goals (hierarchy=true) で階層構造取得 | ✅   |
| 週次フォーカスとの接続   | 短期目標から週次フォーカスを設定可能     | PUT /api/weekly-focuses/:id/goal で接続        | ✅   |
| 期間の整合性チェック     | 下位目標の期間は上位目標の期間内に収まる | validatePeriod関数で実装                       | ✅   |
| 循環参照の防止           | 循環参照が発生しない                     | validateCircularReference関数で実装            | ✅   |
| 階層の深さ制限           | 最大4階層まで                            | validateDepth関数で実装                        | ✅   |

#### ✅ 受入基準（AC）の実現確認

| AC   | 受入基準                       | Tech Specでの実現方法            | 状態 |
| :--- | :----------------------------- | :------------------------------- | :--- |
| AC-1 | 長期目標の作成                 | POST /api/goals (parentId=null)  | ✅   |
| AC-2 | 目標の階層的ブレイクダウン     | POST /api/goals (parentId指定)   | ✅   |
| AC-3 | 目標間の関係性の可視化         | GET /api/goals (hierarchy=true)  | ✅   |
| AC-4 | 週次フォーカスと短期目標の接続 | PUT /api/weekly-focuses/:id/goal | ✅   |
| AC-5 | 目標の編集                     | PUT /api/goals/:id               | ✅   |
| AC-6 | 目標の削除                     | DELETE /api/goals/:id            | ✅   |
| AC-7 | 期間の整合性チェック           | validatePeriod関数               | ✅   |
| AC-8 | 循環参照の防止                 | validateCircularReference関数    | ✅   |

### 13.2 設計の妥当性確認

#### ✅ データモデル

- GoalモデルはPRDの要件を満たしている
- WeeklyFocusモデルの拡張（goalId追加）は既存機能との互換性を保っている
- 階層構造の表現（parentId）は適切

#### ✅ API設計

- CRUD操作が適切に定義されている
- 階層構造の取得方法が明確
- 週次フォーカスとの接続方法が明確
- エラーハンドリングが適切

#### ✅ バリデーションロジック

- 基本バリデーションが適切
- 期間の整合性チェックが実装されている
- 循環参照の防止が実装されている
- 階層の深さチェックが実装されている

#### ✅ 既存実装との互換性

- 既存の週次フォーカス機能との互換性が保たれている
- 既存のAPIパターンに従っている
- 既存の認証ミドルウェアを活用している

### 13.3 改善点

**現時点での改善点**: なし

Tech SpecはPRDの要件を正しく実現しており、設計の妥当性も確認できました。

---

---

## 14. レビュー結果

### Helperレビュー

- **レビュー日**: 2025-12-13
- **承認者**: Helper
- **改善提案**: 目標削除時の週次フォーカス接続の扱いを追加（反映済み）

### PdMレビュー

- **レビュー日**: 2025-12-13
- **承認者**: PdM
- **評価**: PRDの要件を正しく実現しており、要件充足度は十分。ビジネスルールも正しく反映されている。

---

_本Tech Specは Approved ステータスです。Helperレビュー・PdMレビュー完了後、承認されました。_
