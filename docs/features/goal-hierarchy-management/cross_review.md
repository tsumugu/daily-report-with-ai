# 目標階層管理機能 クロスレビュー

**実施日**: 2025-12-13  
**参加ロール**: Eng, Des  
**対象ドキュメント**: Tech Spec, UI Design

---

## 1. UI設計 ↔ Tech Spec 整合性チェック

### ✅ 整合している項目

| 項目                   | UI Design                                | Tech Spec                           | 状態 |
| :--------------------- | :--------------------------------------- | :---------------------------------- | :--- |
| 目標一覧取得           | 目標一覧画面で目標カード一覧を表示       | GET /api/goals で階層構造を含む     | ✅   |
| 目標詳細取得           | 目標詳細画面で目標の詳細情報を表示       | GET /api/goals/:id で目標詳細取得   | ✅   |
| 目標作成               | 目標作成画面で目標を作成                 | POST /api/goals で目標作成          | ✅   |
| 目標更新               | 目標編集画面で目標を更新                 | PUT /api/goals/:id で目標更新       | ✅   |
| 目標削除               | 目標詳細画面で目標を削除                 | DELETE /api/goals/:id で目標削除    | ✅   |
| 階層構造の可視化       | 目標階層表示画面でGoalTreeViewを使用     | GET /api/goals (hierarchy=true)     | ✅   |
| 週次フォーカスとの接続 | 目標詳細画面で「週次フォーカスを設定」   | PUT /api/weekly-focuses/:id/goal    | ✅   |
| 週次フォーカス接続解除 | 週次フォーカスカードで接続解除           | DELETE /api/weekly-focuses/:id/goal | ✅   |
| バリデーションエラー   | 該当フィールドの下にエラーメッセージ表示 | バリデーションロジック定義済み      | ✅   |
| エラーハンドリング     | ネットワークエラー、サーバーエラー       | エラーレスポンス定義済み            | ✅   |

### ✅ データモデルの整合性

#### 1.1 Goalモデル

**Tech Spec**: Goalモデルのフィールド定義

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

**UI Design**: 目標作成・編集画面で入力可能なフィールド

| フィールド      | UI Design                           | Tech Spec | 整合性 |
| :-------------- | :---------------------------------- | :-------- | :----- |
| name            | InputField（必須、最大100文字）     | ✅        | ✅     |
| description     | TextareaField（任意、最大1000文字） | ✅        | ✅     |
| startDate       | DateField（必須）                   | ✅        | ✅     |
| endDate         | DateField（必須）                   | ✅        | ✅     |
| parentId        | GoalSelectField（任意）             | ✅        | ✅     |
| goalType        | Select（任意）                      | ✅        | ✅     |
| successCriteria | TextareaField（任意、最大500文字）  | ✅        | ✅     |

**確認結果**: ✅ すべてのフィールドが整合している

#### 1.2 WeeklyFocusモデルの拡張

**Tech Spec**: WeeklyFocusモデルに `goalId` を追加

| フィールド | 型             | 必須 | 説明                          |
| :--------- | :------------- | :--- | :---------------------------- |
| goalId     | string \| null | -    | 紐づく短期目標のID (新規追加) |

**UI Design**: 週次フォーカスカードに短期目標名をバッジで表示

- `goalId` が設定されている場合、短期目標名をバッジで表示
- 目標詳細画面（短期目標の場合）で「週次フォーカスを設定」ボタンを表示

**確認結果**: ✅ 整合している

### ✅ APIレスポンスとUI表示の整合性

#### 2.1 GET /api/goals レスポンス

**Tech Spec**: 階層構造を含む目標一覧を返却

```json
{
  "data": [
    {
      "id": "goal-id",
      "name": "目標名",
      "startDate": "2025-01-01",
      "endDate": "2025-06-30",
      "parentId": null,
      "goalType": "skill",
      "children": [...]
    }
  ]
}
```

**UI Design**: 目標一覧画面で目標カード一覧を表示

- 目標名、期間、階層レベル、目標の性質を表示
- GoalCardコンポーネントで表示

**確認結果**: ✅ UIが必要とするデータがAPIで提供される

#### 2.2 GET /api/goals/:id レスポンス

**Tech Spec**: 目標詳細を返却

```json
{
  "id": "goal-id",
  "name": "目標名",
  "description": "目標の説明",
  "startDate": "2025-01-01",
  "endDate": "2025-06-30",
  "parentId": null,
  "goalType": "skill",
  "successCriteria": "達成基準",
  "parent": {...},
  "children": [...]
}
```

**UI Design**: 目標詳細画面で目標の詳細情報を表示

- 目標名、期間、説明、達成基準、上位目標、下位目標一覧を表示
- Cardコンポーネントで表示

**確認結果**: ✅ UIが必要とするデータがAPIで提供される

#### 2.3 GET /api/weekly-focuses レスポンス（拡張）

**Tech Spec**: 週次フォーカス一覧を取得（`goalId` を含む）

```json
{
  "data": [
    {
      "id": "weekly-focus-id",
      "goalId": "short-term-goal-id",
      "goal": {
        "id": "short-term-goal-id",
        "name": "短期目標名"
      }
    }
  ]
}
```

**UI Design**: 週次フォーカスカードに短期目標名をバッジで表示

- `goalId` が設定されている場合、短期目標名をバッジで表示
- WeeklyFocusCardコンポーネントを拡張

