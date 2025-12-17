# デプロイ方式決定書

**作成日**: 2025-01-XX  
**作成者**: Eng  
**目的**: 要件に基づいた最適なデプロイ方式の論理的導出

---

## 📋 要件整理

### 必須要件

1. **SQLiteのデータが飛ばないこと（APIサーバとは別に管理）**
   - SQLiteファイルは永続化ストレージに保存
   - APIコンテナ/サーバーとは独立したストレージ管理
   - デプロイ時にデータが失われないこと

2. **CI/CDを適切に構築できること**
   - GitHubでmasterにマージしたら自動的にFE, BEともにデプロイ
   - GitHub Actionsを使用可能

3. **従量課金制であること**
   - 月額固定のVPSは不可
   - 有料プランへの加入が必要なSaaSは不可
   - 使用量に応じた従量課金のみ

4. **IaaSなどメンテナンスが容易かつ、インフラ構成を資産として管理できること**
   - Infrastructure as Code（Terraform、CloudFormation等）が使用可能
   - メンテナンスが容易
   - 構成のバージョン管理が可能

---

## 🔍 要件分析

### 要件1: SQLiteデータの永続化と分離

**技術的制約**:

- SQLiteはファイルベースのデータベース
- ファイルは永続化ストレージに保存する必要がある
- APIコンテナ/サーバーとは独立したストレージが必要

**解決策候補**:

- **AWS EFS**: マネージドNFS、ECS Fargateにマウント可能、従量課金
- **AWS EBS**: ブロックストレージ、ECS Fargateにアタッチ可能、従量課金
- **GCP Cloud Storage FUSE**: ファイルシステムとしてマウント可能、従量課金
- **Azure Files**: SMB/NFS共有、Container Instancesにマウント可能、従量課金
- **Docker Volume**: ローカルストレージ、永続化はホスト依存

**評価**:

- ✅ AWS EFS: マネージド、スケーラブル、従量課金、マウント容易
- ✅ GCP Cloud Storage FUSE: マネージド、スケーラブル、従量課金
- ✅ Azure Files: マネージド、スケーラブル、従量課金
- ❌ Docker Volume: ホスト依存、スケーリング困難

### 要件2: CI/CDの構築

**技術的制約**:

- GitHub Actionsを使用
- masterブランチへのマージで自動デプロイ
- FE, BEの両方をデプロイ

**解決策候補**:

- **GitHub Actions + AWS CLI**: ECS/Cloud Run等へのデプロイ
- **GitHub Actions + Terraform**: インフラのプロビジョニングとデプロイ
- **GitHub Actions + 各クラウドSDK**: プラットフォーム固有のデプロイ

**評価**:

- ✅ すべてのIaaSプラットフォームでGitHub Actionsが使用可能
- ✅ Terraformを使用することで、インフラ構成をコード化可能

### 要件3: 従量課金制

**制約**:

- 月額固定のVPSは不可
- 有料プランへの加入が必要なSaaSは不可

**除外されるサービス**:

- ❌ 月額VPS（DigitalOcean Droplets、Linode等）
- ❌ Vercel Pro（有料プラン必要）
- ❌ Netlify Pro（有料プラン必要）
- ❌ Railway（有料プラン必要）
- ❌ Render（有料プラン必要）

**利用可能なサービス**:

- ✅ AWS（従量課金、無料枠あり）
- ✅ GCP（従量課金、無料枠あり）
- ✅ Azure（従量課金、無料枠あり）
- ✅ GitHub Pages（無料、静的ホスティング）

### 要件4: IaaSとInfrastructure as Code

**技術的制約**:

- Infrastructure as Codeが使用可能
- メンテナンスが容易
- 構成のバージョン管理が可能

**解決策候補**:

- **AWS + Terraform**: 成熟したエコシステム、豊富なリソース
- **GCP + Terraform**: 成熟したエコシステム、コスト効率が良い
- **Azure + Terraform**: 成熟したエコシステム、エンタープライズ向け

**評価**:

- ✅ すべての主要クラウドプロバイダーでTerraformが使用可能
- ✅ CloudFormation（AWS）、Deployment Manager（GCP）も選択肢

---

## 🎯 最適解の導出

### 候補1: AWS構成

#### 構成

- **フロントエンド**: GitHub Pages（無料）または AWS S3 + CloudFront（従量課金）
- **バックエンド**: AWS ECS Fargate（従量課金）
- **データベース**: AWS EFS（従量課金、ECS Fargateにマウント）
- **CI/CD**: GitHub Actions + AWS CLI/Terraform

#### 評価

**メリット**:

