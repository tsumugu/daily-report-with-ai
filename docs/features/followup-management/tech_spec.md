# フォローアップ管理機能 技術設計書（Tech Spec）

**バージョン**: Phase 2 v1  
**作成日**: 2025-12-06  
**作成者**: Eng  
**ステータス**: Approved  
**承認日**: 2025-12-06  
**承認者**: PdM, Eng, Des

---

## 1. 概要

フォローアップ管理機能の技術的な設計・実装方針を定義する。  
日報に記録した「よかったこと」「改善点」を追跡し、再現・達成状況を管理する機能を実装する。

---

## 2. データモデル

### 2.1 既存モデルの拡張

#### GoodPoint（よかったこと）拡張

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

**ステータス拡張**: 既存の `'未対応' | '再現成功' | '未達'` から以下に拡張

- `'未着手'`: まだ再現を試みていない
- `'進行中'`: 再現を試みている最中
- `'再現成功'`: 少なくとも1回再現できた
- `'定着'`: 複数回（3回以上）再現でき、行動が習慣化・パターン化した状態
- `'再現できず'`: 再現を試みたができなかった

**後方互換性**: 既存の `'未対応'` は `'未着手'` にマッピング、`'未達'` は `'再現できず'` にマッピング

#### Improvement（改善点）拡張

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

**ステータス拡張**: 既存の `'未着手' | '進行中' | '完了'` から以下に拡張

- `'未着手'`: まだアクションを開始していない（既存）
- `'進行中'`: アクションを実施中（既存）
- `'完了'`: 期待する成果が得られた（少なくとも1回）（既存）
- `'習慣化'`: 複数回（3回以上）実施され、行動が定着した状態（新規）
- `'未達成'`: 実施を試みたが完了できなかった（新規）

### 2.2 新規モデル

#### Followup（フォローアップ履歴）

| フィールド | 型                  | 必須 | 説明                                                          |
| :--------- | :------------------ | :--- | :------------------------------------------------------------ | ------------- |
| id         | string (UUID)       | ○    | 一意識別子                                                    |
| userId     | string              | ○    | 作成者のユーザーID                                            |
| itemType   | enum                | ○    | 'goodPoint'                                                   | 'improvement' |
| itemId     | string              | ○    | 対象のよかったこと/改善点のID                                 |
| status     | enum                | ○    | フォローアップ時のステータス                                  |
| memo       | string              | -    | 再現メモ/進捗メモ（最大500文字）                              |
| date       | string (YYYY-MM-DD) | -    | 再現日/完了日（ステータスが「再現成功」「完了」の場合は必須） |
| createdAt  | DateTime            | ○    | 作成日時                                                      |
| updatedAt  | DateTime            | ○    | 更新日時                                                      |

**ステータス値**:

- よかったことの場合: `'未着手' | '進行中' | '再現成功' | '再現できず'`
- 改善点の場合: `'未着手' | '進行中' | '完了' | '未達成'`

#### WeeklyFocus（週次フォーカス）

| フィールド    | 型                  | 必須 | 説明                               |
| :------------ | :------------------ | :--- | :--------------------------------- | ------------- |
| id            | string (UUID)       | ○    | 一意識別子                         |
| userId        | string              | ○    | 作成者のユーザーID                 |
| itemType      | enum                | ○    | 'goodPoint'                        | 'improvement' |
| itemId        | string              | ○    | 対象のよかったこと/改善点のID      |
| weekStartDate | string (YYYY-MM-DD) | ○    | 週の開始日（月曜日、ISO 8601準拠） |
| createdAt     | DateTime            | ○    | 作成日時                           |

**制約**:

- 1ユーザーあたり最大5件まで設定可能
- 週が変わったら自動的に前週のフォーカスは非表示（削除はしない）

---

## 3. DBスキーマ設計

### 3.1 followupsテーブル（インメモリDB）

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
  clear(): void;
}
```

### 3.2 weekly_focusesテーブル（インメモリDB）

```typescript
class WeeklyFocusesDatabase {
  private weeklyFocuses: Map<string, WeeklyFocus> = new Map();