**確認結果**: ✅ UIが必要とするデータがAPIで提供される

### ✅ UI操作とAPIの整合性

#### 3.1 目標作成

**UI Design**: 目標作成画面で目標情報を入力して保存

- POST /api/goals を呼び出し
- Request Body: `name`, `description`, `startDate`, `endDate`, `parentId`, `goalType`, `successCriteria`

**Tech Spec**: POST /api/goals で目標を作成

- Request Body: 同様のフィールド
- Response: 201 Created, 作成されたGoalオブジェクト

**確認結果**: ✅ UIの操作に対応するAPIが定義されている

#### 3.2 目標更新

**UI Design**: 目標編集画面で目標情報を変更して保存

- PUT /api/goals/:id を呼び出し
- Request Body: 更新対象のフィールド

**Tech Spec**: PUT /api/goals/:id で目標を更新

- Request Body: 更新対象のフィールド
- Response: 200 OK, 更新されたGoalオブジェクト

**確認結果**: ✅ UIの操作に対応するAPIが定義されている

#### 3.3 目標削除

**UI Design**: 目標詳細画面で「削除」ボタンをクリック

- DELETE /api/goals/:id を呼び出し

**Tech Spec**: DELETE /api/goals/:id で目標を削除

- Response: 200 OK, 成功メッセージ
- 下位目標が存在する場合は削除を許可しない（400 Bad Request）

**確認結果**: ✅ UIの操作に対応するAPIが定義されている

#### 3.4 週次フォーカスとの接続

**UI Design**: 目標詳細画面（短期目標の場合）で「週次フォーカスを設定」ボタンをクリック

- PUT /api/weekly-focuses/:id/goal を呼び出し
- Request Body: `goalId`

**Tech Spec**: PUT /api/weekly-focuses/:id/goal で週次フォーカスと短期目標を接続

- Request Body: `goalId`
- Response: 200 OK, 接続成功

**確認結果**: ✅ UIの操作に対応するAPIが定義されている

#### 3.5 週次フォーカス接続解除

**UI Design**: 週次フォーカスカードで接続解除

- DELETE /api/weekly-focuses/:id/goal を呼び出し

**Tech Spec**: DELETE /api/weekly-focuses/:id/goal で週次フォーカスと短期目標の接続を解除

- Response: 200 OK, 解除成功

**確認結果**: ✅ UIの操作に対応するAPIが定義されている

### ✅ バリデーションの整合性

#### 4.1 目標名のバリデーション

**Tech Spec**: `name`: 必須、最大100文字

**UI Design**: InputField（必須、最大100文字、文字数カウンター）

**確認結果**: ✅ 整合している

#### 4.2 目標の説明のバリデーション

**Tech Spec**: `description`: 任意、最大1000文字

**UI Design**: TextareaField（任意、最大1000文字、文字数カウンター）

**確認結果**: ✅ 整合している

#### 4.3 達成基準のバリデーション

**Tech Spec**: `successCriteria`: 任意、最大500文字

**UI Design**: TextareaField（任意、最大500文字、文字数カウンター）

**確認結果**: ✅ 整合している

#### 4.4 期間の整合性チェック

**Tech Spec**: 下位目標の期間は上位目標の期間内に収まること

**UI Design**: バリデーションエラーを該当フィールドの下に表示

**確認結果**: ✅ 整合している

#### 4.5 循環参照の防止

**Tech Spec**: 循環参照が発生しないこと

**UI Design**: バリデーションエラーを該当フィールドの下に表示

**確認結果**: ✅ 整合している

---

## 2. エラーハンドリングの整合性

### ✅ エラーレスポンスとUI表示の整合性

| エラー種別           | Tech Spec                         | UI Design                                | 整合性 |
| :------------------- | :-------------------------------- | :--------------------------------------- | :----- |
| バリデーションエラー | 400 Bad Request, エラーメッセージ | 該当フィールドの下にエラーメッセージ表示 | ✅     |
| ネットワークエラー   | ネットワークエラー                | リトライボタン付きエラーメッセージ表示   | ✅     |
| サーバーエラー       | 500 Internal Server Error         | 「エラーが発生しました...」表示          | ✅     |
| 認証切れ             | 401 Unauthorized                  | ログイン画面へリダイレクト               | ✅     |
| アクセス権限なし     | 403 Forbidden                     | エラーメッセージ表示                     | ✅     |
| 目標が見つからない   | 404 Not Found                     | エラーメッセージ表示                     | ✅     |

**確認結果**: ✅ すべてのエラーハンドリングが整合している

---

## 3. 総合評価

### ✅ 承認

Tech SpecとUI Designの整合性は確認できました。UIで表示するデータがAPIレスポンスに含まれており、UIの操作に対応するAPIが定義されています。

**良好な点**:

- すべてのUI操作に対応するAPIが定義されている
- UIが必要とするデータがAPIレスポンスに含まれている
- バリデーションルールが整合している
- エラーハンドリングが整合している
- データモデルが整合している

**改善提案**: なし

**承認者**: Eng, Des  
**承認日**: 2025-12-13

---

## 4. 次のステップ

1. **プロトタイプ作成**
   - Des: UI Designを元にHTML/CSS/JavaScriptでプロトタイプを作成

2. **実装開始**
   - すべての設計ドキュメントがApprovedステータスになったら、実装を開始

---

_本クロスレビューは完了しました。Tech SpecとUI Designの整合性が確認されました。_
