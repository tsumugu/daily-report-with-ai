# 編集機能 技術設計書（Tech Spec）

**バージョン**: Phase 3-1  
**作成日**: 2025-01-XX  
**作成者**: Eng  
**ステータス**: Approved  
**承認日**: 2025-01-XX  
**承認者**: Helper, PdM

---

## 1. 概要

編集機能の技術的な設計・実装方針を定義する。  
日報の編集機能、エピソード/アクションの編集機能、ステータス自動再計算機能を実装する。

---

## 2. データモデル

### 2.1 既存モデルの活用

既存のデータモデルをそのまま使用する。変更は不要。

#### DailyReport（日報）

| フィールド     | 型             | 必須 | 説明                 |
| :------------- | :------------- | :--- | :------------------- |
| id             | string (UUID)  | ○    | 一意識別子           |
| userId         | string         | ○    | 作成者のユーザーID   |
| date           | string         | ○    | 日付（YYYY-MM-DD）   |
| events         | string         | ○    | できごと             |
| learnings      | string \| null | -    | 学び                 |
| goodPointIds   | string[]       | -    | よかったことのID一覧 |
| improvementIds | string[]       | -    | 改善点のID一覧       |
| createdAt      | DateTime       | ○    | 作成日時             |
| updatedAt      | DateTime       | ○    | 更新日時             |

#### GoodPoint（よかったこと）

| フィールド    | 型             | 必須 | 説明                                           |
| :------------ | :------------- | :--- | :--------------------------------------------- |
| id            | string (UUID)  | ○    | 一意識別子                                     |
| userId        | string         | ○    | 作成者のユーザーID                             |
| content       | string         | ○    | 内容                                           |
| factors       | string \| null | -    | 要因・背景                                     |
| tags          | string[]       | -    | タグ（カテゴリ等）                             |
| status        | enum           | ○    | 未着手 / 進行中 / 再現成功 / 定着 / 再現できず |
| success_count | number         | ○    | 成功回数（デフォルト: 0）                      |
| createdAt     | DateTime       | ○    | 作成日時                                       |
| updatedAt     | DateTime       | ○    | 更新日時                                       |

#### Improvement（改善点）

| フィールド    | 型             | 必須 | 説明                                     |
| :------------ | :------------- | :--- | :--------------------------------------- |
| id            | string (UUID)  | ○    | 一意識別子                               |
| userId        | string         | ○    | 作成者のユーザーID                       |
| content       | string         | ○    | 改善したい内容                           |
| action        | string \| null | -    | 具体的アクション                         |
| status        | enum           | ○    | 未着手 / 進行中 / 完了 / 習慣化 / 未達成 |
| success_count | number         | ○    | 成功回数（デフォルト: 0）                |
| createdAt     | DateTime       | ○    | 作成日時                                 |
| updatedAt     | DateTime       | ○    | 更新日時                                 |

#### Followup（フォローアップ）

| フィールド | 型                  | 必須 | 説明                                                       |
| :--------- | :------------------ | :--- | :--------------------------------------------------------- |
| id         | string (UUID)       | ○    | 一意識別子                                                 |
| userId     | string              | ○    | 作成者のユーザーID                                         |
| itemType   | enum                | ○    | 'goodPoint' \| 'improvement'                               |
| itemId     | string              | ○    | 対象のよかったこと/改善点のID                              |
| status     | enum                | ○    | エピソード: '再現成功'（固定）、アクション: '完了'（固定） |
| memo       | string \| null      | -    | 再現メモ/進捗メモ（最大500文字）                           |
| date       | string (YYYY-MM-DD) | ○    | 再現日/完了日（必須）                                      |
| createdAt  | DateTime            | ○    | 作成日時                                                   |
| updatedAt  | DateTime            | ○    | 更新日時                                                   |

---

## 3. DBスキーマ設計

### 3.1 既存DBの活用

既存のデータベースクラスをそのまま使用する。変更は不要。

#### DailyReportsDatabase

```typescript
class DailyReportsDatabase {
  private reports: Map<string, DailyReport> = new Map();

  save(report: DailyReport): void;
  findById(id: string): DailyReport | undefined;
  findByUserIdAndDate(userId: string, date: string): DailyReport | undefined;
  findAllByUserId(userId: string): DailyReport[];
  update(report: DailyReport): void; // 既存メソッド
  clear(): void;
}
```

#### GoodPointsDatabase