  save(weeklyFocus: WeeklyFocus): void;
  findById(id: string): WeeklyFocus | undefined;
  findByUserIdAndWeek(userId: string, weekStartDate: string): WeeklyFocus[];
  findByUserId(userId: string): WeeklyFocus[];
  delete(id: string): void;
  clear(): void;
}
```

---

## 4. API設計

### 4.1 フォローアップ関連

#### POST /api/good-points/:id/followups

よかったことにフォローアップを追加する。

**Request Body**

```json
{
  "status": "再現成功",
  "memo": "どのように再現したか...",
  "date": "2025-12-10"
}
```

**Response**

- 201 Created: フォローアップ作成成功
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

- ステータスが「再現成功」の場合、`date` は必須
- フォローアップ追加後、対象の `GoodPoint` の `success_count` をインクリメント
- `success_count >= 3` の場合、`GoodPoint` の `status` を「定着」に自動更新

#### POST /api/improvements/:id/followups

改善点にフォローアップを追加する。

**Request Body**

```json
{
  "status": "完了",
  "memo": "実施内容...",
  "date": "2025-12-10"
}
```

**Response**

- 201 Created: フォローアップ作成成功
- 400 Bad Request: バリデーションエラー
- 401 Unauthorized: 未認証
- 404 Not Found: 改善点が見つからない
- 403 Forbidden: アクセス権限なし

**ビジネスロジック**:

- ステータスが「完了」の場合、`date` は必須
- フォローアップ追加後、対象の `Improvement` の `success_count` をインクリメント
- `success_count >= 3` の場合、`Improvement` の `status` を「習慣化」に自動更新

#### GET /api/good-points/:id/followups

よかったことのフォローアップ履歴を取得する。

**Response**

- 200 OK
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "status": "再現成功",
        "memo": "...",
        "date": "2025-12-10",
        "createdAt": "2025-12-10T12:00:00Z"
      }
    ]
  }
  ```
- 401 Unauthorized: 未認証
- 404 Not Found: よかったことが見つからない
- 403 Forbidden: アクセス権限なし

#### GET /api/improvements/:id/followups

改善点のフォローアップ履歴を取得する。

**Response**

- 200 OK: フォローアップ履歴の配列
- 401 Unauthorized: 未認証
- 404 Not Found: 改善点が見つからない
- 403 Forbidden: アクセス権限なし

### 4.2 フォロー項目一覧

#### GET /api/followups

フォロー項目一覧を取得する（フィルタ・ページング対応）。

**Query Parameters**

- `status` (optional): ステータスでフィルタ（すべて/未着手/進行中/完了/未達成/定着/習慣化）
- `itemType` (optional): 種別でフィルタ（すべて/goodPoint/improvement）
- `limit` (optional): 取得件数（デフォルト: 20）
- `offset` (optional): オフセット（デフォルト: 0）

**Response**

- 200 OK
  ```json
  {
    "data": [
      {
        "itemType": "goodPoint",
        "item": {
          "id": "uuid",
          "content": "...",
          "status": "進行中",
          "success_count": 1,
          "createdAt": "2025-12-05T12:00:00Z"
        },
        "reportDate": "2025-12-05",
        "reportId": "report-uuid"
      }
    ],
    "total": 50
  }
  ```
- 401 Unauthorized: 未認証

**デフォルト表示**: 未完了（未着手/進行中）のみ表示

- フロントエンドで `status` パラメータに `未着手,進行中` をデフォルトで設定
- ユーザーがフィルタを変更した場合は、選択したフィルタを適用

**ソート**: 日報日付の降順（新しい順）

### 4.3 週次フォーカス

#### GET /api/weekly-focuses

今週のフォーカスを取得する。

**Response**

- 200 OK
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "itemType": "goodPoint",
        "itemId": "good-point-id",
        "item": {
          "id": "good-point-id",
          "content": "...",
          "status": "進行中",
          "success_count": 0
        },
        "weekStartDate": "2025-12-09",
        "createdAt": "2025-12-09T12:00:00Z"
      }
    ]
  }
  ```
- 401 Unauthorized: 未認証

**ビジネスロジック**:

- 週の開始日（月曜日）を計算し、該当する週のフォーカスのみ返却
- 週が変わったら自動的に前週のフォーカスは非表示

#### POST /api/weekly-focuses

週次フォーカスを設定する。

**Request Body**

```json
{
  "itemType": "goodPoint",
  "itemId": "good-point-id"
}
```

**Response**

- 201 Created: 週次フォーカス作成成功
- 400 Bad Request: バリデーションエラー（最大5件制限等）
- 401 Unauthorized: 未認証
- 404 Not Found: 対象のよかったこと/改善点が見つからない
- 403 Forbidden: アクセス権限なし

**ビジネスロジック**:

- 1ユーザーあたり最大5件まで設定可能
- 週の開始日（月曜日）を自動計算
- 既に同じ項目が今週のフォーカスに設定されている場合はエラー
  - 400 Bad Request: `{ message: "この項目は既に今週のフォーカスに設定されています" }`

#### DELETE /api/weekly-focuses/:id

週次フォーカスを削除する。

**Response**

- 200 OK: 削除成功
- 401 Unauthorized: 未認証
- 404 Not Found: 週次フォーカスが見つからない
- 403 Forbidden: アクセス権限なし

---

## 5. バリデーション

### フォローアップ追加

| フィールド | ルール                                                       |
| :--------- | :----------------------------------------------------------- |
| status     | 必須、enum値のみ許可                                         |
| memo       | 任意、最大500文字                                            |
| date       | ステータスが「再現成功」「完了」の場合は必須、YYYY-MM-DD形式 |

### 週次フォーカス設定

| フィールド | ルール                 |
| :--------- | :--------------------- | ------------- |
| itemType   | 必須、'goodPoint'      | 'improvement' |
| itemId     | 必須、UUID形式         |
| 件数制限   | 1ユーザーあたり最大5件 |

---

## 6. ビジネスロジック

### 6.1 成功カウント更新

**よかったこと**:

- フォローアップ追加時、ステータスが「再現成功」なら `success_count` をインクリメント
- `success_count >= 3` で自動的に `status` を「定着」に更新

**改善点**:

- フォローアップ追加時、ステータスが「完了」なら `success_count` をインクリメント
- `success_count >= 3` で自動的に `status` を「習慣化」に更新

**注意**: ステータスを「再現できず」「未達成」に変更しても `success_count` は減算しない（履歴として保持）

### 6.2 週次フォーカス

**週の開始日計算**:

- ISO 8601準拠（月曜日が週の開始）
- 現在日時から今週の月曜日を計算
- タイムゾーンはサーバーのタイムゾーンを使用（JST想定）

**週の切り替え**:

- 週が変わったら、前週のフォーカスは自動的に非表示（削除はしない）
- `GET /api/weekly-focuses` は常に今週のフォーカスのみ返却

### 6.3 データ整合性

**削除時の連動**:

- 日報削除時、紐付くよかったこと/改善点/フォローアップも連動削除
- よかったこと/改善点削除時、紐付くフォローアップも連動削除
- 週次フォーカスは削除対象の項目が存在しない場合、自動的に削除

---

## 7. フロントエンド状態管理

### 7.1 サービス

#### FollowupService

```typescript
@Injectable({ providedIn: "root" })
export class FollowupService {
  // フォロー項目一覧取得
  getFollowupItems(params: {
    status?: string;
    itemType?: "goodPoint" | "improvement";
    limit?: number;
    offset?: number;
  }): Observable<FollowupItemsResponse>;

