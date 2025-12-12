# フォローアップ動作改善 技術設計書（Tech Spec）

**バージョン**: Phase 2 v2  
**作成日**: 2025-12-10  
**作成者**: Eng  
**ステータス**: Approved  
**承認日**: 2025-12-10  
**承認者**: PdM

---

## 1. 概要

フォローアップ動作改善機能の技術的な設計・実装方針を定義する。  
エピソード/アクションの複数登録機能、ステータス自動判定機能、週次フォーカスカードへのフォローアップボタン追加を実装する。

---

## 2. データモデル

### 2.1 既存モデルの活用

#### Followup（フォローアップ）モデル

既存の `Followup` モデルを活用し、エピソード/アクションとして使用する。

| フィールド | 型                  | 必須 | 説明                                                       |
| :--------- | :------------------ | :--- | :--------------------------------------------------------- |
| id         | string (UUID)       | ○    | 一意識別子                                                 |
| userId     | string              | ○    | 作成者のユーザーID                                         |
| itemType   | enum                | ○    | 'goodPoint' \| 'improvement'                               |
| itemId     | string              | ○    | 対象のよかったこと/改善点のID                              |
| status     | enum                | ○    | エピソード: '再現成功'（固定）、アクション: '完了'（固定） |
| memo       | string              | -    | 再現メモ/進捗メモ（最大500文字）                           |
| date       | string (YYYY-MM-DD) | ○    | 再現日/完了日（必須）                                      |
| createdAt  | DateTime            | ○    | 作成日時                                                   |
| updatedAt  | DateTime            | ○    | 更新日時                                                   |

**エピソード/アクションの扱い**:

- **よかったこと（エピソード）**:
  - `status`: 常に `'再現成功'`
  - `date`: 再現日（必須）
  - `memo`: 再現メモ（任意、最大500文字）

- **改善点（アクション）**:
  - `status`: 常に `'完了'`
  - `date`: 完了日（必須）
  - `memo`: 進捗メモ（任意、最大500文字）

#### GoodPoint（よかったこと）拡張

既存の `GoodPoint` モデルは変更なし。ステータスはエピソード数に基づいて自動更新される。

| フィールド    | 型            | 必須 | 説明                                           |
| :------------ | :------------ | :--- | :--------------------------------------------- |
| id            | string (UUID) | ○    | 一意識別子                                     |
| userId        | string        | ○    | 作成者のユーザーID                             |
| content       | string        | ○    | 内容                                           |
| factors       | string        | -    | 要因・背景                                     |
| tags          | string[]      | -    | タグ（カテゴリ等）                             |
| status        | enum          | ○    | 未着手 / 進行中 / 再現成功 / 定着 / 再現できず |
| success_count | number        | ○    | 成功回数（デフォルト: 0）                      |
| createdAt     | DateTime      | ○    | 作成日時                                       |
| updatedAt     | DateTime      | ○    | 更新日時                                       |

**ステータス自動判定ルール**:

- エピソード数 = 0 → `'未着手'`
- エピソード数 >= 1 かつ < 閾値（3回） → `'進行中'`
- エピソード数 >= 閾値（3回） → `'再現成功'`

**注意**: `success_count` はエピソード数と連動する（エピソード数 = `success_count`）。

#### Improvement（改善点）拡張

既存の `Improvement` モデルは変更なし。ステータスはアクション数に基づいて自動更新される。

| フィールド    | 型            | 必須 | 説明                                     |
| :------------ | :------------ | :--- | :--------------------------------------- |
| id            | string (UUID) | ○    | 一意識別子                               |
| userId        | string        | ○    | 作成者のユーザーID                       |
| content       | string        | ○    | 改善したい内容                           |
| action        | string        | -    | 具体的アクション                         |
| status        | enum          | ○    | 未着手 / 進行中 / 完了 / 習慣化 / 未達成 |
| success_count | number        | ○    | 成功回数（デフォルト: 0）                |
| createdAt     | DateTime      | ○    | 作成日時                                 |
| updatedAt     | DateTime      | ○    | 更新日時                                 |

**ステータス自動判定ルール**:

- アクション数 = 0 → `'未着手'`
- アクション数 >= 1 かつ < 閾値（3回） → `'進行中'`
- アクション数 >= 閾値（3回） → `'完了'`

