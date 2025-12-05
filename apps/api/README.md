# Daily Report API

日報管理システムのバックエンドAPI

## セットアップ

```bash
cd api
npm install
```

## 開発サーバー起動

```bash
npm run dev
```

サーバーが `http://localhost:3000` で起動します。

## API エンドポイント

### 認証

| Method | Endpoint | 説明 |
|:-------|:---------|:-----|
| POST | `/api/auth/signup` | 新規ユーザー登録 |
| POST | `/api/auth/login` | ログイン |
| POST | `/api/auth/logout` | ログアウト |
| GET | `/api/auth/me` | ログイン中のユーザー情報取得 |

### ヘルスチェック

| Method | Endpoint | 説明 |
|:-------|:---------|:-----|
| GET | `/api/health` | サーバー稼働確認 |

## 環境変数

`.env.example` を `.env` にコピーして設定してください。

```bash
cp .env.example .env
```

## ビルド

```bash
npm run build
npm start
```

