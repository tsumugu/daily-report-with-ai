# デプロイ戦略 技術仕様書

**作成日**: 2025-01-XX  
**作成者**: Eng  
**目的**: Daily Report プロジェクトのデプロイに関する技術仕様と実装方針

---

## 📋 目次

1. [現状分析](#現状分析)
2. [デプロイ前の実装要件](#デプロイ前の実装要件)
3. [バックエンド(API)デプロイ仕様](#バックエンドapiデプロイ仕様)
4. [フロントエンド(Web)デプロイ仕様](#フロントエンドwebデプロイ仕様)
5. [データベース(DB)デプロイ仕様](#データベースdbデプロイ仕様)
6. [環境変数設計](#環境変数設計)
7. [デプロイ方式別実装方針](#デプロイ方式別実装方針)

---

## 現状分析

### バックエンド(API)の現状

#### 実装済み

- ✅ 環境変数 `PORT` によるポート設定（デフォルト: 3000）
- ✅ 環境変数 `JWT_SECRET` によるJWT秘密鍵設定（デフォルト値あり）
- ✅ 環境変数 `DB_PATH` によるデータベースパス設定（デフォルト値あり）
- ✅ ヘルスチェックエンドポイント (`/api/health`)
- ✅ TypeScriptビルド設定 (`tsc`)
- ✅ ビルド成果物の出力先 (`dist/`)

#### 未実装・要修正

- ❌ CORS設定がハードコード（`http://localhost:4200`）
- ❌ 環境変数 `CORS_ORIGIN` の未対応
- ❌ 本番環境でのエラーハンドリング強化
- ❌ ログ出力の構造化

### フロントエンド(Web)の現状

#### 実装済み

- ✅ Angular 19 ビルド設定
- ✅ 本番環境設定ファイル (`environment.prod.ts`)
- ✅ プロキシ設定 (`proxy.conf.json`)
- ✅ SSR対応 (`server.ts`)

#### 未実装・要修正

- ❌ `environment.prod.ts` の `apiUrl` がプレースホルダー
- ❌ ビルド時の環境変数注入未対応
- ❌ 本番環境でのエラーハンドリング強化

### データベース(DB)の現状

#### 実装済み

- ✅ SQLiteファイルベース
- ✅ 環境変数 `DB_PATH` によるパス指定
- ✅ WALモード有効化
- ✅ 外部キー制約有効化
- ✅ テーブル自動初期化

#### 考慮事項

- ⚠️ ファイルベースのため永続化ストレージ必須
- ⚠️ バックアップ戦略の実装が必要
- ⚠️ マイグレーション機能未実装（現時点では不要）

---

## デプロイ前の実装要件

### 必須実装項目

#### 1. CORS設定の環境変数化

**ファイル**: `apps/api/src/index.ts`

**変更内容**:

```typescript
// 変更前
app.use(
  cors({
    origin: "http://localhost:4200",
    credentials: true,
  }),
);

// 変更後
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:4200",
    credentials: true,
  }),
);
```

**理由**: 本番環境ではフロントエンドのURLが異なるため、環境変数で設定可能にする必要がある。

#### 2. フロントエンド環境設定の更新

**ファイル**: `apps/web/src/environments/environment.prod.ts`

**変更内容**:

```typescript
// 変更前
export const environment = {
  production: true,
  apiUrl: "https://api.example.com/api",
  appName: "Daily Report",
};

// 変更後（ビルド時に環境変数から注入）
export const environment = {
  production: true,
  apiUrl:
    (typeof process !== "undefined" && process.env?.["API_URL"]) ||
    "https://api.yourdomain.com/api",
  appName: "Daily Report",
};
```

**注意**: Angularはビルド時に環境変数を埋め込むため、ビルドスクリプトでの設定も検討が必要。

#### 3. JWT_SECRETのデフォルト値削除

**ファイル**: `apps/api/src/middleware/auth.middleware.ts`

**変更内容**:

```typescript
// 変更前
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

// 変更後
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}
```

**理由**: 本番環境では必ず設定されるべきであり、デフォルト値があるとセキュリティリスクになる。

### 推奨実装項目

#### 1. ログ出力の構造化

**実装方針**:

- 本番環境では構造化ログ（JSON形式）を出力
- 開発環境では読みやすい形式で出力
- ログレベル（DEBUG, INFO, WARN, ERROR）の設定

#### 2. エラーハンドリングの強化

**実装方針**:

- 本番環境では詳細なエラー情報をクライアントに返さない
- エラーログには詳細情報を記録
- グローバルエラーハンドラーの実装

#### 3. ヘルスチェックの拡張

**実装方針**:

- データベース接続確認を含める
- 詳細なヘルス情報を返す（オプション）

---

## バックエンド(API)デプロイ仕様

### ビルド仕様

#### ビルドコマンド

```bash
cd apps/api
npm ci
npm run build
```

#### ビルド成果物

- `apps/api/dist/`: コンパイル済みJavaScriptファイル
- `apps/api/dist/index.js`: エントリーポイント

#### 依存関係

- 本番環境では `devDependencies` は不要
- `npm ci --omit=dev` で本番用依存関係のみインストール可能

### 実行仕様

#### 起動コマンド

```bash
node dist/index.js
# または
npm start
```

#### 必要環境変数

| 変数名        | 必須   | デフォルト値               | 説明                                     | 本番環境での管理方法 |
| :------------ | :----- | :------------------------- | :--------------------------------------- | :------------------- |
| `PORT`        | 否     | `8080`                     | サーバーポート（Cloud Runは8080を使用）  | Cloud Run環境変数    |
| `JWT_SECRET`  | **是** | -                          | JWT秘密鍵（強力なランダム文字列）        | GCP Secret Manager   |
| `DB_PATH`     | 否     | `/mnt/gcs/daily-report.db` | SQLiteファイルパス（Cloud Storage FUSE） | Cloud Run環境変数    |
| `CORS_ORIGIN` | 否     | `http://localhost:4200`    | CORS許可オリジン                         | Cloud Run環境変数    |
| `NODE_ENV`    | 否     | -                          | 実行環境（`production`推奨）             | Cloud Run環境変数    |

### デプロイ方式

**✅ 決定: GCP Cloud Run（採用）**

#### 採用方式: GCP Cloud Run

**構成**:

- **バックエンド**: GCP Cloud Run（サーバーレスコンテナ）
- **データベース**: GCP Cloud Storage + FUSE（SQLiteファイル）
- **フロントエンド**: GitHub Pages（静的ホスティング）

**メリット**:

- ✅ サーバーレス、従量課金（無料枠あり）
- ✅ 自動スケーリング
- ✅ コスト効率が良い（月$0-0.70）
- ✅ Infrastructure as Code（Terraform）で管理可能
- ✅ CI/CDパイプライン（GitHub Actions）で自動デプロイ
- ✅ データ永続化（Cloud Storageで独立管理）

**実装要件**:

- Dockerfileの作成（マルチステージビルド）
- Terraformインフラ構成
- GitHub Actions CI/CDパイプライン
- GCP Secret Manager（機密情報管理）
- Cloud Storage FUSEマウント設定

**リソース設定（コスト最適化）**:

- CPU: 0.25
- メモリ: 256MB
- 最小インスタンス数: 0（リクエスト時のみ起動）
- リージョン: `asia-northeast1`（東京）

**ポート設定**:

- Cloud Runは自動的に`PORT`環境変数を設定（デフォルト: 8080）
- コード側で`process.env.PORT || 8080`として対応

---

#### その他の検討方式（未採用）

##### 方式1: Docker Compose

**未採用理由**:

- 月額固定のVPSが必要（要件に合わない）
- スケーリングが手動
- 高可用性の実現が困難

##### 方式2: PaaS（Railway、Render等）

**未採用理由**:

- 有料プランへの加入が必要（要件に合わない）
- 従量課金のみの要件を満たさない

##### 方式3: AWS/Azure構成

**未採用理由**:

- GCP構成の方がコスト効率が良い
- 要件を満たすが、コスト面でGCPが優位

---

## フロントエンド(Web)デプロイ仕様

### ビルド仕様

#### ビルドコマンド

```bash
cd apps/web
npm ci
npm run build
```

#### ビルド成果物

- `apps/web/dist/web/`: 静的ファイル（HTML, CSS, JS）
- `apps/web/dist/web/index.html`: エントリーポイント

#### ビルド時の環境変数注入

**✅ 決定: ビルドスクリプトで環境変数注入（GitHub Actions）**

Angularはビルド時に環境変数を埋め込むため、GitHub Actionsのビルドステップで設定：

```bash
API_URL=${{ secrets.API_URL }} npm run build -- --configuration=production --base-href=${{ secrets.BASE_HREF || '/' }}
```

**GitHub Pages用SPAルーティング対応**:

- ビルド後に`index.html`を`404.html`にコピー
- すべてのリクエストを`index.html`にフォールバック
- `base-href`オプションでリポジトリ名が含まれる場合に対応

### デプロイ方式

**✅ 決定: GitHub Pages（採用）**

#### 採用方式: GitHub Pages

**理由**:

- ✅ 完全無料
- ✅ GitHub Actionsと統合が容易
- ✅ 静的ファイルのホスティングに最適
- ✅ CDN配信（GitHub CDN）
- ✅ カスタムドメイン対応

**実装要件**:

- GitHub Actionsでビルド
- `gh-pages`ブランチにプッシュ
- `404.html`の作成（SPAルーティング対応）
- `base-href`の設定（リポジトリ名が含まれる場合）

**デプロイ方法**:

- GitHub Actionsワークフローで自動デプロイ
- masterブランチへのマージでトリガー

**SPAルーティング対応**:

- ビルド後に`index.html`を`404.html`にコピー
- GitHub Pagesが存在しないパスにアクセスした際に`404.html`を返す
- `404.html`の内容は`index.html`と同じ（Angularがルーティングを処理）

---

#### その他の検討方式（未採用）

##### 方式1: Vercel/Netlify

**未採用理由**:

- 有料プランへの加入が必要（要件に合わない）
- GitHub Pagesで要件を満たせる

##### 方式2: AWS S3 + CloudFront / GCP Cloud Storage + CDN

**未採用理由**:

- コストが発生する（GitHub Pagesは無料）
- GitHub Pagesで要件を満たせる

##### 方式3: Node.js + Express（SSR）

**未採用理由**:

- サーバーリソースが必要（コストが発生）
- 静的ホスティングで要件を満たせる

---

## データベース(DB)デプロイ仕様

### データ永続化仕様

#### 必須要件

- SQLiteファイルは永続化ストレージに保存
- 環境変数 `DB_PATH` でパス指定
- デプロイ時にデータが失われないよう注意

#### 推奨パス設定

**Docker環境**:

```
DB_PATH=/data/daily-report.db
```

**VPS/サーバー環境**:

```
DB_PATH=/var/lib/daily-report/daily-report.db
```

**クラウド環境（決定: GCP）**:

- **GCP**: `/mnt/gcs/daily-report.db` (Cloud Storage FUSE)
  - Cloud StorageバケットにSQLiteファイルを保存
  - Cloud RunにFUSEでマウント
  - APIコンテナとは独立したストレージ管理
  - 従量課金、低コスト（無料枠: 5GB/月）

**その他の検討方式（未採用）**:

- AWS: `/mnt/efs/daily-report.db` (EFSマウント) - コストが高い
- Azure: `/mnt/azure/daily-report.db` (Azure Files) - コストが高い

### バックアップ仕様

#### バックアップ方式

1. **ファイルコピー**: SQLiteファイルを直接コピー
2. **スナップショット**: ストレージのスナップショット機能を利用
3. **クラウドストレージ**: S3、GCS等への定期アップロード

#### バックアップ頻度

- 推奨: 1日1回（深夜）
- 重要データがある場合: 1日複数回

#### バックアップ保持期間

- 直近7日: 毎日
- 直近30日: 週次
- それ以前: 月次

### マイグレーション仕様

**現状**: マイグレーション機能は未実装

**将来の拡張**:

- スキーマ変更時のマイグレーションスクリプト
- バージョン管理機能

---

## 環境変数設計

### バックエンド(API)環境変数

#### 必須環境変数

```bash
# 認証
JWT_SECRET=<強力なランダム文字列（最低32文字）>

# データベース
DB_PATH=/var/lib/daily-report/daily-report.db
```

#### オプション環境変数

```bash
# サーバー設定
PORT=3000
NODE_ENV=production

# CORS設定
CORS_ORIGIN=https://yourdomain.com

# ログ設定（将来の拡張）
LOG_LEVEL=info
LOG_FORMAT=json
```

### フロントエンド(Web)環境変数

#### ビルド時環境変数

```bash
# API URL
API_URL=https://api.yourdomain.com/api
```

#### ランタイム環境変数（将来の拡張）

`index.html` に埋め込む方式を検討：

```html
<script>
  window.__ENV__ = {
    API_URL: "https://api.yourdomain.com/api",
  };
</script>
```

### 環境変数管理

**✅ 決定: GCP Secret Manager + GitHub Secrets + Cloud Run環境変数**

#### 開発環境

- `.env` ファイル（Git管理対象外）
- `.env.example` ファイル（テンプレート）

#### 本番環境

**機密情報（Secrets）**:

- **GCP Secret Manager**: JWT_SECRET
  - Cloud Runから`secret_key_ref`で参照
  - バージョン管理可能
  - アクセス制御が容易

**設定値（Configuration）**:

- **Cloud Run環境変数**: PORT, NODE_ENV, DB_PATH, CORS_ORIGIN
  - Terraformで管理
  - `gcloud run services update`で更新可能

**CI/CD用環境変数**:

- **GitHub Secrets**: GCP_SA_KEY, GCP_PROJECT_ID, API_URL, CORS_ORIGIN, BASE_HREF, CUSTOM_DOMAIN
  - GitHub Actionsワークフローで使用
  - リポジトリのSettings > Secrets and variables > Actionsで管理

**環境変数の分類**:

| 分類         | 対象                                 | 管理方法                           |
| :----------- | :----------------------------------- | :--------------------------------- |
| 機密情報     | JWT_SECRET, GCP_SA_KEY               | GCP Secret Manager、GitHub Secrets |
| 設定値       | PORT, NODE_ENV, DB_PATH, CORS_ORIGIN | Cloud Run環境変数                  |
| ビルド時変数 | API_URL, BASE_HREF                   | GitHub Actions（ビルド時）         |

**セキュリティベストプラクティス**:

- ✅ 機密情報はSecret Managerで管理
- ✅ `.env`ファイルはGit管理対象外
- ✅ 環境変数の検証をアプリケーション起動時に実施
- ✅ 環境変数のローテーション計画を策定

---

## デプロイ方式別実装方針

**✅ 決定: GCP構成（Cloud Run + Cloud Storage + GitHub Pages）**

### 採用方式: GCP構成

#### 構成詳細

```
┌─────────────────────────────────────────────────────────┐
│                    GitHub Actions                        │
│  (masterブランチマージ時に自動デプロイ)                    │
└───────────────┬───────────────────┬─────────────────────┘
                │                   │
        ┌───────▼──────┐    ┌──────▼──────┐
        │  GitHub Pages│    │  Cloud Run  │
        │  (Frontend)   │    │  (Backend)  │
        │  静的ファイル  │    │  Express API│
        └───────────────┘    └──────┬──────┘
                                    │
                            ┌───────▼────────┐
                            │ Cloud Storage   │
                            │ (SQLite DB)     │
                            │ (FUSEマウント)   │
                            └─────────────────┘
```

#### コンポーネント

**フロントエンド: GitHub Pages**

- 完全無料
- GitHub Actionsで自動デプロイ
- SPAルーティング対応（404.html）

**バックエンド: GCP Cloud Run**

- サーバーレス、従量課金
- 自動スケーリング
- 最小リソース（CPU 0.25、メモリ 256MB）
- 無料枠: 月200万リクエスト

**データベース: GCP Cloud Storage + FUSE**

- 従量課金、低コスト
- 無料枠: 月5GB
- APIコンテナとは独立したストレージ管理

#### 実装要件

**インフラ構成**:

- Terraformでインフラをコード化
- Cloud Run、Cloud Storage、Secret Managerの設定

**CI/CDパイプライン**:

- GitHub Actionsワークフロー
- masterブランチマージ時に自動デプロイ
- フロントエンド: GitHub Pagesへデプロイ
- バックエンド: Cloud Runへデプロイ

**環境変数管理**:

- GCP Secret Manager（JWT_SECRET）
- Cloud Run環境変数（設定値）
- GitHub Secrets（CI/CD用）

#### コスト見積もり

**無料枠内の場合**: **$0/月**

- Cloud Run: 月200万リクエスト未満
- Cloud Storage: 5GB未満
- Container Registry: 0.5GB未満

**無料枠超過の場合**: **約$0.70/月**

- Cloud Run: 300万リクエスト/月 = 約$0.40
- Cloud Storage: 10GB/月 = 約$0.20
- Container Registry: 1GB/月 = 約$0.10

#### メリット・デメリット

**メリット**:

- ✅ コスト効率が良い（無料枠内なら$0/月）
- ✅ サーバーレス、自動スケーリング
- ✅ Infrastructure as Code（Terraform）
- ✅ CI/CD自動化（GitHub Actions）
- ✅ データ永続化（Cloud Storage）
- ✅ メンテナンスが容易

**デメリット**:

- ⚠️ GCPの学習コスト
- ⚠️ Cloud Storage FUSEのパフォーマンス（SQLiteには適している）
- ⚠️ コスト管理が必要（無料枠超過時）

---

### その他の検討方式（未採用）

#### 方式1: Docker Compose

**未採用理由**:

- 月額固定のVPSが必要（要件に合わない）
- スケーリングが手動
- 高可用性の実現が困難

#### 方式2: クラウドPaaS（Vercel + Railway）

**未採用理由**:

- 有料プランへの加入が必要（要件に合わない）
- 従量課金のみの要件を満たさない

#### 方式3: AWS/Azure構成

**未採用理由**:

- GCP構成の方がコスト効率が良い
- 要件を満たすが、コスト面でGCPが優位

---

## 実装チェックリスト

### デプロイ前の必須実装

- [ ] CORS設定の環境変数化（`apps/api/src/index.ts`）
- [ ] JWT_SECRETの必須化（`apps/api/src/middleware/auth.middleware.ts`）
- [ ] フロントエンド環境設定の更新（`apps/web/src/environments/environment.prod.ts`）
- [ ] GitHub Pages用SPAルーティング対応（404.htmlの作成）
- [ ] 環境変数テンプレートの作成（`apps/api/.env.example`）
- [ ] ポート設定の確認（Cloud Run用に8080）

### デプロイ前の推奨実装

- [ ] ログ出力の構造化
- [ ] エラーハンドリングの強化
- [ ] ヘルスチェックの拡張
- [ ] バックアップスクリプトの作成

### デプロイ設定

- [ ] Dockerfileの作成（API用、マルチステージビルド）
- [ ] Terraformインフラ構成の作成
- [ ] GitHub Actions CI/CDパイプラインの設定
- [ ] GCP Secret Managerの設定（JWT_SECRET）
- [ ] Cloud Run環境変数の設定
- [ ] GitHub Secretsの設定（CI/CD用）

---

## 参考資料

- [デプロイ方式決定書](./deployment_decision.md) - 要件に基づいた最適なデプロイ方式の論理的導出
- [GCP構成 実装計画書](./implement_plan.md) - 詳細な実装計画と手順
- [データ永続化機能 デプロイガイド](../data-persistence/deployment_guide.md)
- [アーキテクチャ方針](../../general/arch.md)
- [Express公式ドキュメント](https://expressjs.com/)
- [Angular公式ドキュメント](https://angular.io/docs)
- [GCP Cloud Run公式ドキュメント](https://cloud.google.com/run/docs)
- [GitHub Pages公式ドキュメント](https://docs.github.com/ja/pages)

---

**最終更新日**: 2025-01-XX