- ✅ EFSはマネージドNFS、スケーラブル
- ✅ ECS Fargateはサーバーレス、従量課金
- ✅ Terraformでインフラ構成をコード化可能
- ✅ GitHub Actionsで自動デプロイ可能
- ✅ 無料枠あり（最初の12ヶ月）

**デメリット**:

- ⚠️ AWSの学習コスト
- ⚠️ コスト管理が必要

**コスト見積もり（月間）**:

- ECS Fargate: 0.25 vCPU + 0.5GB RAM = 約$10-15（使用量による）
- EFS: 10GB = 約$3
- S3 + CloudFront: 10GB転送 = 約$1-2
- **合計**: 約$15-20/月（小規模利用の場合）

---

### 候補2: GCP構成

#### 構成

- **フロントエンド**: GitHub Pages（無料）または GCP Cloud Storage + Cloud CDN（従量課金）
- **バックエンド**: GCP Cloud Run（従量課金）
- **データベース**: GCP Cloud Storage FUSE（従量課金、Cloud Runにマウント）
- **CI/CD**: GitHub Actions + gcloud CLI/Terraform

#### 評価

**メリット**:

- ✅ Cloud Runはサーバーレス、従量課金、スケーリング自動
- ✅ Cloud Storage FUSEでファイルシステムとしてマウント可能
- ✅ Terraformでインフラ構成をコード化可能
- ✅ GitHub Actionsで自動デプロイ可能
- ✅ 無料枠あり（最初の12ヶ月）
- ✅ コスト効率が良い

**デメリット**:

- ⚠️ Cloud Storage FUSEのパフォーマンス（SQLiteには適している）
- ⚠️ GCPの学習コスト

**コスト見積もり（月間）**:

- Cloud Run: 100万リクエスト = 約$0.40
- Cloud Storage: 10GB = 約$0.20
- Cloud CDN: 10GB転送 = 約$1
- **合計**: 約$2-5/月（小規模利用の場合）

---

### 候補3: Azure構成

#### 構成

- **フロントエンド**: GitHub Pages（無料）または Azure Static Web Apps（無料枠あり）
- **バックエンド**: Azure Container Instances（従量課金）
- **データベース**: Azure Files（従量課金、Container Instancesにマウント）
- **CI/CD**: GitHub Actions + Azure CLI/Terraform

#### 評価

**メリット**:

- ✅ Container Instancesはサーバーレス、従量課金
- ✅ Azure Filesでファイル共有可能
- ✅ Terraformでインフラ構成をコード化可能
- ✅ GitHub Actionsで自動デプロイ可能
- ✅ 無料枠あり（最初の12ヶ月）

**デメリット**:

- ⚠️ Azureの学習コスト
- ⚠️ Container Instancesのスケーリング制限

**コスト見積もり（月間）**:

- Container Instances: 0.5 vCPU + 1GB RAM = 約$15-20
- Azure Files: 10GB = 約$2
- Static Web Apps: 無料枠あり
- **合計**: 約$17-22/月（小規模利用の場合）

---

## ✅ 最終決定: GCP構成（推奨）

### 決定理

1. **コスト効率**: GCPが最もコスト効率が良い（特にCloud Run）
2. **SQLiteとの相性**: Cloud Storage FUSEはSQLiteファイルの保存に適している
3. **スケーラビリティ**: Cloud Runは自動スケーリング、リクエスト数に応じた従量課金
4. **メンテナンス性**: Terraformでインフラ構成をコード化可能
5. **CI/CD**: GitHub Actionsで自動デプロイ可能
6. **データ永続化**: Cloud Storage FUSEでAPIコンテナとは独立したストレージ管理

### 構成詳細

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

### コンポーネント説明

#### フロントエンド: GitHub Pages

**理由**:

- ✅ 完全無料
- ✅ GitHub Actionsと統合が容易
- ✅ 静的ファイルのホスティングに最適
- ✅ CDN配信（GitHub CDN）

**デプロイ方法**:

- GitHub Actionsでビルド
- `gh-pages`ブランチにプッシュ
- 自動的にデプロイ

#### バックエンド: GCP Cloud Run

**理由**:

- ✅ サーバーレス、従量課金
- ✅ 自動スケーリング
- ✅ コンテナベース、Dockerfileで管理
- ✅ Cloud Storage FUSEでマウント可能

**デプロイ方法**:

- GitHub ActionsでDockerイメージをビルド
- Container Registryにプッシュ
- Cloud Runにデプロイ

#### データベース: GCP Cloud Storage + FUSE

**理由**:

- ✅ 従量課金、低コスト
- ✅ 高可用性、耐久性
- ✅ Cloud RunにFUSEでマウント可能
- ✅ APIコンテナとは独立したストレージ管理
- ✅ バックアップが容易（Cloud Storageのスナップショット）

**設定**:

