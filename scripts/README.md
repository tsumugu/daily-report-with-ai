# デプロイメントセットアップスクリプト

Daily ReportアプリケーションをGCP（Google Cloud Platform）とGitHub Pagesにデプロイするための環境を**完全自動で**セットアップします。

## ✨ 特徴

- 🚀 **ワンコマンドセットアップ**: すべての設定を1つのスクリプトで完了
- 🔐 **自動認証**: GitHub Secrets、サービスアカウント、JWT_SECRETを自動生成・設定
- 🐳 **Dockerビルド統合**: イメージのビルドとプッシュも自動実行
- 🏗️ **Terraformサポート**: インフラ構築もオプションで可能
- 📋 **柔軟なオプション**: 必要な部分だけを実行可能

## 前提条件

以下のツールがインストールされている必要があります：

- **gcloud CLI** - Google Cloud SDK（必須）
- **Docker** - コンテナビルド（必須）
- **gh CLI** - GitHub CLI（必須）
- **terraform** - インフラ管理（オプション）

### インストール方法

```bash
# macOS (Homebrew)
brew install --cask google-cloud-sdk
brew install gh
brew install terraform  # オプション
```

## 使い方

### 基本的な使い方

```bash
# 1. GCPの認証
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# 2. Terraform用の認証（別ターミナルで）
gcloud auth application-default login

# 3. スクリプトの実行（プロジェクトのルートディレクトリで）
./scripts/setup-deployment.sh
```

### オプション付き実行

```bash
# Terraformをスキップ（手動でインフラ作成する場合）
./scripts/setup-deployment.sh --skip-terraform

# GitHub Secretsの設定をスキップ
./scripts/setup-deployment.sh --skip-github

# Dockerビルドをスキップ（既にイメージがある場合）
./scripts/setup-deployment.sh --skip-docker

# ヘルプを表示
./scripts/setup-deployment.sh --help
```

## スクリプトが実行する内容

### 1. 前提条件の確認

- gcloud CLI、Docker、GitHub CLI、Terraformのインストール確認
- 各ツールの認証状態確認

### 2. GCP設定

- プロジェクトIDの取得
- デプロイ先リージョンの設定
- Cloud Storageバケット名の自動生成

### 3. APIの有効化

以下のGCP APIを有効化：

- Cloud Build API
- Cloud Run API
- Cloud Storage API
- Secret Manager API
- Artifact Registry API

### 4. Artifact Registryの作成

Dockerイメージを保存するためのリポジトリを作成

### 5. サービスアカウントの作成

GitHub Actions用のサービスアカウントを作成し、必要な権限を自動付与：

- Cloud Run Admin
- Storage Admin
- Secret Manager Admin
- Artifact Registry Admin
- Service Account User

### 6. JWT_SECRETの生成と保存

- ランダムな32文字のJWT_SECRETを自動生成
- GCP Secret Managerに自動保存

### 7. Dockerイメージのビルドとプッシュ

- APIのDockerイメージをビルド
- Artifact Registryに自動プッシュ
- Cloud Runサービス作成の準備

### 8. Terraformでインフラ作成（オプション）

以下のリソースを自動作成：

- Cloud Storageバケット
- Cloud Runサービス
- IAM設定
- Secret Manager設定

### 9. GitHub Secretsの設定

以下のSecretsを自動設定：

- `GCP_SA_KEY` - サービスアカウントキー
- `GCP_PROJECT_ID` - GCPプロジェクトID
- `GCP_REGION` - デプロイ先リージョン
- `GCS_BUCKET_NAME` - Cloud Storageバケット名
- `API_URL` - バックエンドAPIのURL
- `CORS_ORIGIN` - フロントエンドのURL
- `BASE_HREF` - Angularのbase href
- `BATCH_SIZE` - データベース同期のバッチサイズ

## セットアップ後

スクリプトが正常に完了したら：

```bash
# 1. 変更をコミット
git add .
git commit -m "feat: デプロイ設定の追加"

# 2. mainブランチにプッシュ
git push origin main
```

GitHub Actionsが自動的にビルドとデプロイを開始します。

## 確認

### GitHub Actions

デプロイの進行状況を確認：

```
https://github.com/YOUR_USERNAME/YOUR_REPO/actions
```

### Cloud Run

デプロイされたバックエンドAPI：

```
https://console.cloud.google.com/run?project=YOUR_PROJECT_ID
```

### フロントエンド

デプロイされたWebアプリケーション：

```
https://YOUR_USERNAME.github.io/YOUR_REPO/
```

## トラブルシューティング

### 権限エラー

```
ERROR: Permission denied to enable service
```

**解決方法：**

1. GCPコンソールで「IAMと管理」→「IAM」を開く
2. 自分のアカウントに `Editor` または `Owner` ロールを付与

### Terraform認証エラー

```
ERROR: could not find default credentials
```

**解決方法：**

```bash
gcloud auth application-default login
```

### Dockerビルドエラー

```
ERROR: Dockerビルドに失敗しました
```

**解決方法：**

1. Dockerデーモンが起動しているか確認
2. プロジェクトのルートディレクトリで実行しているか確認

## 手動実行

スクリプトを使わずに手動で設定したい場合は、[implementation_plan.md](../docs/features/deployment/implement/implementation_plan.md)を参照してください。

## その他のスクリプト

### 既存リソースのインポート

既にGCPコンソールで作成したリソースをTerraformで管理したい場合：

```bash
./scripts/import-existing-resources.sh
```

## サポート

問題が発生した場合は、以下のドキュメントを確認してください：

- [実装計画書](../docs/features/deployment/implement/implementation_plan.md)
- [技術仕様書](../docs/features/deployment/tech_spec.md)
- [PRD](../docs/features/deployment/prd.md)