```typescript
class GoodPointsDatabase {
  private goodPoints: Map<string, GoodPoint> = new Map();

  save(goodPoint: GoodPoint): void;
  findById(id: string): GoodPoint | undefined;
  findAllByUserId(userId: string): GoodPoint[];
  update(goodPoint: GoodPoint): void; // 既存メソッド
  delete(id: string): void; // 新規追加（日報更新時の削除用）
  clear(): void;
}
```

**新規メソッド追加**:

- `delete(id: string): void` - よかったこと削除用

#### ImprovementsDatabase

```typescript
class ImprovementsDatabase {
  private improvements: Map<string, Improvement> = new Map();

  save(improvement: Improvement): void;
  findById(id: string): Improvement | undefined;
  findAllByUserId(userId: string): Improvement[];
  update(improvement: Improvement): void; // 既存メソッド
  delete(id: string): void; // 新規追加（日報更新時の削除用）
  clear(): void;
}
```

**新規メソッド追加**:

- `delete(id: string): void` - 改善点削除用

#### FollowupsDatabase

```typescript
class FollowupsDatabase {
  private followups: Map<string, Followup> = new Map();

  save(followup: Followup): void;
  findById(id: string): Followup | undefined;
  findByItemId(
    itemType: "goodPoint" | "improvement",
    itemId: string,
  ): Followup[];
  findAllByUserId(userId: string): Followup[];
  update(followup: Followup): void; // 新規追加（エピソード/アクション更新用）
  delete(id: string): void;
  clear(): void;
}
```

**新規メソッド追加**:

- `update(followup: Followup): void` - エピソード/アクション更新用

---

## 4. API設計

### 4.1 日報更新API

#### PUT /api/daily-reports/:id

日報を更新する。

**Request Body**

```json
{
  "date": "2025-01-15",
  "events": "できごと",
  "learnings": "学び（任意）",
  "goodPoints": [
    {
      "id": "existing-good-point-id", // 既存のID（編集時）
      "content": "よかったこと",
      "factors": "要因（任意）",
      "tags": ["タグ1", "タグ2"]
    },
    {
      // idがない場合は新規作成
      "content": "新しいよかったこと",
      "factors": "要因",
      "tags": []
    }
  ],
  "improvements": [
    {
      "id": "existing-improvement-id", // 既存のID（編集時）
      "content": "改善点",
      "action": "アクション（任意）"
    },
    {
      // idがない場合は新規作成
      "content": "新しい改善点",
      "action": "アクション"
    }
  ]
}
```

**処理フロー**:

1. 認証チェック（認証ミドルウェア）
2. 日報の存在確認（`dailyReportsDb.findById`）
3. 編集権限チェック（`report.userId === userId`）
4. バリデーション（既存の`validateDailyReport`関数を使用）
5. 日付変更時の同日チェック:
   - 日付が変更された場合（`body.date !== report.date`）、新しい日付で既に日報が存在するかチェック（`dailyReportsDb.findByUserIdAndDate`）
   - 既に存在し、かつその日報IDが更新対象の日報IDと異なる場合は400エラーを返す（「この日付の日報は既に存在します」）
6. よかったことの処理:
   - `id`がある場合:
     - ID整合性チェック: そのIDが日報の`goodPointIds`に含まれているか確認
     - 含まれていない場合は400エラーを返す（「このよかったことはこの日報に紐づいていません」）
     - 既存のよかったことを更新（`goodPointsDb.update`）
   - `id`がない場合: 新規作成（`goodPointsDb.save`）
   - リクエストに含まれていない既存のよかったことについて:
     - フォローアップデータが存在するか確認（`followupsDb.findByItemId('goodPoint', goodPointId)`）
     - フォローアップデータが存在しない場合のみ削除（`goodPointsDb.delete`メソッドを実装）
     - フォローアップデータが存在する場合は削除しない（PRDの要件）
7. 改善点の処理:
   - `id`がある場合:
     - ID整合性チェック: そのIDが日報の`improvementIds`に含まれているか確認
     - 含まれていない場合は400エラーを返す（「この改善点はこの日報に紐づいていません」）
     - 既存の改善点を更新（`improvementsDb.update`）
   - `id`がない場合: 新規作成（`improvementsDb.save`）
   - リクエストに含まれていない既存の改善点について:
     - フォローアップデータが存在するか確認（`followupsDb.findByItemId('improvement', improvementId)`）
     - フォローアップデータが存在しない場合のみ削除（`improvementsDb.delete`メソッドを実装）
     - フォローアップデータが存在する場合は削除しない（PRDの要件）
