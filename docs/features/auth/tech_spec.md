# ユーザー認証機能 技術設計書（Tech Spec）

## 1. 概要
ユーザーのサインアップ/ログイン/ログアウト機能の技術設計を定義する。

## 2. データモデル

### User（ユーザー）
| フィールド | 型 | 必須 | 説明 |
|:-----------|:---|:-----|:-----|
| id | string (UUID) | ○ | 一意識別子 |
| email | string | ○ | メールアドレス（ユニーク） |
| passwordHash | string | ○ | ハッシュ化パスワード |
| createdAt | DateTime | ○ | 作成日時 |
| updatedAt | DateTime | ○ | 更新日時 |

## 3. API設計

### POST /api/auth/signup
新規ユーザー登録

**Request Body**
```json
{
  "email": "user@example.com",
  "password": "xxxxxxxx"
}
```

※ パスワード確認（passwordConfirm）はクライアント側でバリデーションし、APIには送信しない

**Response**
- 201 Created：登録成功（自動ログイン、トークン発行）
- 400 Bad Request：バリデーションエラー or 既存メール

---

### POST /api/auth/login
ログイン

**Request Body**
```json
{
  "email": "user@example.com",
  "password": "xxxxxxxx"
}
```

**Response**
- 200 OK：ログイン成功（トークン発行）
- 401 Unauthorized：認証失敗

---

### POST /api/auth/logout
ログアウト

**Response**
- 200 OK：ログアウト成功

---

### GET /api/auth/me
ログイン中のユーザー情報を取得

**Response**
```json
{
  "id": "xxx",
  "email": "user@example.com",
  "createdAt": "2025-12-04T00:00:00Z"
}
```

- 200 OK：取得成功
- 401 Unauthorized：未認証

## 4. 認証方式
- JWT（JSON Web Token）ベースのトークン認証
- トークンはHTTP Onlyクッキー or Authorizationヘッダーで管理
- パスワードはbcrypt等でハッシュ化

## 5. セキュリティ考慮
- パスワード最低8文字
- ブルートフォース対策（ログイン試行回数制限）はPhase 2以降で検討
- HTTPS必須

## 6. 技術スタック（案）
- フロントエンド：Angular
- バックエンド：Node.js（Express/NestJS）or Firebase Auth
- DB：Firestore or PostgreSQL

## 7. 補足
- ソーシャルログイン（Google等）はPhase 2以降

---

※ UI設計は `ui_design.md` に記載

