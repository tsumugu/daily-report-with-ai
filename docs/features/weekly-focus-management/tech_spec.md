# 週次フォーカス管理機能 技術設計書（Tech Spec）

**バージョン**: Phase 2 v2  
**作成日**: 2025-12-06  
**作成者**: Eng  
**ステータス**: Draft  
**承認日**: -  
**承認者**: -

---

## 1. 概要

週次フォーカス管理機能の技術的な設計・実装方針を定義する。  
既存のフォローアップ管理機能で実装済みのAPIを活用し、フロントエンドで週次フォーカスの追加・表示・削除機能を実装する。

---

## 2. データモデル

### 2.1 既存モデルの利用

#### WeeklyFocus（週次フォーカス）

既存のフォローアップ管理機能で実装済みのモデルを利用する。

| フィールド    | 型                  | 必須 | 説明                               |
| :------------ | :------------------ | :--- | :--------------------------------- |
| id            | string (UUID)       | ○    | 一意識別子                         |
| userId        | string              | ○    | 作成者のユーザーID                 |
| itemType      | enum                | ○    | 'goodPoint' \| 'improvement'       |
| itemId        | string              | ○    | 対象のよかったこと/改善点のID      |
| weekStartDate | string (YYYY-MM-DD) | ○    | 週の開始日（月曜日、ISO 8601準拠） |
| createdAt     | DateTime            | ○    | 作成日時                           |

**制約**:
- 1ユーザーあたり最大5件まで（今週のフォーカス）
- 同じ項目を今週のフォーカスに複数回追加することはできない

---

## 3. API設計

### 3.1 既存APIの利用

既存のフォローアップ管理機能で実装済みのAPIを利用する。

#### GET /api/weekly-focuses

今週のフォーカス一覧を取得する。

**Response**

- 200 OK: 成功

```json
{
  "data": [
    {
      "id": "weekly-focus-id",
      "userId": "user-id",
      "itemType": "goodPoint",
      "itemId": "good-point-id",
      "weekStartDate": "2025-12-01",
      "createdAt": "2025-12-06T10:00:00Z",
      "item": {
        "id": "good-point-id",
        "content": "チーム会議で積極的に発言できた",
        "status": "進行中",
        "success_count": 1
      }
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

## 4. バリデーション

### 週次フォーカス設定

| フィールド | ルール                 |
| :--------- | :--------------------- |
| itemType   | 必須、'goodPoint' \| 'improvement' |
| itemId     | 必須、UUID形式         |
| 件数制限   | 1ユーザーあたり最大5件 |

---

## 5. ビジネスロジック

### 5.1 週の開始日計算

- ISO 8601準拠（月曜日が週の開始）
- 現在日時から今週の月曜日を計算
- **タイムゾーンはサーバー側のタイムゾーン（JST）で統一**
- クライアント側のタイムゾーンに依存せず、サーバー側で判定
- 週の開始日は1日1回のみ計算し、キャッシュする（最適化）

### 5.2 週の切り替え

- **週の切り替えはサーバー側で判定し、クライアント側のタイムゾーンに依存しない**
- 週が変わったら、前週のフォーカスは自動的に非表示（削除はしない）
- `GET /api/weekly-focuses` は常に今週のフォーカスのみ返却
- 前週のフォーカスはデータベースに保持されるが、APIでは取得できない（Phase 3で履歴機能を追加予定）

### 5.3 削除の連動

- 対象のよかったこと/改善点が削除された場合、週次フォーカスも連動して削除
- バックエンドで実装済み（既存のフォローアップ管理機能）

---

## 6. フロントエンド実装

### 6.1 サービス層

#### WeeklyFocusService

既存のサービスを利用する。

```typescript
@Injectable({ providedIn: "root" })
export class WeeklyFocusService {
  // 今週のフォーカス取得
  getCurrentWeekFocuses(): Observable<WeeklyFocusResponse[]>;