8. 日報の更新（`dailyReportsDb.update`）
9. レスポンス返却（`toDailyReportResponse`を使用）

**Response**

```json
{
  "id": "report-id",
  "userId": "user-id",
  "date": "2025-01-15",
  "events": "できごと",
  "learnings": "学び",
  "goodPoints": [...],
  "improvements": [...],
  "createdAt": "2025-01-15T00:00:00.000Z",
  "updatedAt": "2025-01-15T12:00:00.000Z"
}
```

**エラーレスポンス**

| HTTPステータス | 説明                     |
| :------------- | :----------------------- |
| 400            | バリデーションエラー     |
| 401            | 認証が必要               |
| 403            | アクセス権限がありません |
| 404            | 日報が見つかりません     |
| 500            | サーバーエラー           |

**注意**: よかったこと/改善点の削除は、リクエストに含まれていない既存のIDを削除することで実現する。ただし、フォローアップデータが存在する場合は削除しない（PRDの要件）。

### 4.2 エピソード更新API

#### PUT /api/good-points/:id/followups/:followupId

よかったことのエピソードを更新する。

**Request Body**

```json
{
  "date": "2025-01-15",
  "memo": "再現メモ（任意、最大500文字）"
}
```

**処理フロー**:

1. 認証チェック（認証ミドルウェア）
2. よかったことの存在確認（`goodPointsDb.findById`）
3. 編集権限チェック（`goodPoint.userId === userId`）
4. エピソードの存在確認（`followupsDb.findById`）
5. エピソードの編集権限チェック（`followup.userId === userId`）
6. バリデーション（既存の`validateFollowup`関数を使用）
7. エピソードの更新（`followupsDb.update`）
8. エピソード数の再カウント（`countEpisodes`）
9. ステータスの自動再計算（`calculateGoodPointStatus`）
10. よかったことの更新（`goodPointsDb.update`）
11. レスポンス返却

**Response**

```json
{
  "id": "followup-id",
  "userId": "user-id",
  "itemType": "goodPoint",
  "itemId": "good-point-id",
  "status": "再現成功",
  "memo": "再現メモ",
  "date": "2025-01-15",
  "createdAt": "2025-01-15T00:00:00.000Z",
  "updatedAt": "2025-01-15T12:00:00.000Z"
}
```

**エラーレスポンス**

| HTTPステータス | 説明                                    |
| :------------- | :-------------------------------------- |
| 400            | バリデーションエラー                    |
| 401            | 認証が必要                              |
| 403            | アクセス権限がありません                |
| 404            | よかったこと/エピソードが見つかりません |
| 500            | サーバーエラー                          |

### 4.3 アクション更新API

#### PUT /api/improvements/:id/followups/:followupId

改善点のアクションを更新する。

**Request Body**

```json
{
  "date": "2025-01-15",
  "memo": "進捗メモ（任意、最大500文字）"
}
```

**処理フロー**:

1. 認証チェック（認証ミドルウェア）
2. 改善点の存在確認（`improvementsDb.findById`）
3. 編集権限チェック（`improvement.userId === userId`）
4. アクションの存在確認（`followupsDb.findById`）
5. アクションの編集権限チェック（`followup.userId === userId`）
6. バリデーション（既存の`validateFollowup`関数を使用）
7. アクションの更新（`followupsDb.update`）
8. アクション数の再カウント（`countActions`）
9. ステータスの自動再計算（`calculateImprovementStatus`）
10. 改善点の更新（`improvementsDb.update`）
11. レスポンス返却

**Response**

```json
{
  "id": "followup-id",
  "userId": "user-id",
  "itemType": "improvement",
  "itemId": "improvement-id",
  "status": "完了",
  "memo": "進捗メモ",
  "date": "2025-01-15",
  "createdAt": "2025-01-15T00:00:00.000Z",
  "updatedAt": "2025-01-15T12:00:00.000Z"
}
```

**エラーレスポンス**

| HTTPステータス | 説明                              |
| :------------- | :-------------------------------- |
| 400            | バリデーションエラー              |
| 401            | 認証が必要                        |
| 403            | アクセス権限がありません          |
| 404            | 改善点/アクションが見つかりません |
| 500            | サーバーエラー                    |

---

## 5. ステータス自動再計算

### 5.1 再計算ロジック

既存のステータス自動判定ロジックを再利用する。

#### よかったことのステータス判定