**注意**: `success_count` はアクション数と連動する（アクション数 = `success_count`）。

---

## 3. DBスキーマ設計

### 3.1 既存DBの活用

既存の `FollowupsDatabase` を活用する。スキーマ変更は不要。

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
  delete(id: string): void; // 新規追加
  clear(): void;
}
```

**新規メソッド追加**:

- `delete(id: string): void` - エピソード/アクション削除用

---

## 4. API設計

### 4.1 エピソード/アクション追加

#### POST /api/good-points/:id/followups

よかったことにエピソードを追加する。

**Request Body**

```json
{
  "date": "2025-12-10",
  "memo": "再現メモ（任意、最大500文字）"
}
```

**変更点**: `status` フィールドは任意（後方互換性のため）。指定されない場合は自動的に「再現成功」を設定

**後方互換性**: 既存のクライアントコードとの互換性を保つため、`status` フィールドを任意とする。指定されない場合は自動的に「再現成功」を設定する。

**Response**

- 201 Created: エピソード作成成功
  ```json
  {
    "id": "uuid",
    "userId": "user-id",
    "itemType": "goodPoint",
    "itemId": "good-point-id",
    "status": "再現成功",
    "memo": "...",
    "date": "2025-12-10",
    "createdAt": "2025-12-10T12:00:00Z",
    "updatedAt": "2025-12-10T12:00:00Z"
  }
  ```
- 400 Bad Request: バリデーションエラー
- 401 Unauthorized: 未認証
- 404 Not Found: よかったことが見つからない
- 403 Forbidden: アクセス権限なし

**ビジネスロジック**:

1. `status` フィールドが指定されていない場合、自動的に `'再現成功'` を設定
2. エピソードを `Followup` として保存（`status` は `'再現成功'` に設定）
3. エピソード数をカウント（`itemType === 'goodPoint'` かつ `status === '再現成功'` の件数）
   - **注意**: 既存データで `status` が「進行中」等の場合は、エピソード数にカウントされない（既存の手動ステータス管理として扱う）
4. エピソード数に基づいて `GoodPoint` の `status` を自動更新:
   - エピソード数 = 0 → `'未着手'`
   - エピソード数 >= 1 かつ < 3 → `'進行中'`
   - エピソード数 >= 3 → `'再現成功'`
5. `GoodPoint` の `success_count` をエピソード数に更新

#### POST /api/improvements/:id/followups

改善点にアクションを追加する。

**Request Body**

```json
{
  "date": "2025-12-10",
  "memo": "進捗メモ（任意、最大500文字）"
}
```

**変更点**: `status` フィールドは任意（後方互換性のため）。指定されない場合は自動的に「完了」を設定

**後方互換性**: 既存のクライアントコードとの互換性を保つため、`status` フィールドを任意とする。指定されない場合は自動的に「完了」を設定する。

**Response**

- 201 Created: アクション作成成功
- 400 Bad Request: バリデーションエラー
- 401 Unauthorized: 未認証
- 404 Not Found: 改善点が見つからない
- 403 Forbidden: アクセス権限なし

**ビジネスロジック**:

1. `status` フィールドが指定されていない場合、自動的に `'完了'` を設定
2. アクションを `Followup` として保存（`status` は `'完了'` に設定）
3. アクション数をカウント（`itemType === 'improvement'` かつ `status === '完了'` の件数）
   - **注意**: 既存データで `status` が「進行中」等の場合は、アクション数にカウントされない（既存の手動ステータス管理として扱う）
4. アクション数に基づいて `Improvement` の `status` を自動更新:
   - アクション数 = 0 → `'未着手'`
   - アクション数 >= 1 かつ < 3 → `'進行中'`
   - アクション数 >= 3 → `'完了'`
5. `Improvement` の `success_count` をアクション数に更新

### 4.2 エピソード/アクション削除

#### DELETE /api/good-points/:id/followups/:followupId

よかったことのエピソードを削除する。

**Response**

- 200 OK: 削除成功
- 401 Unauthorized: 未認証
- 404 Not Found: エピソードが見つからない
- 403 Forbidden: アクセス権限なし

**ビジネスロジック**:

1. エピソードが存在するか確認（存在しない場合は404エラー）
2. エピソードの所有者がリクエストユーザーと一致するか確認（不一致の場合は403エラー）
3. エピソードを削除
4. エピソード数を再カウント
5. エピソード数に基づいて `GoodPoint` の `status` を自動更新
6. `GoodPoint` の `success_count` をエピソード数に更新

#### DELETE /api/improvements/:id/followups/:followupId

改善点のアクションを削除する。

**Response**

- 200 OK: 削除成功
- 401 Unauthorized: 未認証
- 404 Not Found: アクションが見つからない
- 403 Forbidden: アクセス権限なし

**ビジネスロジック**:

1. アクションが存在するか確認（存在しない場合は404エラー）
2. アクションの所有者がリクエストユーザーと一致するか確認（不一致の場合は403エラー）
3. アクションを削除
4. アクション数を再カウント
5. アクション数に基づいて `Improvement` の `status` を自動更新
6. `Improvement` の `success_count` をアクション数に更新

### 4.3 エピソード/アクション一覧取得

#### GET /api/good-points/:id/followups

よかったことのエピソード一覧を取得する。

**Response**

- 200 OK
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "date": "2025-12-10",
        "memo": "再現メモ...",
        "createdAt": "2025-12-10T12:00:00Z"
      }
    ],
    "count": 2,
    "status": "進行中"
  }
  ```