  // 週次フォーカス設定
  addWeeklyFocus(data: CreateWeeklyFocusRequest): Observable<WeeklyFocusResponse>;

  // 週次フォーカス削除
  deleteWeeklyFocus(id: string): Observable<void>;
}
```

### 6.2 コンポーネント

#### FollowupCardComponent（拡張）

フォロー項目カードに「フォーカスに追加」ボタンを追加。

**追加機能**:
- 「フォーカスに追加」ボタンの表示
- 既にフォーカスに設定されている場合はボタンを非表示または無効化
- ボタンクリック時に週次フォーカスを追加

**実装方針**:
- `@Input() isInWeeklyFocus: boolean` を追加
- `@Output() addToWeeklyFocus = new EventEmitter<FollowupItem>()` を追加
- 親コンポーネント（FollowupListPageComponent）で週次フォーカス一覧を取得し、各カードに `isInWeeklyFocus` を渡す

#### WeeklyFocusSectionComponent（既存）

既存のコンポーネントを利用する。

**機能**:
- 今週のフォーカス一覧表示
- フォーカス削除機能
- 追加ボタンクリック時のイベント発火（親コンポーネントで処理）

#### FollowupListPageComponent（拡張）

フォロー項目一覧ページに週次フォーカス追加機能を追加。

**追加機能**:
- 週次フォーカス一覧を取得
- 各フォロー項目カードに「既にフォーカスに設定されているか」の情報を渡す
- 「フォーカスに追加」ボタンクリック時の処理
- エラーハンドリング（最大5件制限、重複エラー）

### 6.3 状態管理

#### 週次フォーカス一覧の取得と判定の最適化

- フォロー項目一覧ページ表示時に週次フォーカス一覧を1回取得
- **週次フォーカス一覧をMap構造（`Map<itemType-itemId, boolean>`）に変換し、O(1)で判定可能にする**
- 各フォロー項目が既にフォーカスに設定されているかを判定（O(1)）
- カードに `isInWeeklyFocus` プロパティを渡す
- **フィルタ変更時も週次フォーカス判定は全フォロー項目に対して行う（フィルタ結果に依存しない）**

**実装例**:
```typescript
// 週次フォーカス一覧をMapに変換
const weeklyFocusMap = new Map<string, boolean>();
weeklyFocuses.forEach(focus => {
  const key = `${focus.itemType}-${focus.itemId}`;
  weeklyFocusMap.set(key, true);
});

