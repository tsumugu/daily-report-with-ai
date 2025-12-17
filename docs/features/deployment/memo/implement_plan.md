# GCP構成 実装計画書

**作成日**: 2025-01-XX  
**作成者**: Eng  
**目的**: GCP構成で最も安く済む方法の実装計画

---

## 📋 目次

1. [コスト最適化方針](#コスト最適化方針)
2. [実装フェーズ](#実装フェーズ)
3. [フェーズ1: 必須コード実装](#フェーズ1-必須コード実装)
4. [フェーズ2: Dockerfile作成](#フェーズ2-dockerfile作成)
5. [フェーズ3: インフラ構成（Terraform）](#フェーズ3-インフラ構成terraform)
6. [フェーズ4: CI/CDパイプライン（GitHub Actions）](#フェーズ4-cicdパイプラインgithub-actions)
7. [フェーズ5: 環境設定とデプロイ](#フェーズ5-環境設定とデプロイ)
8. [環境変数管理戦略](#環境変数管理戦略)
9. [コスト見積もり](#コスト見積もり)

---

## コスト最適化方針

### GCP無料枠の最大活用

1. **Cloud Run無料枠**
   - 月200万リクエスト
   - 360,000GB秒（メモリ×秒）
   - 180,000vCPU秒
   - **最小リソース設定**: CPU 0.25、メモリ 256MB

2. **Cloud Storage無料枠**
   - 月5GB（標準ストレージクラス）
   - 操作（読み取り/書き込み）: 無料枠あり

3. **Container Registry無料枠**
   - ストレージ: 0.5GB
   - 転送: 無料（同一リージョン内）

### コスト最適化設定

- **リージョン**: `asia-northeast1`（東京、コスト効率が良い）
- **Cloud Run**: 最小リソース（CPU 0.25、メモリ 256MB）
- **Cloud Storage**: 標準ストレージクラス（最安）
- **Container Registry**: 同一リージョン使用

### 想定コスト（小規模利用）

- **Cloud Run**: 無料枠内（月200万リクエスト未満）
- **Cloud Storage**: 無料枠内（5GB未満）
- **Container Registry**: 無料枠内（0.5GB未満）
- **合計**: **$0/月**（無料枠内の場合）

---

## 実装フェーズ

### フェーズ概要

1. **フェーズ1**: 必須コード実装（CORS、JWT_SECRET、環境設定）
2. **フェーズ2**: Dockerfile作成（API用）
3. **フェーズ3**: Terraformインフラ構成
4. **フェーズ4**: GitHub Actions CI/CDパイプライン
5. **フェーズ5**: 環境設定とデプロイ

---

## フェーズ1: 必須コード実装

### 1.1 CORS設定の環境変数化

**ファイル**: `apps/api/src/index.ts`

**変更内容**:

```typescript
// 変更前（13-16行目）
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

**確認方法**:

```bash
cd apps/api
CORS_ORIGIN=https://example.com npm run dev
```

---

### 1.2 JWT_SECRETの必須化

**ファイル**: `apps/api/src/middleware/auth.middleware.ts`

**変更内容**:

```typescript
// 変更前（4行目）
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

// 変更後
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error(
    "JWT_SECRET environment variable is required. Please set it in your environment.",
  );
}
```

**確認方法**:

```bash
cd apps/api
# エラーになることを確認
npm run dev
# → Error: JWT_SECRET environment variable is required...

# 正常に起動することを確認
JWT_SECRET=test-secret npm run dev
```

---

### 1.3 フロントエンド環境設定の更新

**ファイル**: `apps/web/src/environments/environment.prod.ts`

**変更内容**:

```typescript
/**
 * 本番環境（Production）用の環境変数
 * `ng build --configuration=production` で使用
 */
export const environment = {
  production: true,
  // ビルド時に環境変数から注入、デフォルト値はプレースホルダー
  apiUrl: process.env["API_URL"] || "https://api.yourdomain.com/api",
  appName: "Daily Report",
};
```

**注意**: Angularはビルド時に環境変数を埋め込むため、GitHub Actionsでビルド時に設定する。

---

### 1.4 GitHub Pages用SPAルーティング対応

**問題**: GitHub Pagesは静的ファイルホスティングのため、SPAのクライアントサイドルーティングで直接URLにアクセスすると404エラーになる。

**解決策**: `404.html`を作成して、すべてのリクエストを`index.html`にフォールバックさせる。

**実装方法**: GitHub Actionsのビルドステップで`index.html`を`404.html`にコピーする。

**base hrefの設定**:

- カスタムドメインを使用する場合: `base href="/"`
- リポジトリ名がURLに含まれる場合（例: `https://username.github.io/repository-name/`）: `base href="/repository-name/"`

**Angular CLIのビルドオプション**:

```bash
ng build --base-href=/repository-name/  # リポジトリ名が含まれる場合
ng build --base-href=/                  # カスタムドメインの場合
```

---

### 1.5 環境変数テンプレートの作成

**ファイル**: `apps/api/.env.example`

**作成内容**:

```bash
# API Server Configuration
PORT=3000
NODE_ENV=production

# Authentication (必須)
JWT_SECRET=your-very-secure-random-secret-key-minimum-32-characters

# Database
DB_PATH=/mnt/gcs/daily-report.db

# CORS
CORS_ORIGIN=https://yourdomain.com
```

---

## フェーズ2: Dockerfile作成

### 2.1 API用Dockerfile

**ファイル**: `apps/api/Dockerfile`

**作成内容**:

```dockerfile
# マルチステージビルドでイメージサイズを最小化
FROM node:18-alpine AS builder

WORKDIR /app

# 依存関係のインストール
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/shared/package*.json ./packages/shared/

# 本番用依存関係のみインストール（devDependencies除外）
RUN npm ci --workspace=apps/api --workspace=packages/shared --omit=dev

# アプリケーションコードのコピー
COPY apps/api ./apps/api
COPY packages/shared ./packages/shared

# ビルド
WORKDIR /app/apps/api
RUN npm run build

# 実行ステージ
FROM node:18-alpine

WORKDIR /app

# 実行に必要なファイルのみコピー
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared ./packages/shared

# 非rootユーザーの作成（セキュリティ）
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# 環境変数の設定
ENV NODE_ENV=production
ENV PORT=8080
ENV DB_PATH=/mnt/gcs/daily-report.db

# Cloud Runは8080ポートを使用
EXPOSE 8080

# ヘルスチェック
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "dist/index.js"]
```

**注意**: Cloud Runは`PORT`環境変数を自動設定するため、コード側で`process.env.PORT || 8080`とする必要がある。

---

### 2.2 APIのポート設定確認

**ファイル**: `apps/api/src/index.ts`

**確認**:

```typescript
const PORT = process.env.PORT || 3000;
```

**変更（Cloud Run対応）**:

```typescript
const PORT = process.env.PORT || 8080;
```

---

### 2.3 .dockerignoreの作成

**ファイル**: `.dockerignore`

**作成内容**:

```dockerignore
# 依存関係
node_modules
npm-debug.log
yarn-error.log

# ビルド成果物
dist
build
*.log

# 開発ファイル
.env
.env.local
.env.*.local

# Git
.git
.gitignore

# IDE
.vscode
.idea
*.swp
*.swo

# テスト
coverage
.nyc_output

# ドキュメント
docs
*.md
README.md

# その他
.DS_Store
*.db
*.db-shm
*.db-wal
```

---

## フェーズ3: インフラ構成（Terraform）

### 3.1 Terraformディレクトリ構造

```
terraform/
├── main.tf           # メインリソース定義
├── variables.tf      # 変数定義
├── outputs.tf       # 出力定義
├── terraform.tfvars.example  # 変数テンプレート
└── README.md        # Terraform設定説明
```

---

### 3.2 main.tf

**ファイル**: `terraform/main.tf`

**作成内容**:

```hcl
terraform {
  required_version = ">= 1.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

# プロジェクト設定
variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "asia-northeast1"
}

# Cloud Storageバケット（SQLiteデータベース用）
resource "google_storage_bucket" "db" {
  name     = "${var.project_id}-daily-report-db"
  location = var.region

  # コスト最適化: 標準ストレージクラス
  storage_class = "STANDARD"

  # ライフサイクル設定（コスト削減）
  lifecycle_rule {
    condition {
      age = 90  # 90日以上古いファイルは削除（オプション）
    }
    action {
      type = "Delete"
    }
  }

  # バージョニング無効（コスト削減）
  versioning {
    enabled = false
  }

  # 公開アクセス無効（セキュリティ）
  uniform_bucket_level_access = true
}

# Cloud Runサービス（API）
resource "google_cloud_run_service" "api" {
  name     = "daily-report-api"
  location = var.region

  template {
    spec {
      # コスト最適化: 最小リソース設定
      containers {
        image = "gcr.io/${var.project_id}/daily-report-api:latest"

        # コスト最適化: 最小リソース（無料枠内）
        resources {
          limits = {
            cpu    = "0.25"
            memory = "256Mi"
          }
        }

        # 環境変数
        env {
          name  = "NODE_ENV"
          value = "production"
        }

        env {
          name  = "PORT"
          value = "8080"
        }

        env {
          name  = "DB_PATH"
          value = "/mnt/gcs/daily-report.db"
        }

        env {
          name  = "CORS_ORIGIN"
          value = var.cors_origin
        }

        env {
          name = "JWT_SECRET"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.jwt_secret.secret_id
              key  = "latest"
            }
          }
        }

        # Cloud Storage FUSEマウント
        volume_mounts {
          name       = "gcs-fuse"
          mount_path = "/mnt/gcs"
        }
      }

      # Cloud Storage FUSEボリューム
      volumes {
        name = "gcs-fuse"
        csi {
          driver = "gcsfuse.csi.storage.gke.io"
          volume_attributes = {
            bucketName = google_storage_bucket.db.name
          }
        }
      }

      # コスト最適化: 最小インスタンス数
      container_concurrency = 80
      timeout_seconds      = 300
    }

    metadata {
      annotations = {
        # コスト最適化: 最小インスタンス数0（リクエスト時のみ起動）
        "autoscaling.knative.dev/minScale" = "0"
        "autoscaling.knative.dev/maxScale" = "10"
        "run.googleapis.com/cpu-throttling" = "true"
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

# IAM設定（Cloud RunがCloud Storageにアクセス可能にする）
resource "google_cloud_run_service_iam_member" "public_access" {
  service  = google_cloud_run_service.api.name
  location = google_cloud_run_service.api.location
  role     = "roles/run.invoker"
  member   = "allUsers"  # 認証が必要な場合は変更
}

# Secret Manager（JWT_SECRET用）
resource "google_secret_manager_secret" "jwt_secret" {
  secret_id = "jwt-secret"

  replication {
    automatic = true
  }
}

# Secret Managerバージョン（実際の値は手動で設定）
resource "google_secret_manager_secret_version" "jwt_secret" {
  secret      = google_secret_manager_secret.jwt_secret.id
  secret_data = var.jwt_secret  # terraform.tfvarsで設定
}

# Cloud RunがSecret Managerにアクセス可能にする
resource "google_project_iam_member" "cloud_run_secret_accessor" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_cloud_run_service.api.template[0].spec[0].service_account_name}"
}
```

---

### 3.3 variables.tf

**ファイル**: `terraform/variables.tf`

**作成内容**:

```hcl
variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "asia-northeast1"
}

variable "cors_origin" {
  description = "CORS Origin (Frontend URL)"
  type        = string
}

variable "jwt_secret" {
  description = "JWT Secret Key"
  type        = string
  sensitive   = true
}
```

---

### 3.4 outputs.tf

**ファイル**: `terraform/outputs.tf`

**作成内容**:

```hcl
output "cloud_run_url" {
  description = "Cloud Run Service URL"
  value       = google_cloud_run_service.api.status[0].url
}

output "storage_bucket_name" {
  description = "Cloud Storage Bucket Name"
  value       = google_storage_bucket.db.name
}
```

---

### 3.5 terraform.tfvars.example

**ファイル**: `terraform/terraform.tfvars.example`

**作成内容**:

```hcl
project_id   = "your-gcp-project-id"
region       = "asia-northeast1"
cors_origin  = "https://yourusername.github.io"
jwt_secret   = "your-very-secure-random-secret-key-minimum-32-characters"
```

---

## フェーズ4: CI/CDパイプライン（GitHub Actions）

### 4.1 デプロイワークフロー

**ファイル**: `.github/workflows/deploy.yml`

**作成内容**:

```yaml
name: Deploy to GCP

on:
  push:
    branches: [master]

env:
  GCP_PROJECT_ID: ${{ secrets.GCP_PROJECT_ID }}
  GCP_REGION: asia-northeast1
  API_URL: ${{ secrets.API_URL }}

jobs:
  deploy-frontend:
    name: Deploy Frontend to GitHub Pages
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "npm"
          cache-dependency-path: apps/web/package-lock.json

      - name: Install dependencies
        run: |
          cd apps/web
          npm ci

      - name: Build Frontend
        run: |
          cd apps/web
          # base-hrefの設定（カスタムドメインの場合は"/"、リポジトリ名が含まれる場合は"/repository-name/"）
          BASE_HREF=${{ secrets.BASE_HREF || '/' }}
          API_URL=${{ env.API_URL }} npm run build -- --configuration=production --base-href=${{ secrets.BASE_HREF || '/' }}

      - name: Create 404.html for SPA routing
        run: |
          cd apps/web/dist/web
          # GitHub PagesでSPAのルーティングをサポートするため、404.htmlを作成
          cp index.html 404.html

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./apps/web/dist/web
          cname: ${{ secrets.CUSTOM_DOMAIN }} # カスタムドメインがある場合

  deploy-backend:
    name: Deploy Backend to Cloud Run
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup GCP
        uses: google-github-actions/setup-gcloud@v1
        with:
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          project_id: ${{ env.GCP_PROJECT_ID }}

      - name: Configure Docker for GCR
        run: gcloud auth configure-docker

      - name: Build Docker Image
        run: |
          docker build -f apps/api/Dockerfile \
            -t gcr.io/${{ env.GCP_PROJECT_ID }}/daily-report-api:${{ github.sha }} \
            -t gcr.io/${{ env.GCP_PROJECT_ID }}/daily-report-api:latest \
            .

      - name: Push Docker Image
        run: |
          docker push gcr.io/${{ env.GCP_PROJECT_ID }}/daily-report-api:${{ github.sha }}
          docker push gcr.io/${{ env.GCP_PROJECT_ID }}/daily-report-api:latest

      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy daily-report-api \
            --image gcr.io/${{ env.GCP_PROJECT_ID }}/daily-report-api:${{ github.sha }} \
            --region ${{ env.GCP_REGION }} \
            --platform managed \
            --allow-unauthenticated \
            --memory 256Mi \
            --cpu 0.25 \
            --min-instances 0 \
            --max-instances 10 \
            --set-env-vars NODE_ENV=production,DB_PATH=/mnt/gcs/daily-report.db,CORS_ORIGIN=${{ secrets.CORS_ORIGIN }} \
            --update-secrets JWT_SECRET=jwt-secret:latest \
            --add-cloudsql-instances "" \
            --set-cloudsql-instances ""
```

---

## フェーズ5: 環境設定とデプロイ

### 5.1 GCPプロジェクトの準備

1. **GCPプロジェクト作成**

   ```bash
   gcloud projects create daily-report-project
   gcloud config set project daily-report-project
   ```

2. **必要なAPIの有効化**

   ```bash
   gcloud services enable \
     cloudbuild.googleapis.com \
     run.googleapis.com \
     storage.googleapis.com \
     secretmanager.googleapis.com \
     artifactregistry.googleapis.com
   ```

3. **サービスアカウント作成**

   ```bash
   gcloud iam service-accounts create github-actions \
     --display-name="GitHub Actions Service Account"

   gcloud projects add-iam-policy-binding daily-report-project \
     --member="serviceAccount:github-actions@daily-report-project.iam.gserviceaccount.com" \
     --role="roles/run.admin"

   gcloud projects add-iam-policy-binding daily-report-project \
     --member="serviceAccount:github-actions@daily-report-project.iam.gserviceaccount.com" \
     --role="roles/storage.admin"

   gcloud projects add-iam-policy-binding daily-report-project \
     --member="serviceAccount:github-actions@daily-report-project.iam.gserviceaccount.com" \
     --role="roles/secretmanager.admin"

   gcloud iam service-accounts keys create key.json \
     --iam-account=github-actions@daily-report-project.iam.gserviceaccount.com
   ```

---

### 5.2 GitHub Secrets設定

GitHubリポジトリのSettings > Secrets and variables > Actionsで以下を設定：

- `GCP_SA_KEY`: サービスアカウントキー（key.jsonの内容）
- `GCP_PROJECT_ID`: GCPプロジェクトID
- `API_URL`: 本番APIのURL（Cloud RunのURL）
- `CORS_ORIGIN`: フロントエンドのURL（GitHub PagesのURL）
- `JWT_SECRET`: JWT秘密鍵（強力なランダム文字列）
- `BASE_HREF`: Angularのbase href（カスタムドメインの場合は`/`、リポジトリ名が含まれる場合は`/repository-name/`）
- `CUSTOM_DOMAIN`: カスタムドメイン（オプション、使用する場合のみ設定）

---

### 5.3 Terraformでインフラ作成

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# terraform.tfvarsを編集

terraform init
terraform plan
terraform apply
```

---

### 5.4 Secret ManagerにJWT_SECRET設定

```bash
echo -n "your-very-secure-random-secret-key" | \
  gcloud secrets create jwt-secret --data-file=-
```

---

### 5.5 初回デプロイ

```bash
# masterブランチにマージすると自動デプロイ
git checkout master
git merge feature/deployment-setup
git push origin master
```

---

## 環境変数管理戦略

### 環境変数の分類

環境変数は以下のように分類して管理します：

#### 1. 機密情報（Secrets）

- **JWT_SECRET**: JWTトークンの秘密鍵
- **GCP_SA_KEY**: GCPサービスアカウントキー

**管理方法**: GCP Secret Manager + GitHub Secrets

#### 2. 設定値（Configuration）

- **PORT**: サーバーポート
- **NODE_ENV**: 実行環境
- **DB_PATH**: データベースパス
- **CORS_ORIGIN**: CORS許可オリジン

**管理方法**: 環境変数（Cloud Run環境変数、GitHub Actions）

#### 3. ビルド時変数（Build-time）

- **API_URL**: フロントエンドのAPI URL
- **BASE_HREF**: Angularのbase href

**管理方法**: GitHub Actionsのビルド時環境変数

---

### 開発環境の環境変数管理

#### ローカル開発環境

**ファイル**: `apps/api/.env`（Git管理対象外）

```bash
# .env ファイル
PORT=3000
NODE_ENV=development
JWT_SECRET=dev-secret-key-change-in-production
DB_PATH=./data/daily-report.db
CORS_ORIGIN=http://localhost:4200
```

**テンプレート**: `apps/api/.env.example`

```bash
# API Server Configuration
PORT=3000
NODE_ENV=development

# Authentication (必須)
JWT_SECRET=your-secret-key-change-in-production

# Database
DB_PATH=./data/daily-report.db

# CORS
CORS_ORIGIN=http://localhost:4200
```

**使用方法**:

```bash
# .env.exampleをコピー
cp apps/api/.env.example apps/api/.env

# .envファイルを編集（Git管理対象外）
# 実際の値を設定
```

#### フロントエンド開発環境

**ファイル**: `apps/web/src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: "http://localhost:3000/api",
  appName: "Daily Report (Dev)",
};
```

**注意**: 開発環境では環境変数ファイルを直接編集します。

---

### 本番環境の環境変数管理

#### GCP Secret Manager（機密情報）

**対象**: JWT_SECRET

**設定方法**:

```bash
# Secret Managerにシークレットを作成
echo -n "your-very-secure-random-secret-key" | \
  gcloud secrets create jwt-secret \
    --data-file=- \
    --replication-policy="automatic" \
    --project=your-project-id

# バージョンを追加（更新時）
echo -n "new-secret-value" | \
  gcloud secrets versions add jwt-secret \
    --data-file=-
```

**Cloud Runでの使用**:

- Terraformで`secret_key_ref`として参照
- GitHub Actionsで`--update-secrets`オプションで設定

**アクセス制御**:

```bash
# Cloud RunサービスアカウントにSecret Accessorロールを付与
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:SERVICE_ACCOUNT_EMAIL" \
  --role="roles/secretmanager.secretAccessor"
```

#### Cloud Run環境変数（設定値）

**対象**: PORT, NODE_ENV, DB_PATH, CORS_ORIGIN

**設定方法（Terraform）**:

```hcl
env {
  name  = "NODE_ENV"
  value = "production"
}

env {
  name  = "PORT"
  value = "8080"
}

env {
  name  = "DB_PATH"
  value = "/mnt/gcs/daily-report.db"
}

env {
  name  = "CORS_ORIGIN"
  value = var.cors_origin
}
```

**設定方法（gcloud CLI）**:

```bash
gcloud run services update daily-report-api \
  --set-env-vars NODE_ENV=production,DB_PATH=/mnt/gcs/daily-report.db,CORS_ORIGIN=https://yourdomain.com \
  --region asia-northeast1
```

#### GitHub Secrets（CI/CD用）

**対象**: GCP_SA_KEY, GCP_PROJECT_ID, API_URL, CORS_ORIGIN, BASE_HREF, CUSTOM_DOMAIN

**設定場所**: GitHubリポジトリ > Settings > Secrets and variables > Actions

**設定方法**:

1. GitHubリポジトリにアクセス
2. Settings > Secrets and variables > Actions
3. "New repository secret"をクリック
4. 名前と値を設定

**推奨設定**:

| Secret名         | 説明                              | 例                                         |
| :--------------- | :-------------------------------- | :----------------------------------------- |
| `GCP_SA_KEY`     | GCPサービスアカウントキー（JSON） | `{"type":"service_account",...}`           |
| `GCP_PROJECT_ID` | GCPプロジェクトID                 | `daily-report-project`                     |
| `API_URL`        | 本番APIのURL                      | `https://daily-report-api-xxx.run.app/api` |
| `CORS_ORIGIN`    | フロントエンドのURL               | `https://username.github.io`               |
| `BASE_HREF`      | Angularのbase href                | `/` または `/repository-name/`             |
| `CUSTOM_DOMAIN`  | カスタムドメイン（オプション）    | `example.com`                              |

---

### 環境変数のセキュリティベストプラクティス

#### 1. 機密情報の管理

**✅ 推奨**:

- GCP Secret Managerを使用
- GitHub Secretsを使用
- 環境変数ファイル（`.env`）をGit管理対象外にする

**❌ 避けるべき**:

- コードに直接書き込む
- Gitリポジトリにコミットする
- ログに出力する
- クライアント側に送信する

#### 2. 環境変数の検証

**アプリケーション起動時の検証**:

```typescript
// apps/api/src/middleware/auth.middleware.ts
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

// 強度チェック（オプション）
if (JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters long");
}
```

#### 3. 環境変数のローテーション

**JWT_SECRETのローテーション手順**:

1. **新しいシークレットを作成**

   ```bash
   echo -n "new-secret-value" | \
     gcloud secrets versions add jwt-secret --data-file=-
   ```

2. **Cloud Runサービスを更新**

   ```bash
   gcloud run services update daily-report-api \
     --update-secrets JWT_SECRET=jwt-secret:latest \
     --region asia-northeast1
   ```

3. **動作確認**
   - 既存のトークンは無効になる
   - ユーザーは再ログインが必要

**注意**: ローテーション時は既存のトークンが無効になるため、ユーザーに再ログインを促す必要があります。

---

### 環境変数のドキュメント化

#### 環境変数一覧表

**バックエンド(API)環境変数**:

| 変数名        | 必須   | デフォルト値               | 説明               | 管理方法           |
| :------------ | :----- | :------------------------- | :----------------- | :----------------- |
| `PORT`        | 否     | `8080`                     | サーバーポート     | Cloud Run環境変数  |
| `NODE_ENV`    | 否     | -                          | 実行環境           | Cloud Run環境変数  |
| `JWT_SECRET`  | **是** | -                          | JWT秘密鍵          | GCP Secret Manager |
| `DB_PATH`     | 否     | `/mnt/gcs/daily-report.db` | SQLiteファイルパス | Cloud Run環境変数  |
| `CORS_ORIGIN` | 否     | `http://localhost:4200`    | CORS許可オリジン   | Cloud Run環境変数  |

**フロントエンド(Web)環境変数**:

| 変数名      | 必須   | デフォルト値 | 説明               | 管理方法                   |
| :---------- | :----- | :----------- | :----------------- | :------------------------- |
| `API_URL`   | **是** | -            | 本番APIのURL       | GitHub Actions（ビルド時） |
| `BASE_HREF` | 否     | `/`          | Angularのbase href | GitHub Actions（ビルド時） |

**CI/CD環境変数（GitHub Secrets）**:

| 変数名           | 必須   | 説明                      | 管理方法       |
| :--------------- | :----- | :------------------------ | :------------- |
| `GCP_SA_KEY`     | **是** | GCPサービスアカウントキー | GitHub Secrets |
| `GCP_PROJECT_ID` | **是** | GCPプロジェクトID         | GitHub Secrets |
| `API_URL`        | **是** | 本番APIのURL              | GitHub Secrets |
| `CORS_ORIGIN`    | **是** | フロントエンドのURL       | GitHub Secrets |
| `BASE_HREF`      | 否     | Angularのbase href        | GitHub Secrets |
| `CUSTOM_DOMAIN`  | 否     | カスタムドメイン          | GitHub Secrets |

---

### 環境変数のバージョン管理戦略

#### 1. コード化するもの

**✅ コード化（Git管理）**:

- `.env.example`: 環境変数のテンプレート
- `environment.ts`: 開発環境の設定（デフォルト値）
- `environment.prod.ts`: 本番環境の設定（プレースホルダー）
- Terraform変数: インフラ構成の設定値

#### 2. コード化しないもの

**❌ コード化しない（Git管理外）**:

- `.env`: ローカル開発環境の実際の値
- 機密情報（JWT_SECRET、GCP_SA_KEY等）
- 本番環境の実際の値

#### 3. 環境変数の変更管理

**変更時の手順**:

1. **環境変数の追加/変更**
   - `.env.example`を更新
   - ドキュメントを更新
   - Terraform変数を更新（必要に応じて）

2. **機密情報の変更**
   - GCP Secret Managerで新しいバージョンを作成
   - Cloud Runサービスを更新
   - 動作確認

3. **設定値の変更**
   - Terraformで変更
   - `terraform apply`で適用
   - または`gcloud run services update`で直接更新

---

### 環境変数のトラブルシューティング

#### 問題: 環境変数が読み込まれない

**確認項目**:

1. 環境変数名のタイポ
2. 環境変数の設定場所（Cloud Run、GitHub Secrets等）
3. アプリケーションの再起動

**デバッグ方法**:

```bash
# Cloud Runの環境変数を確認
gcloud run services describe daily-report-api \
  --region asia-northeast1 \
  --format="value(spec.template.spec.containers[0].env)"

# Secret Managerのシークレットを確認（値は表示されない）
gcloud secrets describe jwt-secret
```

#### 問題: Secret Managerにアクセスできない

**確認項目**:

1. Cloud Runサービスアカウントに`roles/secretmanager.secretAccessor`ロールが付与されているか
2. Secret ManagerのAPIが有効化されているか

**解決方法**:

```bash
# APIを有効化
gcloud services enable secretmanager.googleapis.com

# ロールを付与
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:SERVICE_ACCOUNT_EMAIL" \
  --role="roles/secretmanager.secretAccessor"
```

---

### 環境変数管理チェックリスト

#### 開発環境

- [ ] `.env.example`が存在する
- [ ] `.env`が`.gitignore`に含まれている
- [ ] 開発環境用の環境変数が設定されている

#### 本番環境

- [ ] GCP Secret ManagerにJWT_SECRETが設定されている
- [ ] Cloud Run環境変数が設定されている
- [ ] GitHub Secretsが設定されている
- [ ] 環境変数のドキュメントが最新である

#### セキュリティ

- [ ] 機密情報がコードに含まれていない
- [ ] `.env`ファイルがGit管理対象外である
- [ ] Secret Managerのアクセス制御が適切である
- [ ] 環境変数のローテーション計画がある

---

## コスト見積もり

### 無料枠内の場合

| サービス           | 無料枠             | 使用量            | コスト    |
| :----------------- | :----------------- | :---------------- | :-------- |
| Cloud Run          | 200万リクエスト/月 | 10万リクエスト/月 | $0        |
| Cloud Run          | 360,000GB秒/月     | 約50,000GB秒/月   | $0        |
| Cloud Storage      | 5GB/月             | 1GB/月            | $0        |
| Container Registry | 0.5GB/月           | 0.2GB/月          | $0        |
| **合計**           | -                  | -                 | **$0/月** |

### 無料枠超過の場合（想定）

| サービス           | 使用量             | コスト         |
| :----------------- | :----------------- | :------------- |
| Cloud Run          | 300万リクエスト/月 | 約$0.40        |
| Cloud Storage      | 10GB/月            | 約$0.20        |
| Container Registry | 1GB/月             | 約$0.10        |
| **合計**           | -                  | **約$0.70/月** |

---

## 実装チェックリスト

### フェーズ1: 必須コード実装

- [ ] CORS設定の環境変数化（`apps/api/src/index.ts`）
- [ ] JWT_SECRETの必須化（`apps/api/src/middleware/auth.middleware.ts`）
- [ ] フロントエンド環境設定の更新（`apps/web/src/environments/environment.prod.ts`）
- [ ] GitHub Pages用SPAルーティング対応（404.htmlの作成）
- [ ] 環境変数テンプレートの作成（`apps/api/.env.example`）
- [ ] ポート設定の確認（Cloud Run用に8080）

### フェーズ2: Dockerfile作成

- [ ] API用Dockerfileの作成（`apps/api/Dockerfile`）
- [ ] .dockerignoreの作成（`.dockerignore`）

### フェーズ3: インフラ構成

- [ ] Terraformディレクトリ作成
- [ ] main.tfの作成
- [ ] variables.tfの作成
- [ ] outputs.tfの作成
- [ ] terraform.tfvars.exampleの作成

### フェーズ4: CI/CDパイプライン

- [ ] GitHub Actionsワークフロー作成（`.github/workflows/deploy.yml`）

### フェーズ5: 環境設定

- [ ] GCPプロジェクト作成
- [ ] 必要なAPIの有効化
- [ ] サービスアカウント作成
- [ ] GitHub Secrets設定（BASE_HREF、CUSTOM_DOMAIN含む）
- [ ] Terraformでインフラ作成
- [ ] Secret ManagerにJWT_SECRET設定
- [ ] 初回デプロイ

---

**最終更新日**: 2025-01-XX