**追加フィールド**:

- `count`: エピソード数（UIで「進行中 2/3件」形式で表示するために必要）
- `status`: 現在のステータス（UIでステータスバッジを表示するために必要）
- 401 Unauthorized: 未認証
- 404 Not Found: よかったことが見つからない
- 403 Forbidden: アクセス権限なし

**変更点**: レスポンスから `status` フィールドを除外（常に「再現成功」のため不要）

#### GET /api/improvements/:id/followups

改善点のアクション一覧を取得する。

**Response**

- 200 OK
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "date": "2025-12-10",
        "memo": "進捗メモ...",
        "createdAt": "2025-12-10T12:00:00Z"
      }
    ],
    "count": 2,
    "status": "進行中"
  }
  ```

**追加フィールド**:

- `count`: アクション数（UIで「進行中 2/3件」形式で表示するために必要）
- `status`: 現在のステータス（UIでステータスバッジを表示するために必要）
- 401 Unauthorized: 未認証
- 404 Not Found: 改善点が見つからない
- 403 Forbidden: アクセス権限なし

**変更点**: レスポンスから `status` フィールドを除外（常に「完了」のため不要）

---

## 5. バリデーション

### 5.1 エピソード/アクション追加

| フィールド | ルール                                                                               |
| :--------- | :----------------------------------------------------------------------------------- |
| date       | 必須、YYYY-MM-DD形式、有効な日付（未来日付は許可しない）                             |
| memo       | 任意、最大500文字                                                                    |
| status     | 任意（後方互換性のため）、指定されない場合は自動的に「再現成功」または「完了」を設定 |

### 5.2 エピソード/アクション削除

| フィールド   | ルール                   |
| :----------- | :----------------------- |
| followupId   | 必須、UUID形式           |
| 権限チェック | ユーザーIDが一致すること |

---

## 6. ビジネスロジック

### 6.1 ステータス自動判定

#### よかったこと（エピソード）

```typescript
function calculateGoodPointStatus(episodeCount: number): GoodPointStatus {
  const THRESHOLD = 3;

  if (episodeCount === 0) {
    return "未着手";
  } else if (episodeCount >= THRESHOLD) {
    return "再現成功";
  } else {
    return "進行中";
  }
}
```

#### 改善点（アクション）

```typescript
function calculateImprovementStatus(actionCount: number): ImprovementStatus {
  const THRESHOLD = 3;

  if (actionCount === 0) {
    return "未着手";
  } else if (actionCount >= THRESHOLD) {
    return "完了";
  } else {
    return "進行中";
  }
}
```

### 6.2 エピソード/アクション数のカウント

#### よかったこと（エピソード）

```typescript
function countEpisodes(itemId: string): number {
  const followups = followupsDb.findByItemId("goodPoint", itemId);
  return followups.filter((f) => f.status === "再現成功").length;
}
```

#### 改善点（アクション）

```typescript
function countActions(itemId: string): number {
  const followups = followupsDb.findByItemId("improvement", itemId);
  return followups.filter((f) => f.status === "完了").length;
}
```

### 6.3 ステータス更新のタイミング

- **エピソード/アクション追加時**: 追加後にステータスを再計算
- **エピソード/アクション削除時**: 削除後にステータスを再計算
- **既存データの読み込み時**: 初回読み込み時にステータスを再計算（必要に応じて）

**注意**: 既存データで `status` が「再現成功」または「完了」以外の場合（例: 「進行中」）は、エピソード/アクション数にカウントされない。これは既存の手動ステータス管理として扱い、新方式の自動判定とは別に管理する。

---

## 7. フロントエンド状態管理

### 7.1 サービス

#### FollowupService（拡張）

```typescript
@Injectable({ providedIn: "root" })
export class FollowupService {
  // 既存メソッド...