// 各フォロー項目の判定（O(1)）
const isInWeeklyFocus = weeklyFocusMap.has(`${item.itemType}-${item.item.id}`);
```

#### 週次フォーカス追加

1. 「フォーカスに追加」ボタンクリック
2. `WeeklyFocusService.addWeeklyFocus()` を呼び出し
3. 成功時：トースト通知を表示
4. 週次フォーカス一覧を再取得
5. フォロー項目一覧を更新（各カードの `isInWeeklyFocus` を更新）

#### エラーハンドリング

- 最大5件制限エラー：トースト通知でエラーメッセージを表示
- 重複エラー：トースト通知でエラーメッセージを表示
- ネットワークエラー：リトライボタン付きエラーメッセージ表示

#### 同時追加の競合

- **サーバー側でバリデーションを行うため、複数デバイスから同時に追加しても競合は発生しない**
- 最大5件制限や重複チェックはサーバー側で行われるため、先に成功したリクエストのみが反映される

---

## 7. エラーハンドリング

### 7.1 フロントエンド

| エラー種別           | 対応                                                       |
| :------------------- | :--------------------------------------------------------- |
| ネットワークエラー   | リトライボタン付きエラーメッセージ表示                     |
| 認証切れ             | ログイン画面へリダイレクト                                 |
| サーバーエラー（500） | 「エラーが発生しました。しばらく経ってから再試行してください」表示 |
| 最大5件制限エラー    | 「今週のフォーカスは最大5件まで設定できます」とトースト通知 |
| 重複エラー           | 「この項目は既に今週のフォーカスに設定されています」とトースト通知 |

### 7.2 バックエンド

既存のフォローアップ管理機能で実装済み。

---

## 8. 実装ファイル

### フロントエンド

- `apps/web/src/app/features/followup/components/followup-card/followup-card.component.ts` - 拡張（フォーカスに追加ボタン）
- `apps/web/src/app/features/followup/components/followup-card/followup-card.component.html` - 拡張（フォーカスに追加ボタン）
- `apps/web/src/app/features/followup/pages/followup-list-page/followup-list-page.component.ts` - 拡張（週次フォーカス追加処理）
- `apps/web/src/app/shared/services/weekly-focus.service.ts` - 既存（利用）
- `apps/web/src/app/shared/components/weekly-focus-section/weekly-focus-section.component.ts` - 既存（利用）

### バックエンド

既存のフォローアップ管理機能で実装済みのため、新規実装なし。

---

## 9. テスト方針

### 9.1 ユニットテスト

- `FollowupCardComponent`: 「フォーカスに追加」ボタンの表示/非表示
- `FollowupListPageComponent`: 週次フォーカス追加処理、エラーハンドリング
- `WeeklyFocusService`: API呼び出しのモック

### 9.2 E2Eテスト

- フォロー項目一覧から週次フォーカスを追加できること
- 最大5件制限でエラーが表示されること
- 重複追加でエラーが表示されること
- ホーム画面で週次フォーカスが表示されること
- 週次フォーカスを削除できること
- **週の切り替えテスト：週の開始日をモックし、週が変わった時に前週のフォーカスが非表示になることを確認**
- **同時追加のテスト：並列リクエストで同時追加をテストし、バリデーションが正しく動作することを確認**
- **パフォーマンステスト：フォロー項目100件、週次フォーカス5件の場合のパフォーマンステストを実施**

---

## 10. パフォーマンス

- 週次フォーカス一覧の取得は500ms以内
- フォロー項目一覧表示時に週次フォーカス一覧も取得するため、並列リクエストで最適化
- **週次フォーカス判定はMap構造を使用し、O(1)で判定可能（フォロー項目が100件あってもパフォーマンス低下なし）**
- **サービス層でキャッシュを実装し、短時間内の重複リクエストを防ぐ（検討事項）**

---

## 11. セキュリティ

- 認証が必要（既存のミドルウェアで実装済み）
- **既存の認証ミドルウェアで実装済み。ユーザーは自分の週次フォーカスのみ操作可能**
- **APIレスポンスには認証されたユーザーのデータのみ含まれる**
- 他のユーザーの週次フォーカスが取得されることはない

---

## 12. データ保持・クリーンアップ

- **前週のフォーカスはデータベースに保持し、Phase 3で履歴機能を実装予定。現時点ではクリーンアップ不要**
- 対象のよかったこと/改善点が削除された場合、週次フォーカスも連動して削除（既存のバックエンドで実装済み）

## 13. 将来拡張性

### 13.1 優先順位機能（Phase 3）

- Phase 3で優先順位機能を追加する場合、WeeklyFocusモデルに`priority`フィールドを追加予定
- Phase 2 v2では順序は作成日時順で表示

### 13.2 チーム共有機能（Phase 3以降）

- Phase 3以降でチームで週次フォーカスを共有する機能を検討
- 現時点では個人の週次フォーカスのみ

## 14. 関連ドキュメント

| ドキュメント                              | 説明                         |
| :---------------------------------------- | :--------------------------- |
| `docs/features/weekly-focus-management/prd.md` | 週次フォーカス管理機能のPRD |
| `docs/features/followup-management/tech_spec.md` | フォローアップ管理機能の技術設計（既存API仕様） |
| `docs/features/weekly-focus-management/helper_review.md` | Helperレビュー |

---

_本Tech Specは Draft ステータスです。PdM/Des とのクロスレビュー後に承認予定です。_