```typescript
function calculateGoodPointStatus(episodeCount: number): GoodPointStatus {
  if (episodeCount === 0) {
    return "未着手";
  } else if (episodeCount >= 1 && episodeCount < 3) {
    return "進行中";
  } else {
    return "再現成功";
  }
}
```

#### 改善点のステータス判定

```typescript
function calculateImprovementStatus(actionCount: number): ImprovementStatus {
  if (actionCount === 0) {
    return "未着手";
  } else if (actionCount >= 1 && actionCount < 3) {
    return "進行中";
  } else {
    return "完了";
  }
}
```

### 5.2 再計算タイミング

- **エピソード/アクション更新後**: 更新APIの処理フロー内で自動実行
- **エピソード/アクション削除後**: 既存の削除APIで実装済み

### 5.3 エピソード/アクション数のカウント

既存の`countEpisodes`と`countActions`関数を再利用する。

```typescript
function countEpisodes(goodPointId: string): number {
  const followups = followupsDb.findByItemId("goodPoint", goodPointId);
  return followups.filter((f) => f.status === "再現成功").length;
}

function countActions(improvementId: string): number {
  const followups = followupsDb.findByItemId("improvement", improvementId);
  return followups.filter((f) => f.status === "完了").length;
}
```

---

## 6. データ整合性の確保

### 6.1 フォローアップデータの維持

- **日報編集後**: 既存のフォローアップデータは維持される
- **よかったこと/改善点の削除**: フォローアップデータが存在する場合は削除しない（PRDの要件）
- **日付変更**: 日報の日付を変更しても、フォローアップデータは維持される

### 6.2 関連データの整合性

- **よかったこと/改善点の更新**: `goodPointIds`と`improvementIds`の整合性を保つ
- **ステータスの整合性**: エピソード/アクション数とステータスの整合性を保つ
- **ユーザーIDの整合性**: すべての関連データが同じユーザーIDを持つことを確認

### 6.3 トランザクション処理

インメモリDBのため、トランザクション処理は不要。ただし、エラー発生時は以下の方法でロールバックを検討する：

- **更新前の状態を保存**: 更新前に既存のデータを保存しておき、エラー発生時に元に戻す
- **更新順序の考慮**: エラーが発生しにくい順序で処理する（例: 新規作成 → 更新 → 削除）
- **部分的な失敗の扱い**: 一部の処理が失敗した場合、エラーメッセージを返し、成功した部分はそのまま維持する

---

## 7. パフォーマンス最適化

### 7.1 レスポンス時間

- **目標**: 1秒以内
- **最適化**: インメモリDBを使用しているため、高速に動作する

### 7.2 再計算の最適化

- **エピソード/アクション数のカウント**: `findByItemId`で取得した結果をフィルタリング
- **ステータス判定**: 単純な数値比較のため、高速

### 7.3 データベース操作の最適化

- **既存メソッドの活用**: `update`メソッドを活用
- **不要な操作の削減**: 必要な場合のみデータベース操作を実行

---

## 8. エラーハンドリング

### 8.1 バリデーションエラー

既存のバリデーション関数を再利用する。

- `validateDailyReport`: 日報のバリデーション
- `validateGoodPoint`: よかったことのバリデーション
- `validateImprovement`: 改善点のバリデーション
- `validateFollowup`: フォローアップのバリデーション

### 8.2 エラーレスポンス

既存のエラーハンドリングパターンを踏襲する。

```json
{
  "message": "エラーメッセージ"
}
```

### 8.3 エラーケース

| エラーケース         | HTTPステータス | メッセージ                                                     |
| :------------------- | :------------- | :------------------------------------------------------------- |
| 認証エラー           | 401            | 認証が必要です                                                 |
| 権限エラー           | 403            | アクセス権限がありません                                       |
| リソース不存在       | 404            | 日報/よかったこと/改善点/エピソード/アクションが見つかりません |
| バリデーションエラー | 400            | バリデーションエラーメッセージ                                 |
| サーバーエラー       | 500            | エラーが発生しました                                           |

---

## 9. セキュリティ考慮事項

### 9.1 認証・認可

- **認証**: 既存の`authMiddleware`を使用
- **認可**: 作成者のみが編集可能（`userId`の一致を確認）

### 9.2 入力検証

- **サーバー側で必ず検証**: クライアント側の検証は補助的なもの
- **SQLインジェクション対策**: インメモリDBのため、SQLインジェクションのリスクは低い
- **XSS対策**: フロントエンド側で対策（サーバー側では文字列として保存）

---