  // よかったことにエピソード追加（status不要）
  addEpisode(
    goodPointId: string,
    data: { date: string; memo?: string },
  ): Observable<Followup>;

  // 改善点にアクション追加（status不要）
  addAction(
    improvementId: string,
    data: { date: string; memo?: string },
  ): Observable<Followup>;

  // エピソード削除
  deleteEpisode(goodPointId: string, followupId: string): Observable<void>;

  // アクション削除
  deleteAction(improvementId: string, followupId: string): Observable<void>;
}
```

### 7.2 コンポーネント

#### FollowupPage（新規）

フォローアップ入力画面（ページ遷移）

- エピソード/アクション一覧表示
- エピソード/アクション追加フォームモーダル
- エピソード/アクション削除機能
- ステータス表示（登録数とステータス）

#### WeeklyFocusCardComponent（拡張）

週次フォーカスカードにフォローアップボタンを追加

- フォローアップボタンの追加
- クリック時はフォローアップ入力画面に遷移
- フォローアップ入力後、ステータス表示を自動更新

---

## 8. シーケンス図

### 8.1 エピソード追加フロー

```
ユーザー
  ↓ 「エピソードを追加」ボタンクリック
フロントエンド
  ↓ POST /api/good-points/:id/followups
バックエンド
  ↓ エピソード保存
  ↓ エピソード数カウント
  ↓ ステータス自動判定
  ↓ GoodPoint更新
  ↓ レスポンス返却
フロントエンド
  ↓ エピソード一覧更新
  ↓ ステータス表示更新
  ↓ トースト通知（ステータス変更時）
ユーザー
```

### 8.2 エピソード削除フロー

```
ユーザー
  ↓ 「削除」ボタンクリック
フロントエンド
  ↓ DELETE /api/good-points/:id/followups/:followupId
バックエンド
  ↓ エピソード削除
  ↓ エピソード数再カウント
  ↓ ステータス自動判定
  ↓ GoodPoint更新
  ↓ レスポンス返却
フロントエンド
  ↓ エピソード一覧更新
  ↓ ステータス表示更新
ユーザー
```

### 8.3 週次フォーカスカードからのフォローアップ入力

```
ユーザー
  ↓ 週次フォーカスカードの「フォローアップ」ボタンクリック
フロントエンド
  ↓ フォローアップ入力画面にページ遷移（itemType, itemIdをパラメータとして渡す）
  ↓ エピソード/アクション追加
  ↓ POST /api/good-points/:id/followups または POST /api/improvements/:id/followups
バックエンド
  ↓ エピソード/アクション保存
  ↓ ステータス自動更新
  ↓ レスポンス返却
フロントエンド
  ↓ フォローアップ入力画面の一覧更新
  ↓ 週次フォーカスカードのステータス表示更新（ホーム画面に戻った時）
