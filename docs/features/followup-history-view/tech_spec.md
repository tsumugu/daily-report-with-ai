# フォローアップ履歴確認機能 技術設計書（Tech Spec）

**バージョン**: Phase 2 v2  
**作成日**: 2025-12-06  
**作成者**: Eng  
**ステータス**: Draft  
**承認日**: -  
**承認者**: -

---

## 1. 概要

フォローアップ履歴確認機能の技術的な設計・実装方針を定義する。  
既存のフォローアップ管理機能で実装済みのAPIを活用し、フロントエンドでフォローアップ履歴の表示機能を実装する。

---

## 2. データモデル

### 2.1 既存モデルの利用

#### Followup（フォローアップ履歴）

既存のフォローアップ管理機能で実装済みのモデルを利用する。

| フィールド | 型                  | 必須 | 説明                                                          |
| :--------- | :------------------ | :--- | :------------------------------------------------------------ |
| id         | string (UUID)       | ○    | 一意識別子                                                    |
| userId     | string              | ○    | 作成者のユーザーID                                            |
| itemType   | enum                | ○    | 'goodPoint' \| 'improvement'                                  |
| itemId     | string              | ○    | 対象のよかったこと/改善点のID                                 |
| status     | enum                | ○    | フォローアップ時のステータス                                  |
| memo       | string              | -    | 再現メモ/進捗メモ（最大500文字）                              |
| date       | string (YYYY-MM-DD) | -    | 再現日/完了日（ステータスが「再現成功」「完了」の場合は必須） |
| createdAt  | DateTime            | ○    | 作成日時                                                      |
| updatedAt  | DateTime            | ○    | 更新日時                                                      |

**ステータス値**:
- よかったことの場合: `'未着手' | '進行中' | '再現成功' | '再現できず'`
- 改善点の場合: `'未着手' | '進行中' | '完了' | '未達成'`

---

## 3. API設計

### 3.1 既存APIの利用

既存のフォローアップ管理機能で実装済みのAPIを利用する。

#### GET /api/good-points/:id/followups

よかったことのフォローアップ履歴を取得する。

**Response**

- 200 OK: 成功

```json
{
  "data": [
    {
      "id": "followup-id",
      "status": "再現成功",
      "memo": "チーム会議で積極的に発言できた",
      "date": "2025-12-05",
      "createdAt": "2025-12-05T10:00:00Z"
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

- 200 OK: 成功

```json
{
  "data": [
    {
      "id": "followup-id",
      "status": "完了",
      "memo": "朝の準備を前日の夜に済ませた",
      "date": "2025-12-05",
      "createdAt": "2025-12-05T10:00:00Z"
    }
  ]
}
```

- 401 Unauthorized: 未認証
- 404 Not Found: 改善点が見つからない
- 403 Forbidden: アクセス権限なし

**ビジネスロジック**:
- 作成日時の降順（新しい順）でソート
- すべての履歴を返却（ページングなし）

---

## 4. フロントエンド実装

### 4.1 サービス層

#### FollowupService

既存のサービスを利用する。

```typescript
@Injectable({ providedIn: "root" })
export class FollowupService {
  // よかったことのフォローアップ履歴を取得
  getGoodPointFollowups(goodPointId: string): Observable<Followup[]>;

  // 改善点のフォローアップ履歴を取得
  getImprovementFollowups(improvementId: string): Observable<Followup[]>;
}
```

### 4.2 コンポーネント

#### FollowupInputModalComponent（拡張）

フォローアップ入力モーダルに履歴セクションを追加。

**追加機能**:
- モーダル表示時にフォローアップ履歴を取得
- 履歴セクションを表示（フォームの下に配置）
- 履歴項目の表示（ステータス、メモ、日付、作成日時）

**実装方針**:
- `@Input() item!: FollowupItem` を利用して `itemId` と `itemType` を取得
- `ngOnInit()` で履歴を取得
- 履歴が0件の場合は空状態メッセージを表示

#### 履歴項目コンポーネント（新規）

履歴項目を表示するコンポーネントを作成。

**機能**:
- ステータスバッジの表示
- メモの表示（最大500文字、長い場合は省略表示）
- 日付の表示（再現日/完了日）
- 作成日時の表示

### 4.3 状態管理

#### フォローアップ履歴の取得

1. モーダル表示時に `itemType` と `itemId` を取得
2. `itemType` に応じて `getGoodPointFollowups()` または `getImprovementFollowups()` を呼び出し
3. 履歴を取得してコンポーネントの状態に保存
4. 履歴セクションに表示

#### 履歴の更新

- フォローアップ保存後、履歴を再取得して更新

---

## 5. エラーハンドリング

### 5.1 フロントエンド

| エラー種別           | 対応                                                       |
| :------------------- | :--------------------------------------------------------- |
| ネットワークエラー   | リトライボタン付きエラーメッセージ表示                     |
| 認証切れ             | ログイン画面へリダイレクト                                 |
| サーバーエラー（500） | 「エラーが発生しました。しばらく経ってから再試行してください」表示 |

### 5.2 バックエンド

既存のフォローアップ管理機能で実装済み。

---

## 6. 実装ファイル

### フロントエンド

- `apps/web/src/app/features/followup/components/followup-input-modal/followup-input-modal.component.ts` - 拡張（履歴取得・表示）
- `apps/web/src/app/features/followup/components/followup-input-modal/followup-input-modal.component.html` - 拡張（履歴セクション）
- `apps/web/src/app/features/followup/components/followup-input-modal/followup-input-modal.component.scss` - 拡張（履歴セクションのスタイル）
- `apps/web/src/app/features/followup/components/followup-history-item/followup-history-item.component.ts` - 新規（履歴項目コンポーネント）
- `apps/web/src/app/features/followup/components/followup-history-item/followup-history-item.component.html` - 新規
- `apps/web/src/app/features/followup/components/followup-history-item/followup-history-item.component.scss` - 新規
- `apps/web/src/app/shared/services/followup.service.ts` - 既存（利用）

### バックエンド

既存のフォローアップ管理機能で実装済みのため、新規実装なし。

---

## 7. テスト方針

### 7.1 ユニットテスト

- `FollowupInputModalComponent`: 履歴取得処理、履歴表示
- `FollowupHistoryItemComponent`: 履歴項目の表示
- `FollowupService`: API呼び出しのモック

### 7.2 E2Eテスト

- フォローアップ入力モーダルで履歴が表示されること
- 履歴が0件の場合は空状態メッセージが表示されること
- フォローアップ保存後、履歴が更新されること

---

## 8. パフォーマンス

- 履歴一覧の取得は500ms以内
- 履歴が多数ある場合でもスクロールで全履歴を表示（ページングなし）

---

## 9. セキュリティ

- 認証が必要（既存のミドルウェアで実装済み）
- ユーザーは自分のフォローアップ履歴のみ閲覧可能（既存のバックエンドで実装済み）

---

## 10. 関連ドキュメント

| ドキュメント                              | 説明                         |
| :---------------------------------------- | :--------------------------- |
| `docs/features/followup-history-view/prd.md` | フォローアップ履歴確認機能のPRD |
| `docs/features/followup-management/tech_spec.md` | フォローアップ管理機能の技術設計（既存API仕様） |

---

_本Tech Specは Draft ステータスです。PdM/Des とのクロスレビュー後に承認予定です。_

