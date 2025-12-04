# 日報入力機能 技術設計書（Tech Spec）

## 1. 概要
日報入力・保存機能の技術的な設計・実装方針を定義する。

## 2. データモデル

### DailyReport（日報）
| フィールド | 型 | 必須 | 説明 |
|:-----------|:---|:-----|:-----|
| id | string (UUID) | ○ | 一意識別子 |
| userId | string | ○ | 作成者のユーザーID |
| date | Date | ○ | 対象日付 |
| events | string | ○ | できごと |
| learnings | string | - | 学び |
| goodPointIds | string[] | - | 紐づくよかったことのID |
| improvementIds | string[] | - | 紐づく改善点のID |
| createdAt | DateTime | ○ | 作成日時 |
| updatedAt | DateTime | ○ | 更新日時 |

### GoodPoint（よかったこと）
| フィールド | 型 | 必須 | 説明 |
|:-----------|:---|:-----|:-----|
| id | string (UUID) | ○ | 一意識別子 |
| userId | string | ○ | 作成者のユーザーID |
| content | string | ○ | 内容 |
| factors | string | - | 要因・背景 |
| tags | string[] | - | タグ（カテゴリ等） |
| status | enum | ○ | 未対応 / 再現成功 / 未達 |
| createdAt | DateTime | ○ | 作成日時 |
| updatedAt | DateTime | ○ | 更新日時 |

### Improvement（改善点/アクション）
| フィールド | 型 | 必須 | 説明 |
|:-----------|:---|:-----|:-----|
| id | string (UUID) | ○ | 一意識別子 |
| userId | string | ○ | 作成者のユーザーID |
| content | string | ○ | 改善したい内容 |
| action | string | - | 具体的アクション |
| status | enum | ○ | 未着手 / 進行中 / 完了 |
| createdAt | DateTime | ○ | 作成日時 |
| updatedAt | DateTime | ○ | 更新日時 |

## 3. API設計

### POST /api/daily-reports
日報を新規作成する（よかったこと・改善点も同時登録可）

**Request Body**
```json
{
  "date": "2025-12-04",
  "events": "...",
  "learnings": "...",
  "goodPoints": [
    {
      "content": "...",
      "factors": "...",
      "tags": ["タグ1", "タグ2"]
    }
  ],
  "improvements": [
    {
      "content": "...",
      "action": "..."
    }
  ]
}
```

**Response**
- 201 Created：作成成功（日報ID + 各エンティティIDを返却）
- 400 Bad Request：バリデーションエラー
- 401 Unauthorized：未認証

---

### POST /api/good-points
よかったことを単独で追加

**Request Body**
```json
{
  "content": "...",
  "factors": "...",
  "tags": ["タグ1"]
}
```

**Response**
- 201 Created：作成成功（作成されたGoodPointのIDを返却）

---

### PATCH /api/good-points/:id
よかったことのステータス・内容を更新（フォローアップ時）

**Request Body**
```json
{
  "status": "再現成功",
  "factors": "追記..."
}
```

---

### POST /api/improvements
改善点を単独で追加

**Request Body**
```json
{
  "content": "...",
  "action": "..."
}
```

**Response**
- 201 Created：作成成功（作成されたImprovementのIDを返却）

---

### PATCH /api/improvements/:id
改善点のステータス・内容を更新（フォローアップ時）

**Request Body**
```json
{
  "status": "完了",
  "action": "追記..."
}
```

## 4. バリデーション
- date：必須、Date形式
- events：必須、最大1000文字
- learnings：任意、最大1000文字
- goodPoints / improvements：空配列可（入力しない場合）
- goodPoints[].content / improvements[].content：必須、最大1000文字
- goodPoints[].factors / improvements[].action：任意、最大1000文字
- status：enum値のみ許可

## 5. 技術スタック（案）
- フロントエンド：Angular（Shadow-CN / Tailwind CSS）
- バックエンド：Node.js or Firebase Functions等
- DB：Firestore or PostgreSQL（変更容易性重視）

## 6. 補足
- 認証済みユーザーのみ日報作成可能
- 下書き保存はPhase 2以降で検討

---

※ UI設計は `ui_design.md` に記載