- Cloud Storageバケットを作成
- Cloud RunにFUSEマウント設定
- `DB_PATH=/mnt/gcs/daily-report.db` を設定

---

## 📋 実装手順

### 1. インフラ構成（Terraform）

```hcl
# terraform/main.tf
resource "google_storage_bucket" "db" {
  name     = "daily-report-db"
  location = "asia-northeast1"
}

resource "google_cloud_run_service" "api" {
  name     = "daily-report-api"
  location = "asia-northeast1"

  template {
    spec {
      containers {
        image = "gcr.io/PROJECT_ID/daily-report-api:latest"

        env {
          name  = "DB_PATH"
          value = "/mnt/gcs/daily-report.db"
        }

        volume_mounts {
          name       = "gcs-fuse"
          mount_path = "/mnt/gcs"
        }
      }

      volumes {
        name = "gcs-fuse"
        csi {
          driver = "gcsfuse.csi.storage.gke.io"
          volume_attributes = {
            bucketName = google_storage_bucket.db.name
          }
        }
      }
    }
  }
}
```

### 2. CI/CDパイプライン（GitHub Actions）

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [master]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build Frontend
        run: |
          cd apps/web
          npm ci
          API_URL=${{ secrets.API_URL }} npm run build
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./apps/web/dist/web

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup GCP
        uses: google-github-actions/setup-gcloud@v1
        with:
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          project_id: ${{ secrets.GCP_PROJECT_ID }}
      - name: Build and Push Docker Image
        run: |
          docker build -f apps/api/Dockerfile -t gcr.io/${{ secrets.GCP_PROJECT_ID }}/daily-report-api:${{ github.sha }} .
          docker push gcr.io/${{ secrets.GCP_PROJECT_ID }}/daily-report-api:${{ github.sha }}
      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy daily-report-api \
            --image gcr.io/${{ secrets.GCP_PROJECT_ID }}/daily-report-api:${{ github.sha }} \
            --region asia-northeast1 \
            --platform managed
```

### 3. 環境変数設定

**GitHub Secrets**:

- `GCP_SA_KEY`: GCPサービスアカウントキー（JSON）
- `GCP_PROJECT_ID`: GCPプロジェクトID
- `API_URL`: 本番APIのURL

**Cloud Run環境変数**:

- `JWT_SECRET`: JWT秘密鍵
- `DB_PATH`: `/mnt/gcs/daily-report.db`
- `CORS_ORIGIN`: フロントエンドのURL
- `NODE_ENV`: `production`

---

## 🔄 代替案

### 代替案1: AWS構成（GCPが利用できない場合）

**構成**:

- フロントエンド: GitHub Pages
- バックエンド: AWS ECS Fargate
- データベース: AWS EFS

**理由**:

- EFSはマネージドNFS、スケーラブル
- ECS Fargateはサーバーレス、従量課金
- Terraformで管理可能

**コスト**: 約$15-20/月（小規模利用）

### 代替案2: ハイブリッド構成（コスト最適化）

**構成**:

- フロントエンド: GitHub Pages（無料）
- バックエンド: GCP Cloud Run（従量課金）
- データベース: GCP Cloud Storage（従量課金）

**理由**:

- フロントエンドは無料
- バックエンドは最小限のコスト
- データベースは低コスト

**コスト**: 約$2-5/月（小規模利用）

---

## 📊 比較表

| 項目                 | GCP構成              | AWS構成              | Azure構成            |
| :------------------- | :------------------- | :------------------- | :------------------- |
| **フロントエンド**   | GitHub Pages（無料） | GitHub Pages（無料） | GitHub Pages（無料） |
| **バックエンド**     | Cloud Run            | ECS Fargate          | Container Instances  |
| **データベース**     | Cloud Storage FUSE   | EFS                  | Azure Files          |
| **コスト（月間）**   | $2-5                 | $15-20               | $17-22               |
| **スケーラビリティ** | ⭐⭐⭐⭐⭐           | ⭐⭐⭐⭐             | ⭐⭐⭐               |
| **メンテナンス性**   | ⭐⭐⭐⭐⭐           | ⭐⭐⭐⭐             | ⭐⭐⭐⭐             |
| **学習コスト**       | 中                   | 高                   | 中                   |

---

## ✅ 結論

**推奨構成: GCP構成**

1. **コスト効率**: 最も低コスト（$2-5/月）
2. **要件適合**: すべての要件を満たす
3. **スケーラビリティ**: Cloud Runの自動スケーリング
4. **メンテナンス性**: Terraformでインフラ構成をコード化
5. **CI/CD**: GitHub Actionsで自動デプロイ可能
6. **データ永続化**: Cloud Storage FUSEで独立したストレージ管理

---

**最終更新日**: 2025-01-XX
