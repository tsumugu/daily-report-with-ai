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

| Method | Endpoint           | 説明                         |
| :----- | :----------------- | :--------------------------- |
| POST   | `/api/auth/signup` | 新規ユーザー登録             |
| POST   | `/api/auth/login`  | ログイン                     |
| POST   | `/api/auth/logout` | ログアウト                   |
| GET    | `/api/auth/me`     | ログイン中のユーザー情報取得 |

### ヘルスチェック

| Method | Endpoint      | 説明             |
| :----- | :------------ | :--------------- |
| GET    | `/api/health` | サーバー稼働確認 |

## 環境変数

`.env.example` を `.env` にコピーして設定してください。

```bash
cp .env.example .env
```

### 主要な環境変数

| 変数名       | 説明                             | デフォルト値                    |
| :----------- | :------------------------------- | :------------------------------ |
| `PORT`       | サーバーのポート番号             | `3000`                          |
| `JWT_SECRET` | JWTトークンの秘密鍵              | -                               |
| `DB_PATH`    | SQLiteデータベースファイルのパス | `apps/api/data/daily-report.db` |

**⚠️ デプロイ時の注意事項**:

- `DB_PATH` は**永続化されたストレージ**に設定することを推奨
- コンテナベースのデプロイの場合、**ボリュームマウント**を使用
- 詳細は [デプロイガイド](../../docs/features/data-persistence/deployment_guide.md) を参照

## ビルド

```bash
npm run build
npm start
```
