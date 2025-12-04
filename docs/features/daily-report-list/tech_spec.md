# 日報一覧・詳細表示機能 技術設計書（Tech Spec）

## 1. 概要
日報の一覧取得・詳細表示機能の技術的な設計・実装方針を定義する。

## 2. データモデル
※ `daily-report-input/tech_spec.md` の DailyReport を参照

## 3. API設計

### GET /api/daily-reports
自分の日報一覧を取得する

**Query Parameters**
| パラメータ | 型 | 説明 |
|:-----------|:---|:-----|
| limit | number | 取得件数（デフォルト30 ≒ 約1ヶ月分） |
| offset | number | 取得開始位置（ページング用） |

**Response**
```json
{
  "data": [
    {
      "id": "xxx",
      "date": "2025-12-04",
      "events": "...",
      "goodPointIds": ["id1", "id2"],
      "improvementIds": ["id3"]
    }
  ],
  "total": 100
}
```

※ `goodPointIds.length > 0` で「✨よかったこと有り」アイコン表示判定
※ `improvementIds.length > 0` で「📝改善点有り」アイコン表示判定

- 200 OK：取得成功
- 401 Unauthorized：未認証

---

### GET /api/daily-reports/:id
日報詳細を取得する

**Response**
```json
{
  "id": "xxx",
  "date": "2025-12-04",
  "events": "...",
  "learnings": "...",
  "goodPoints": [
    {
      "id": "gp1",
      "content": "...",
      "factors": "...",
      "status": "未対応"
    }
  ],
  "improvements": [
    {
      "id": "imp1",
      "content": "...",
      "action": "...",
      "status": "未着手"
    }
  ],
  "createdAt": "...",
  "updatedAt": "..."
}
```

- 200 OK：取得成功
- 404 Not Found：該当なし
- 401 Unauthorized：未認証

## 4. 技術スタック（案）
- フロントエンド：Angular（Shadow-CN / Tailwind CSS）
- バックエンド：Node.js or Firebase Functions等
- DB：Firestore or PostgreSQL

## 5. 補足
- 認証済みユーザーは自分の日報のみ取得可能（他人の日報は取得不可）
- 一覧は新しい順（date DESC）で返却

---

※ UI設計は `ui_design.md` に記載