  // よかったことのフォローアップ履歴取得
  getGoodPointFollowups(goodPointId: string): Observable<Followup[]>;

  // 改善点のフォローアップ履歴取得
  getImprovementFollowups(improvementId: string): Observable<Followup[]>;

  // よかったことにフォローアップ追加
  addGoodPointFollowup(
    goodPointId: string,
    data: CreateFollowupRequest,
  ): Observable<Followup>;

  // 改善点にフォローアップ追加
  addImprovementFollowup(
    improvementId: string,
    data: CreateFollowupRequest,
  ): Observable<Followup>;
}
```

#### WeeklyFocusService

```typescript
@Injectable({ providedIn: "root" })
export class WeeklyFocusService {
  // 今週のフォーカス取得
  getCurrentWeekFocuses(): Observable<WeeklyFocus[]>;

  // 週次フォーカス設定
  addWeeklyFocus(data: CreateWeeklyFocusRequest): Observable<WeeklyFocus>;

  // 週次フォーカス削除
  deleteWeeklyFocus(id: string): Observable<void>;
}
```

### 7.2 コンポーネント

#### FollowupListPage

フォロー項目一覧画面

- フィルタ（ステータス、種別）
- ページング（「もっと見る」ボタン）
- カード表示（よかったこと/改善点の情報、成功回数、定着バッジ）
- フォローアップ入力モーダルへの遷移

#### FollowupInputModal

フォローアップ入力モーダル

- ステータス選択
- メモ入力（TextareaField）
- 日付入力（DateField、条件付き必須）
- バリデーション
- 保存処理

#### WeeklyFocusSection

週次フォーカス表示（ホーム/Dashboard）

- 今週のフォーカス一覧表示
- フォーカス追加UI
- フォーカス削除機能

---

## 8. 実装ファイル

### バックエンド

- `apps/api/src/db/followups.db.ts` - フォローアップDB
- `apps/api/src/db/weekly-focuses.db.ts` - 週次フォーカスDB
- `apps/api/src/routes/followups.routes.ts` - フォローアップAPI
- `apps/api/src/routes/weekly-focuses.routes.ts` - 週次フォーカスAPI
- `apps/api/src/models/daily-report.model.ts` - モデル拡張（GoodPoint, Improvement, Followup, WeeklyFocus）

### フロントエンド

- `apps/web/src/app/features/followup/` - 新規機能ディレクトリ
  - `pages/followup-list-page/` - フォロー項目一覧画面
  - `components/followup-input-modal/` - フォローアップ入力モーダル
- `apps/web/src/app/shared/services/followup.service.ts` - フォローアップサービス
- `apps/web/src/app/shared/services/weekly-focus.service.ts` - 週次フォーカスサービス
- `apps/web/src/app/shared/models/` - モデル定義（Followup, WeeklyFocus）

---

## 9. 技術スタック

- フロントエンド: Angular（Standalone Components）
- バックエンド: Node.js + Express
- DB: インメモリDB（Mapベース、既存パターン踏襲）

---

## 10. 補足

- 認証済みユーザーのみフォローアップ作成可能
- フォローアップ履歴は削除不可（履歴として保持）
- 既存の `GoodPointStatus` と `ImprovementStatus` は拡張が必要（後方互換性を考慮）
- 週次フォーカスの週開始日計算はタイムゾーン考慮が必要（JST想定）

---

※ UI設計は `ui_design.md` に記載