ユーザー
```

**注意**: UI設計では「フォローアップ入力モーダル」と記載されているが、実装では「フォローアップ入力画面（ページ遷移）」として実装する。UI設計との整合性については、Desと協議して決定する。

---

## 9. エラーハンドリング

| エラーケース                        | HTTPステータス | レスポンス                                                                                |
| :---------------------------------- | :------------- | :---------------------------------------------------------------------------------------- |
| 日付未入力                          | 400            | `{ message: "date は必須です" }`                                                          |
| 日付形式不正                        | 400            | `{ message: "date はYYYY-MM-DD形式で入力してください" }`                                  |
| 未来日付                            | 400            | `{ message: "未来の日付は入力できません" }`                                               |
| メモ500文字超過                     | 400            | `{ message: "memo は500文字以内..." }`                                                    |
| エピソード/アクションが見つからない | 404            | `{ message: "エピソードが見つかりません" }` / `{ message: "アクションが見つかりません" }` |
| アクセス権限なし                    | 403            | `{ message: "アクセス権限がありません" }`                                                 |
| 未認証                              | 401            | `{ message: "認証が必要です" }`                                                           |

---

## 10. セキュリティ考慮事項

### 10.1 認証・認可

- 既存の `authMiddleware` を活用
- エピソード/アクション追加/削除時は、ユーザーIDを確認
- 他のユーザーのエピソード/アクションにアクセスできないようにする

### 10.2 バリデーション

- 日付形式の検証（YYYY-MM-DD）
- 日付の妥当性チェック（未来日付は許可しない）
- メモの文字数制限（最大500文字）
- 必須フィールドの検証
- `status` フィールドの後方互換性（指定されない場合は自動設定）

---

## 11. パフォーマンス考慮事項

### 11.1 エピソード/アクション数の増加

- 現時点ではインメモリDBを使用しているため、パフォーマンス問題は発生しにくい
- エピソード/アクション数が増えても、カウント処理は高速

### 11.2 ステータス再計算の最適化

- エピソード/アクション追加/削除時のみステータスを再計算
- バッチ処理での再計算は不要（リアルタイムで更新）

---

## 12. 既存実装との互換性

### 12.1 データ互換性

- 既存のフォローアップデータはそのまま維持
- 新規登録から新方式（エピソード/アクション複数登録）を適用
- 既存データと新方式のデータが混在しても問題なく動作する

### 12.2 API互換性

- 既存のフォローアップ追加APIは維持（`status` フィールドは任意）
- 新規API（エピソード/アクション削除）を追加
- 既存のクライアントコードへの影響を最小限に抑える

---

## 13. 実装ファイル

### バックエンド

- `apps/api/src/db/followups.db.ts` - フォローアップDB（`delete` メソッド追加）
- `apps/api/src/routes/followups.routes.ts` - フォローアップAPI（削除API追加、ステータス自動判定ロジック追加）
- `apps/api/src/models/daily-report.model.ts` - モデル定義（変更なし）

### フロントエンド

- `apps/web/src/app/features/followup/pages/followup-page/` - フォローアップ入力画面（新規）
- `apps/web/src/app/shared/services/followup.service.ts` - フォローアップサービス（拡張）
- `apps/web/src/app/shared/components/weekly-focus-card/` - 週次フォーカスカード（フォローアップボタン追加）

---

## 14. 技術スタック

- フロントエンド: Angular（Standalone Components）
- バックエンド: Node.js + Express
- DB: インメモリDB（Mapベース、既存パターン踏襲）

---

## 15. 補足

- 認証済みユーザーのみエピソード/アクション作成可能
- エピソード/アクション削除は即座に実行（確認なし）
- ステータス自動判定の閾値は3回（固定、Phase 3以降で設定可能にする予定）
- 週次フォーカスカードからのフォローアップ入力は、フォロー項目一覧画面と同じフォローアップ入力画面を使用
- 既存APIとの後方互換性を保つため、`status` フィールドを任意とする（指定されない場合は自動設定）
- 日付の妥当性チェック: 未来日付は許可しない
- 既存データで `status` が「再現成功」または「完了」以外の場合は、エピソード/アクション数にカウントされない

---

## 関連ドキュメント

- PRD: `docs/features/followup-enhancement/prd.md`
- UI Design: `docs/features/followup-enhancement/ui_design.md`
- Tech Research: `docs/features/followup-enhancement/tech_research.md`
- 既存実装: `docs/features/followup-management/tech_spec.md`

---

_本技術設計書は Pending ステータスです。Helperレビュー・PdMレビュー後に承認予定です。_