## 10. 実装方針

### 10.1 実装順序

1. **データベースメソッドの追加**
   - `FollowupsDatabase`に`update`メソッドを追加（`apps/api/src/db/followups.db.ts`）
   - `GoodPointsDatabase`に`delete`メソッドを追加（`apps/api/src/db/daily-reports.db.ts`）
   - `ImprovementsDatabase`に`delete`メソッドを追加（`apps/api/src/db/daily-reports.db.ts`）
   - 各メソッドのテストを追加（`apps/api/src/db/*.spec.ts`）
2. **日報更新APIの実装**（PUT /api/daily-reports/:id）
   - `apps/api/src/routes/daily-reports.routes.ts`にルートを追加
   - よかったこと/改善点の削除処理でフォローアップデータの存在確認を実装
   - `apps/api/src/routes/daily-reports.routes.spec.ts`にテストを追加
3. **エピソード更新APIの実装**（PUT /api/good-points/:id/followups/:followupId）
   - `apps/api/src/routes/followups.routes.ts`にルートを追加
   - ステータス自動再計算を実装
   - `apps/api/src/routes/followups.routes.spec.ts`にテストを追加
4. **アクション更新APIの実装**（PUT /api/improvements/:id/followups/:followupId）
   - `apps/api/src/routes/followups.routes.ts`にルートを追加
   - ステータス自動再計算を実装
   - `apps/api/src/routes/followups.routes.spec.ts`にテストを追加
5. **テストの実装**（TDD）
   - すべてのAPIエンドポイントに対してテストを実装
   - カバレッジ100%を達成

### 10.2 テスト方針

- **TDD**: テストを先に書いてから実装
- **カバレッジ100%**: すべてのコードをテストでカバー
- **既存テストの活用**: 既存のテストパターンを踏襲

### 10.3 既存コードとの整合性

- **既存のAPIパターンを踏襲**: エラーハンドリング、バリデーション、レスポンス形式
- **既存の関数を再利用**: バリデーション関数、ステータス判定関数、カウント関数
- **既存のデータベースメソッドを活用**: `update`メソッドを活用

---

## 11. シーケンス図

### 11.1 日報更新のシーケンス

```
クライアント -> API: PUT /api/daily-reports/:id
API -> DB: findById(reportId)
DB -> API: DailyReport
API -> DB: update(goodPoint) (各よかったこと)
API -> DB: update(improvement) (各改善点)
API -> DB: update(report)
API -> クライアント: DailyReportResponse
```

### 11.2 エピソード更新のシーケンス

```
クライアント -> API: PUT /api/good-points/:id/followups/:followupId
API -> DB: findById(goodPointId)
DB -> API: GoodPoint
API -> DB: findById(followupId)
DB -> API: Followup
API -> DB: update(followup)
API -> DB: findByItemId('goodPoint', goodPointId)
DB -> API: Followup[]
API -> 計算: countEpisodes, calculateGoodPointStatus
API -> DB: update(goodPoint)
API -> クライアント: Followup
```

---

## 12. 関連ドキュメント

| ドキュメント                                      | 説明                               |
| :------------------------------------------------ | :--------------------------------- |
| `docs/features/edit-functionality/prd.md`         | 編集機能のPRD                      |
| `docs/features/daily-report-input/tech_spec.md`   | 日報入力機能の技術設計書           |
| `docs/features/followup-enhancement/tech_spec.md` | フォローアップ動作改善の技術設計書 |

---

## 13. 実装前の確認事項

- [x] PRDの要件を確認し、Tech Specに反映
- [x] 既存のデータモデルを確認し、変更不要であることを確認
- [x] 既存のAPIパターンを確認し、一貫性を保つ設計にした
- [x] 既存の関数（バリデーション、ステータス判定、カウント）を再利用する設計にした
- [x] Helperレビューを実施し、フィードバックを反映
- [ ] FollowupsDatabaseにupdateメソッドを追加
- [ ] GoodPointsDatabaseにdeleteメソッドを追加
- [ ] ImprovementsDatabaseにdeleteメソッドを追加
- [ ] 日報更新APIの実装（同日チェック、ID整合性チェックを含む）
- [ ] エピソード更新APIの実装
- [ ] アクション更新APIの実装
- [ ] テストの実装（カバレッジ100%）
- [ ] エラーハンドリングの実装
- [ ] バリデーションの実装

---

_本Tech Specは Pending ステータスです。Helperレビュー・PdMレビュー完了後に Approved に更新します。_
