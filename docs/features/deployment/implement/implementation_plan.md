# デプロイ機能実装作業手順書

**作成日**: 2025-01-XX  
**作成者**: Eng  
**目的**: デプロイ機能の実装手順を詳細に記載

---

## 📋 目次

1. [実装前の準備](#実装前の準備)
2. [フェーズ1: 必須コード実装](#フェーズ1-必須コード実装)
3. [フェーズ2: Dockerfile作成](#フェーズ2-dockerfile作成)
4. [フェーズ3: Terraform設定](#フェーズ3-terraform設定)
5. [フェーズ4: CI/CDパイプライン](#フェーズ4-cicdパイプライン)
6. [フェーズ5: 環境設定とデプロイ](#フェーズ5-環境設定とデプロイ)
7. [フェーズ6: テストと検証](#フェーズ6-テストと検証)
8. [トラブルシューティング](#トラブルシューティング)

---

## 実装前の準備

### 1.1 前提条件の確認

- [ ] Node.js 18以上がインストールされている
- [ ] npmまたはyarnがインストールされている
- [ ] GCPアカウントが作成されている
- [ ] GitHubアカウントが作成されている
- [ ] Dockerがインストールされている（ローカルテスト用）
- [ ] Terraformがインストールされている

### 1.2 ドキュメントの確認

以下のドキュメントを確認すること：

- [PRD](../prd.md) - 要求事項と決定事項
- [技術仕様書](../tech_spec.md) - 技術的な詳細
- [実装計画書](../implement_plan.md) - 実装計画の詳細
- [Engの技術的回答](../eng_response_to_pdm.md) - 技術的な回答
- [コスト分析](../eng_cost_analysis_storage_api.md) - コスト分析

---

## フェーズ1: 必須コード実装

### 1.1 Cloud Storage API対応

#### ステップ1: パッケージのインストール

```bash
cd apps/api
npm install @google-cloud/storage
# 注意: @google-cloud/storageには型定義が含まれているため、@typesパッケージは不要
```

#### ステップ2: storage-adapter.tsの作成

**ファイル**: `apps/api/src/db/storage-adapter.ts`

**実装内容**:

1. Cloud Storageクライアントの初期化
2. ダウンロード機能の実装
3. アップロード機能の実装
4. WALファイルとSHMファイルのアップロード対応
5. 終了時の同期処理

**実装例**（詳細は`eng_response_to_pdm.md`を参照）:

```typescript
import { Storage } from "@google-cloud/storage";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import Database from "better-sqlite3";
import { initializeTables } from "./database"; // インポート追加

const BUCKET_NAME = process.env.GCS_BUCKET_NAME || "daily-report-db";
const DB_FILE_NAME = "daily-report.db";
const TEMP_DB_PATH = join("/tmp", DB_FILE_NAME);
const GCS_DB_PATH = DB_FILE_NAME;

let storage: Storage | null = null;
let dbInstance: Database.Database | null = null;
let signalHandlersRegistered = false; // シグナルハンドラーの重複登録防止

// 変更検知とバッチアップロードの統合
let hasChanges = false;
let changeCount = 0;
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || "10", 10);

export function markAsChanged(): void {
  hasChanges = true;
}

export function hasDatabaseChanges(): boolean {
  return hasChanges;
}

export function clearChanges(): void {
  hasChanges = false;
  changeCount = 0;
}

// ... 実装詳細は eng_response_to_pdm.md を参照
```

#### ステップ3: database.tsの非同期対応

**ファイル**: `apps/api/src/db/database.ts`

**変更内容**:

1. `getDatabase()`を非同期関数に変更
2. Cloud Storageアダプターの統合
3. 開発環境と本番環境の分岐処理
4. ファクトリーパターンで非同期初期化を実装

**重要**: `getDatabase()`を非同期化すると、既存のコードで同期的に呼び出されている箇所に影響があります。以下の対応が必要です：

- すべてのデータベースクラスのコンストラクタを非同期対応
- ルートハンドラーでのデータベース取得を非同期対応
- シングルトンインスタンスの作成方法を変更

**実装例**:

```typescript
let dbInstancePromise: Promise<DatabaseType> | null = null;

export async function getDatabase(): Promise<DatabaseType> {
  if (!dbInstancePromise) {
    dbInstancePromise = initializeDatabase();
  }
  return await dbInstancePromise;
}

async function initializeDatabase(): Promise<DatabaseType> {
  // Cloud Storageアダプターを使用
  if (process.env.NODE_ENV === "production" && process.env.GCS_BUCKET_NAME) {
    const { getDatabase: getGCSDatabase } = await import("./storage-adapter");
    return await getGCSDatabase();
  }

  // 開発環境は従来通り
  const dbPath =
    process.env.DB_PATH || join(process.cwd(), "data", "daily-report.db");
  const dbDir = join(dbPath, "..");
  mkdirSync(dbDir, { recursive: true });

  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  initializeTables(db);

  return db;
}

// 開発環境用の同期的なアクセス（後方互換性のため）
export function getDatabaseSync(): DatabaseType {
  if (dbInstancePromise) {
    throw new Error(
      "Database is being initialized asynchronously. Use getDatabase() instead.",
    );
  }
  // 開発環境のみの実装
  // ...
}
```

#### ステップ4: データベースクラスの非同期対応

**対象ファイル**:

- `apps/api/src/db/users.db.ts`
- `apps/api/src/db/daily-reports.db.ts`
- `apps/api/src/db/goals.db.ts`
- `apps/api/src/db/followups.db.ts`
- `apps/api/src/db/weekly-focuses.db.ts`
- `apps/api/src/db/daily-report-goals.db.ts`

**変更内容**:
各データベースクラスのコンストラクタを非同期対応にするか、ファクトリーパターンを使用する。

**実装例（ファクトリーパターン）**:

```typescript
// apps/api/src/db/users.db.ts
let usersDbInstance: UsersDatabase | null = null;
let usersDbPromise: Promise<UsersDatabase> | null = null;

export async function getUsersDatabase(): Promise<UsersDatabase> {
  if (!usersDbPromise) {
    usersDbPromise = (async () => {
      const db = await getDatabase();
      return new UsersDatabase(db);
    })();
  }
  return await usersDbPromise;
}

// 後方互換性のため、既存のシングルトンも維持（非推奨）
export const usersDb = new Proxy({} as UsersDatabase, {
  get: () => {
    throw new Error(
      "usersDb is no longer available synchronously. Use getUsersDatabase() instead.",
    );
  },
});
```

#### ステップ5: ルートハンドラーの非同期対応

**対象ファイル**:

- `apps/api/src/routes/auth.routes.ts`
- `apps/api/src/routes/daily-reports.routes.ts`
- `apps/api/src/routes/goals.routes.ts`
- `apps/api/src/routes/followups.routes.ts`
- `apps/api/src/routes/weekly-focuses.routes.ts`

**変更内容**:
各ルートハンドラーでデータベースインスタンスを非同期で取得する。

**実装例**:

```typescript
// apps/api/src/routes/auth.routes.ts
import { getUsersDatabase } from "../db/users.db.js";

authRouter.post("/signup", async (req: Request, res: Response) => {
  try {
    const usersDb = await getUsersDatabase();
    // ... 既存の処理
  } catch (error) {
    // ... エラーハンドリング
  }
});
```

### 1.2 変更検知アップロードとバッチアップロードの統合

#### ステップ1: 変更フラグ管理とバッチカウンターの実装

**ファイル**: `apps/api/src/db/storage-adapter.ts`

**実装内容**:
変更検知アップロードとバッチアップロードを統合した実装。

```typescript
let hasChanges = false;
let changeCount = 0;
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || "10", 10);

export function markAsChanged(): void {
  hasChanges = true;
}

export function hasDatabaseChanges(): boolean {
  return hasChanges;
}

export function clearChanges(): void {
  hasChanges = false;
  changeCount = 0;
}

export async function syncIfNeeded(): Promise<void> {
  if (!hasChanges) {
    return;
  }

  changeCount++;

  // バッチサイズに達した場合、または終了時は即座に同期
  if (changeCount >= BATCH_SIZE) {
    await syncDatabasePeriodically();
    changeCount = 0;
    hasChanges = false;
  }
}
```

#### ステップ2: ミドルウェアの実装

**ファイル**: `apps/api/src/index.ts`

**実装内容**:
リクエスト処理後に変更を検知し、必要に応じて同期する。

```typescript
import { syncIfNeeded } from "./db/storage-adapter";

app.use(async (req, res, next) => {
  await next();
  // 非同期で実行（リクエスト処理をブロックしない）
  syncIfNeeded().catch((error) => {
    console.error("Sync failed:", error);
  });
});
```

#### ステップ3: 各データベースクラスの修正

**対象ファイル**:

- `apps/api/src/db/users.db.ts`
- `apps/api/src/db/daily-reports.db.ts`
- `apps/api/src/db/goals.db.ts`
- `apps/api/src/db/followups.db.ts`
- `apps/api/src/db/weekly-focuses.db.ts`
- `apps/api/src/db/daily-report-goals.db.ts`

**変更内容**:
各INSERT、UPDATE、DELETE操作時に`markAsChanged()`を呼び出す。

**実装例**:

```typescript
import { markAsChanged } from './storage-adapter';

save(user: User): User {
  // ... データベース操作
  markAsChanged(); // 追加
  return user;
}
```

### 1.3 終了時の確実な同期

#### ステップ1: シグナルハンドラーの実装

**ファイル**: `apps/api/src/db/storage-adapter.ts`

**実装内容**:
シグナルハンドラーの重複登録を防ぎ、終了時に確実に同期する。

```typescript
let signalHandlersRegistered = false;

export async function getDatabase(): Promise<Database.Database> {
  if (!dbInstance) {
    // ... データベース初期化

    // シグナルハンドラーの登録（1回のみ）
    if (!signalHandlersRegistered) {
      process.on("SIGTERM", async () => {
        await syncDatabase();
        process.exit(0);
      });

      process.on("SIGINT", async () => {
        await syncDatabase();
        process.exit(0);
      });

      signalHandlersRegistered = true;
    }
  }

  return dbInstance;
}
```

#### ステップ2: エラーハンドリングの強化

**ファイル**: `apps/api/src/db/storage-adapter.ts`

**実装内容**:
Cloud Storage APIのエラーを詳細にハンドリングし、リトライロジックを実装する。

```typescript
async function downloadDatabase(): Promise<void> {
  const maxRetries = 3;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      // ... ダウンロード処理
      return;
    } catch (error) {
      retries++;
      if (retries >= maxRetries) {
        console.error("Failed to download database after retries:", error);
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000 * retries));
    }
  }
}
```

### 1.4 その他の必須実装

#### 環境変数の検証

**ファイル**: `apps/api/src/config/env.ts`（新規作成）

**実装内容**:
アプリケーション起動時に環境変数を検証する。

```typescript
export function validateEnvironmentVariables(): void {
  const required = ["JWT_SECRET"];

  if (process.env.NODE_ENV === "production") {
    required.push("GCS_BUCKET_NAME");
  }

  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
}
```

**ファイル**: `apps/api/src/index.ts`

**変更内容**:

```typescript
import { validateEnvironmentVariables } from "./config/env";

validateEnvironmentVariables();
```

#### CORS設定の環境変数化

**ファイル**: `apps/api/src/index.ts`

**変更内容**:

```typescript
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:4200",
    credentials: true,
  }),
);
```

#### JWT_SECRETの必須化

**ファイル**: `apps/api/src/middleware/auth.middleware.ts`

**変更内容**:

```typescript
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}
```

#### フロントエンド環境設定の更新

**ファイル**: `apps/web/src/environments/environment.prod.ts`

**変更内容**:

```typescript
export const environment = {
  production: true,
  apiUrl: process.env["API_URL"] || "https://api.yourdomain.com/api",
  appName: "Daily Report",
};
```

#### GitHub Pages用SPAルーティング対応

**ファイル**: `.github/workflows/deploy.yml`（後述）

**実装内容**:
ビルド後に`index.html`を`404.html`にコピー

---

## フェーズ2: Dockerfile作成

### 2.1 API用Dockerfileの作成

**ファイル**: `apps/api/Dockerfile`

**実装内容**（詳細は`implement_plan.md`を参照）:

- マルチステージビルド
- 非rootユーザーの設定
- ヘルスチェックの設定

### 2.2 .dockerignoreの作成

**ファイル**: `.dockerignore`

**実装内容**（詳細は`implement_plan.md`を参照）:

- node_modules
- dist
- .env
- その他の不要ファイル

---

## フェーズ3: Terraform設定

### 3.1 Terraformディレクトリ構造の作成

```bash
mkdir -p terraform
cd terraform
```

### 3.2 main.tfの作成

**ファイル**: `terraform/main.tf`

**実装内容**:

- Terraformバージョンとプロバイダーの指定
- Cloud Storageバケットの定義
- Cloud Runサービスの定義（FUSEマウント設定を削除）
- Secret Managerの定義
- IAM設定（Cloud Runサービスアカウントへの権限付与）

**重要な変更点**:

- FUSEマウント設定を削除
- `GCS_BUCKET_NAME`環境変数を追加
- `container_concurrency = 1`を設定
- Cloud RunサービスアカウントにCloud Storageへのアクセス権限を付与

**実装例**:

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

# Cloud Storageバケット
resource "google_storage_bucket" "db" {
  name     = "${var.project_id}-daily-report-db"
  location = var.region

  versioning {
    enabled = true
  }

  lifecycle_rule {
    condition {
      age = 30
    }
    action {
      type = "Delete"
    }
  }
}

# Cloud Runサービス
resource "google_cloud_run_service" "api" {
  name     = "daily-report-api"
  location = var.region

  template {
    spec {
      service_account_name = google_service_account.cloud_run.email
      container_concurrency = 1

      containers {
        image = "asia-northeast1-docker.pkg.dev/${var.project_id}/daily-report/daily-report-api:latest"

        env {
          name  = "NODE_ENV"
          value = "production"
        }

        env {
          name  = "DB_PATH"
          value = "/tmp/daily-report.db"
        }

        env {
          name  = "GCS_BUCKET_NAME"
          value = google_storage_bucket.db.name
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
      }
    }
  }
}

# Cloud Runサービスアカウント
resource "google_service_account" "cloud_run" {
  account_id   = "cloud-run-api"
  display_name = "Cloud Run API Service Account"
}

# Cloud RunサービスアカウントにCloud Storageへのアクセス権限を付与
resource "google_project_iam_member" "cloud_run_storage_access" {
  project = var.project_id
  role    = "roles/storage.objectAdmin"
  member  = "serviceAccount:${google_service_account.cloud_run.email}"
}

# Secret Manager
resource "google_secret_manager_secret" "jwt_secret" {
  secret_id = "jwt-secret"

  replication {
    automatic = true
  }
}
```

### 3.3 variables.tfの作成

**ファイル**: `terraform/variables.tf`

**実装内容**:

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

### 3.4 outputs.tfの作成

**ファイル**: `terraform/outputs.tf`

**実装内容**:

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

### 3.5 terraform.tfvars.exampleの作成

**ファイル**: `terraform/terraform.tfvars.example`

**実装内容**:

```hcl
project_id   = "your-gcp-project-id"
region       = "asia-northeast1"
cors_origin  = "https://yourusername.github.io"
jwt_secret   = "your-very-secure-random-secret-key-minimum-32-characters"
```

---

## フェーズ4: CI/CDパイプライン

### 4.1 GitHub Actionsワークフローの作成

**ファイル**: `.github/workflows/deploy-production.yml`

**注意**: Container RegistryではなくArtifact Registryを使用します（Container Registryは2024年5月に新規プロジェクトでの使用が非推奨になりました）。

**実装内容**:

#### フロントエンドデプロイジョブ

```yaml
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

    - name: Install dependencies
      run: |
        cd apps/web
        npm ci

    - name: Build Frontend
      run: |
        cd apps/web
        API_URL=${{ secrets.API_URL }} npm run build -- --configuration=production --base-href=${{ secrets.BASE_HREF || '/' }}

    - name: Create 404.html for SPA routing
      run: |
        cd apps/web/dist/web
        cp index.html 404.html

    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./apps/web/dist/web
```

#### バックエンドデプロイジョブ

```yaml
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
        project_id: ${{ secrets.GCP_PROJECT_ID }}

    - name: Configure Docker for Artifact Registry
      run: gcloud auth configure-docker asia-northeast1-docker.pkg.dev

    - name: Build Docker Image
      run: |
        docker build -f apps/api/Dockerfile \
          -t asia-northeast1-docker.pkg.dev/${{ secrets.GCP_PROJECT_ID }}/daily-report/daily-report-api:${{ github.sha }} \
          -t asia-northeast1-docker.pkg.dev/${{ secrets.GCP_PROJECT_ID }}/daily-report/daily-report-api:latest \
          .

    - name: Push Docker Image
      run: |
        docker push asia-northeast1-docker.pkg.dev/${{ secrets.GCP_PROJECT_ID }}/daily-report/daily-report-api:${{ github.sha }}
        docker push asia-northeast1-docker.pkg.dev/${{ secrets.GCP_PROJECT_ID }}/daily-report/daily-report-api:latest

    - name: Deploy to Cloud Run
      run: |
        gcloud run deploy daily-report-api \
          --image asia-northeast1-docker.pkg.dev/${{ secrets.GCP_PROJECT_ID }}/daily-report/daily-report-api:${{ github.sha }} \
          --region asia-northeast1 \
          --platform managed \
          --allow-unauthenticated \
          --memory 256Mi \
          --cpu 0.25 \
          --min-instances 0 \
          --max-instances 10 \
          --set-env-vars NODE_ENV=production,DB_PATH=/tmp/daily-report.db,GCS_BUCKET_NAME=${{ secrets.GCS_BUCKET_NAME }},CORS_ORIGIN=${{ secrets.CORS_ORIGIN }},BATCH_SIZE=${{ secrets.BATCH_SIZE || '10' }} \
          --update-secrets JWT_SECRET=jwt-secret:latest
```

---

## フェーズ5: 環境設定とデプロイ

### 5.1 GCPプロジェクトの準備

#### ステップ1: GCPプロジェクトの作成

```bash
gcloud projects create daily-report-project
gcloud config set project daily-report-project
```

#### ステップ2: 必要なAPIの有効化

```bash
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  storage.googleapis.com \
  secretmanager.googleapis.com \
  artifactregistry.googleapis.com
```

#### ステップ2-1: Artifact Registryリポジトリの作成

```bash
gcloud artifacts repositories create daily-report \
  --repository-format=docker \
  --location=asia-northeast1 \
  --description="Daily Report API Docker repository"
```

#### ステップ3: サービスアカウントの作成

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

### 5.2 GitHub Secrets設定

GitHubリポジトリのSettings > Secrets and variables > Actionsで以下を設定：

- `GCP_SA_KEY`: サービスアカウントキー（key.jsonの内容）
- `GCP_PROJECT_ID`: GCPプロジェクトID
- `GCS_BUCKET_NAME`: Cloud Storageバケット名
- `API_URL`: 本番APIのURL（Cloud RunのURL）
- `CORS_ORIGIN`: フロントエンドのURL（GitHub PagesのURL）
- `BASE_HREF`: Angularのbase href（オプション）
- `CUSTOM_DOMAIN`: カスタムドメイン（オプション）
- `BATCH_SIZE`: バッチアップロードのサイズ（デフォルト: 10、オプション）

### 5.3 Terraformでインフラ作成

#### ステップ1: terraform.tfvarsの作成

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# terraform.tfvarsを編集
```

#### ステップ2: Terraformの初期化

```bash
terraform init
```

#### ステップ3: 実行計画の確認

```bash
terraform plan
```

#### ステップ4: インフラの作成

```bash
terraform apply
```

### 5.4 Secret Manager設定

```bash
echo -n "your-very-secure-random-secret-key" | \
  gcloud secrets create jwt-secret --data-file=-
```

### 5.5 初回デプロイ

```bash
git checkout master
git merge feature/deployment-setup
git push origin master
```

---

## フェーズ6: テストと検証

### 6.1 ローカル環境でのテスト

#### 環境変数の設定

**ファイル**: `apps/api/.env.example`（新規作成）

```bash
NODE_ENV=development
DB_PATH=./data/daily-report.db
JWT_SECRET=your-secret-key-here
CORS_ORIGIN=http://localhost:4200
GCS_BUCKET_NAME=your-bucket-name
GOOGLE_APPLICATION_CREDENTIALS=path/to/key.json
BATCH_SIZE=10
```

#### Cloud Storage APIの動作確認

```bash
# 環境変数を設定
export GCS_BUCKET_NAME=your-bucket-name
export GOOGLE_APPLICATION_CREDENTIALS=path/to/key.json
export NODE_ENV=production

# アプリケーションを起動
cd apps/api
npm run dev
```

#### 変更検知アップロードの動作確認

1. APIエンドポイントにリクエストを送信
2. データベースに変更がある場合、Cloud Storageにアップロードされることを確認
3. ログでアップロード処理を確認
4. バッチサイズに達した場合の即座のアップロードを確認

#### エラーハンドリングの確認

1. Cloud Storageへのアクセス権限がない場合のエラーハンドリング
2. ネットワークエラー時のリトライ動作
3. データベースファイルが存在しない場合の初回起動処理

### 6.2 Cloud Runでのテスト

#### デプロイの確認

```bash
gcloud run services describe daily-report-api \
  --region asia-northeast1
```

#### ヘルスチェックの確認

```bash
curl https://your-cloud-run-url/api/health
```

#### APIエンドポイントの動作確認

```bash
curl https://your-cloud-run-url/api/endpoint
```

#### データ永続化の確認

1. データを作成
2. Cloud Runインスタンスを再起動
3. データが保持されていることを確認

### 6.3 パフォーマンステスト

#### レスポンスタイムの測定

```bash
time curl https://your-cloud-run-url/api/endpoint
```

#### コールドスタート時間の測定

1. インスタンスを停止（最小インスタンス数0）
2. リクエストを送信
3. レスポンス時間を測定

### 6.4 コスト確認

#### Cloud Storage APIのオペレーション回数の確認

```bash
gcloud logging read "resource.type=cloud_run_revision" \
  --limit 100 \
  --format json
```

#### コストの監視

GCP Console > Billing > Reportsでコストを確認

---

## トラブルシューティング

### 問題1: Cloud Storage APIへのアクセスが失敗する

**原因**: サービスアカウントに適切な権限がない

**解決方法**:

```bash
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:SERVICE_ACCOUNT_EMAIL" \
  --role="roles/storage.objectAdmin"
```

### 問題2: コールドスタートが遅すぎる

**原因**: Cloud Storageからのダウンロードに時間がかかっている

**解決方法**:

- SQLiteファイルサイズを確認
- 必要に応じて最小インスタンス数を1に設定（コスト増加）

### 問題3: データが失われる

**原因**: 終了時の同期処理が実行されていない

**解決方法**:

- シグナルハンドラーが正しく実装されているか確認
- ログで同期処理の実行を確認

### 問題4: 変更検知アップロードが動作しない

**原因**: `markAsChanged()`が呼び出されていない

**解決方法**:

- すべてのデータベース操作で`markAsChanged()`を呼び出しているか確認
- ログで変更フラグの状態を確認

### 問題5: 環境変数の検証エラー

**原因**: 必須環境変数が設定されていない

**解決方法**:

- `validateEnvironmentVariables()`のエラーメッセージを確認
- 不足している環境変数を設定

### 問題6: データベースファイルが存在しない

**原因**: 初回起動時やCloud Storageからのダウンロード失敗

**解決方法**:

- Cloud Storageにデータベースファイルが存在するか確認
- 初回起動時は空のデータベースファイルを作成する処理を確認

---

## 参考資料

- [TODO](./todo.md)
- [PRD](../prd.md)
- [技術仕様書](../tech_spec.md)
- [実装計画書](./implementation_plan.md)
- [Helperレビュー](./helper_review.md)
- [Engの技術的回答](../eng_response_to_pdm.md)
- [コスト分析](../eng_cost_analysis_storage_api.md)

---

## 追加の改善推奨事項

### 改善1: ログ出力の標準化

**推奨**:

- 構造化ログの使用（JSON形式）
- ログレベルの設定（DEBUG, INFO, WARN, ERROR）
- Cloud Loggingとの統合

**実装例**:

```typescript
import winston from "winston";

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});
```

### 改善2: テスト手順の追加

**推奨**:

- ユニットテストの追加手順
- 統合テストの追加手順
- モックの使用方法

### 改善3: データベースファイルの存在確認

**推奨**:

- ファイルが存在しない場合の処理を明確化
- 初回起動時の処理を明確化

**実装例**:

```typescript
async function downloadDatabase(): Promise<void> {
  try {
    const [exists] = await bucket.file(GCS_DB_PATH).exists();
    if (!exists) {
      console.log(
        "Database file does not exist in Cloud Storage. Creating new database.",
      );
      return; // 新しいデータベースファイルを作成
    }
    // ... ダウンロード処理
  } catch (error) {
    console.error("Failed to check database existence:", error);
    throw error;
  }
}
```

### 改善4: モニタリング設定手順

**推奨**:

- Cloud Runのモニタリング設定
- アラートの設定手順
- ログの確認方法

### 改善5: ロールバック手順

**推奨**:

- デプロイ失敗時のロールバック手順
- データベースのバックアップと復元手順

---

**最終更新日**: 2025-01-XX
