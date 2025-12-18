#!/bin/bash

# デプロイメント環境セットアップスクリプト
# このスクリプトは、GCPとGitHub Actionsの環境を自動設定します
#
# 使い方:
#   ./scripts/setup-deployment.sh [オプション]
#
# オプション:
#   --skip-terraform    Terraformの実行をスキップ
#   --skip-github       GitHub Secretsの設定をスキップ
#   --skip-docker       Dockerビルドをスキップ
#   --help              ヘルプを表示

set -e

# オプションの解析
SKIP_TERRAFORM=false
SKIP_GITHUB=false
SKIP_DOCKER=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-terraform)
            SKIP_TERRAFORM=true
            shift
            ;;
        --skip-github)
            SKIP_GITHUB=true
            shift
            ;;
        --skip-docker)
            SKIP_DOCKER=true
            shift
            ;;
        --help)
            echo "デプロイメント環境セットアップスクリプト"
            echo ""
            echo "使い方: $0 [オプション]"
            echo ""
            echo "オプション:"
            echo "  --skip-terraform    Terraformの実行をスキップ"
            echo "  --skip-github       GitHub Secretsの設定をスキップ"
            echo "  --skip-docker       Dockerビルドをスキップ"
            echo "  --help              このヘルプを表示"
            exit 0
            ;;
        *)
            echo "不明なオプション: $1"
            echo "ヘルプを表示するには --help を使用してください"
            exit 1
            ;;
    esac
done

echo "🚀 デプロイメント環境セットアップを開始します"


# 色付き出力
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# エラーハンドリング
error_exit() {
    echo -e "${RED}❌ エラー: $1${NC}" 1>&2
    exit 1
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

step() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# 必要なコマンドの確認
step "前提条件の確認"

command -v gcloud >/dev/null 2>&1 || error_exit "gcloud CLIがインストールされていません。'brew install --cask google-cloud-sdk'でインストールしてください"
success "gcloud CLI: インストール済み"

command -v docker >/dev/null 2>&1 || error_exit "Dockerがインストールされていません"
success "Docker: インストール済み"

if [ "$SKIP_GITHUB" = false ]; then
    command -v gh >/dev/null 2>&1 || error_exit "GitHub CLI (gh)がインストールされていません。'brew install gh'でインストールしてください"
    success "GitHub CLI: インストール済み"
fi

if [ "$SKIP_TERRAFORM" = false ]; then
    if ! command -v terraform >/dev/null 2>&1; then
        info "Terraformがインストールされていません。'brew install terraform'でインストールしてください"
        SKIP_TERRAFORM=true
    else
        success "Terraform: インストール済み"
    fi
fi

# GitHub CLIの認証確認
if [ "$SKIP_GITHUB" = false ]; then
    if ! gh auth status >/dev/null 2>&1; then
        info "GitHub CLIの認証が必要です"
        gh auth login || error_exit "GitHub CLI認証に失敗しました"
    fi
    success "GitHub CLI: 認証済み"
fi

# ======================
# 1. GCPの設定
# ======================

step "ステップ1: GCP設定"

# 現在のプロジェクトを取得
CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null)
if [ -z "$CURRENT_PROJECT" ]; then
    error_exit "GCPプロジェクトが設定されていません。'gcloud config set project PROJECT_ID'を実行してください"
fi

PROJECT_ID="$CURRENT_PROJECT"
success "プロジェクトID: $PROJECT_ID"

# リージョンの設定（デフォルト: asia-northeast1）
read -p "デプロイ先のリージョンを入力してください [asia-northeast1]: " REGION
REGION=${REGION:-asia-northeast1}
success "リージョン: $REGION"

# バケット名の設定
GCS_BUCKET_NAME="${PROJECT_ID}-daily-report-db"
success "Cloud Storageバケット名: $GCS_BUCKET_NAME"

# ======================
# 2. APIの有効化
# ======================

step "ステップ2: 必要なAPIを有効化"

info "以下のAPIを有効化します..."
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  storage.googleapis.com \
  secretmanager.googleapis.com \
  artifactregistry.googleapis.com || error_exit "APIの有効化に失敗しました。プロジェクトの権限を確認してください"

success "APIの有効化が完了しました"

# ======================
# 3. Artifact Registryの作成
# ======================


step "ステップ3: Artifact Registryリポジトリの作成"


# 既存のリポジトリを確認
if gcloud artifacts repositories describe daily-report --location=$REGION >/dev/null 2>&1; then
    info "Artifact Registryリポジトリ 'daily-report' は既に存在します"
else
    info "Artifact Registryリポジトリを作成中..."
    gcloud artifacts repositories create daily-report \
      --repository-format=docker \
      --location=$REGION \
      --description="Daily Report API Docker repository" || error_exit "リポジトリの作成に失敗しました"
    success "Artifact Registryリポジトリを作成しました"
fi

# ======================
# 4. サービスアカウントの作成
# ======================


step "ステップ4: GitHub Actions用サービスアカウントの作成"


SA_NAME="github-actions"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

# 既存のサービスアカウントを確認
if gcloud iam service-accounts describe $SA_EMAIL >/dev/null 2>&1; then
    info "サービスアカウント '$SA_EMAIL' は既に存在します"
else
    info "サービスアカウントを作成中..."
    gcloud iam service-accounts create $SA_NAME \
      --display-name="GitHub Actions Service Account" || error_exit "サービスアカウントの作成に失敗しました"
    success "サービスアカウントを作成しました"
fi

# IAMロールの付与
info "IAMロールを付与中..."
for role in "roles/run.admin" "roles/storage.admin" "roles/secretmanager.admin" "roles/artifactregistry.admin" "roles/iam.serviceAccountUser"; do
    gcloud projects add-iam-policy-binding $PROJECT_ID \
      --member="serviceAccount:$SA_EMAIL" \
      --role="$role" \
      --condition=None >/dev/null 2>&1 || true
done
success "IAMロールの付与が完了しました"

# サービスアカウントキーの作成
KEY_FILE="gcp-sa-key.json"
if [ -f "$KEY_FILE" ]; then
    info "既存のサービスアカウントキー '$KEY_FILE' を使用します"
else
    info "サービスアカウントキーを作成中..."
    gcloud iam service-accounts keys create $KEY_FILE \
      --iam-account=$SA_EMAIL || error_exit "サービスアカウントキーの作成に失敗しました"
    success "サービスアカウントキーを作成しました: $KEY_FILE"
fi

# ======================
# 5. JWT_SECRETの作成
# ======================


step "ステップ5: JWT_SECRETの作成"


# ランダムなJWT_SECRETを生成
JWT_SECRET=$(openssl rand -base64 32)
success "JWT_SECRETを生成しました"

# Secret Managerに保存
if gcloud secrets describe jwt-secret >/dev/null 2>&1; then
    info "Secret 'jwt-secret' は既に存在します。新しいバージョンを追加します"
    echo -n "$JWT_SECRET" | gcloud secrets versions add jwt-secret --data-file=- >/dev/null
else
    info "Secret Managerにjwt-secretを作成中..."
    echo -n "$JWT_SECRET" | gcloud secrets create jwt-secret --data-file=- --replication-policy="automatic" >/dev/null
fi
success "JWT_SECRETをSecret Managerに保存しました"

# ======================
# 6. Terraformの実行
# ======================


step "ステップ6: Terraformでインフラを作成"


# Terraformのインストール確認
if ! command -v terraform >/dev/null 2>&1; then
    info "Terraformがインストールされていません。スキップします"
    info "手動でTerraformを実行する場合は、'cd terraform && terraform init && terraform apply'を実行してください"
else
    # Terraform用の認証設定
    info "Terraform用の認証を設定します..."
    info "ブラウザで認証を完了してください"
    if ! gcloud auth application-default print-access-token >/dev/null 2>&1; then
        echo ""
        echo "以下のコマンドを別のターミナルで実行してください:"
        echo "  gcloud auth application-default login"
        echo ""
        read -p "認証が完了したらEnterキーを押してください..."
    fi

    read -p "Terraformでインフラを作成しますか？ (y/n) [y]: " RUN_TERRAFORM
    RUN_TERRAFORM=${RUN_TERRAFORM:-y}

    if [ "$RUN_TERRAFORM" = "y" ]; then
        # Dockerイメージのビルドとプッシュ（Cloud Runサービス作成に必要）
        info "Dockerイメージをビルドしてプッシュします..."

        # Docker認証
        gcloud auth configure-docker ${REGION}-docker.pkg.dev || error_exit "Docker認証に失敗しました"

        # イメージのビルドとプッシュ
        IMAGE_TAG="${REGION}-docker.pkg.dev/${PROJECT_ID}/daily-report/daily-report-api:latest"
        info "Dockerイメージをビルド中: $IMAGE_TAG"

        docker build --platform linux/amd64 -f apps/api/Dockerfile -t "$IMAGE_TAG" . || error_exit "Dockerビルドに失敗しました"
        success "Dockerイメージのビルドが完了しました"

        info "Artifact Registryにプッシュ中..."
        docker push "$IMAGE_TAG" || error_exit "Dockerプッシュに失敗しました"
        success "Dockerイメージをプッシュしました"

        cd terraform

        # terraform.tfvarsの作成
        cat > terraform.tfvars <<EOF
project_id  = "$PROJECT_ID"
region      = "$REGION"
cors_origin = "https://USERNAME.github.io"
jwt_secret  = "$JWT_SECRET"
batch_size  = "10"
EOF

        info "GitHubのユーザー名を入力してください（CORS設定用）:"
        read -p "GitHub Username: " GITHUB_USERNAME
        sed -i.bak "s/USERNAME/$GITHUB_USERNAME/g" terraform.tfvars
        rm terraform.tfvars.bak

        info "Terraformを初期化中..."
        terraform init || error_exit "Terraform initに失敗しました"

        # 既存リソースのインポート
        info "既存リソースをインポート中..."

        # Secret Managerのインポート
        if gcloud secrets describe jwt-secret >/dev/null 2>&1; then
            terraform import google_secret_manager_secret.jwt_secret projects/$PROJECT_ID/secrets/jwt-secret 2>/dev/null || true
        fi

        # Artifact Registryのインポート
        if gcloud artifacts repositories describe daily-report --location=$REGION >/dev/null 2>&1; then
            terraform import google_artifact_registry_repository.docker_repo projects/$PROJECT_ID/locations/$REGION/repositories/daily-report 2>/dev/null || true
        fi

        # Cloud Storageバケットのインポート
        if gsutil ls -b gs://${PROJECT_ID}-daily-report-db >/dev/null 2>&1; then
            terraform import google_storage_bucket.db ${PROJECT_ID}-daily-report-db 2>/dev/null || true
        fi

        # サービスアカウントのインポート
        if gcloud iam service-accounts describe cloud-run-api@${PROJECT_ID}.iam.gserviceaccount.com >/dev/null 2>&1; then
            terraform import google_service_account.cloud_run projects/$PROJECT_ID/serviceAccounts/cloud-run-api@${PROJECT_ID}.iam.gserviceaccount.com 2>/dev/null || true
        fi

        info "Terraformでインフラを作成中..."
        terraform apply -auto-approve || error_exit "Terraform applyに失敗しました"

        # Cloud Run URLを取得
        API_URL=$(terraform output -raw cloud_run_url 2>/dev/null || echo "")

        cd ..
        success "Terraformでインフラを作成しました"
    fi
fi

# Cloud Run URLが取得できなかった場合の代替
if [ -z "$API_URL" ]; then
    API_URL="https://daily-report-api-XXXXX-an.a.run.app"
    info "Cloud Run URLは後で設定してください: $API_URL"
fi

# ======================
# 7. GitHub Secretsの設定
# ======================

if [ "$SKIP_GITHUB" = false ]; then
    step "ステップ7: GitHub Secretsの設定"

    # リポジトリ情報の取得
    REPO_INFO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null)
    if [ -z "$REPO_INFO" ]; then
        error_exit "GitHubリポジトリ情報の取得に失敗しました。リポジトリのルートディレクトリで実行してください"
    fi

    success "リポジトリ: $REPO_INFO"

    # GitHub Secretsを設定
    info "GitHub Secretsを設定中..."

    gh secret set GCP_SA_KEY < $KEY_FILE || error_exit "GCP_SA_KEYの設定に失敗しました"
    success "GCP_SA_KEY を設定しました"

    gh secret set GCP_PROJECT_ID -b "$PROJECT_ID" || error_exit "GCP_PROJECT_IDの設定に失敗しました"
    success "GCP_PROJECT_ID を設定しました"

    gh secret set GCP_REGION -b "$REGION" || error_exit "GCP_REGIONの設定に失敗しました"
    success "GCP_REGION を設定しました"

    gh secret set GCS_BUCKET_NAME -b "$GCS_BUCKET_NAME" || error_exit "GCS_BUCKET_NAMEの設定に失敗しました"
    success "GCS_BUCKET_NAME を設定しました"

    gh secret set API_URL -b "$API_URL/api" || error_exit "API_URLの設定に失敗しました"
    success "API_URL を設定しました"

    # GitHubユーザー名の取得
    GITHUB_USERNAME=$(gh api user -q .login)
    CORS_ORIGIN="https://${GITHUB_USERNAME}.github.io"

    gh secret set CORS_ORIGIN -b "$CORS_ORIGIN" || error_exit "CORS_ORIGINの設定に失敗しました"
    success "CORS_ORIGIN を設定しました"

    gh secret set BATCH_SIZE -b "10" || error_exit "BATCH_SIZEの設定に失敗しました"
    success "BATCH_SIZE を設定しました"

    # BASE_HREFの設定（リポジトリ名から自動生成）
    REPO_NAME=$(gh repo view --json name -q .name)
    BASE_HREF="/${REPO_NAME}/"

    gh secret set BASE_HREF -b "$BASE_HREF" || error_exit "BASE_HREFの設定に失敗しました"
    success "BASE_HREF を設定しました"
else
    info "GitHub Secretsの設定をスキップしました"
    REPO_INFO="N/A"
fi

# ======================
# 8. 完了
# ======================

echo ""
echo "=========================================="
echo "🎉 セットアップが完了しました！"
echo "=========================================="
echo ""
echo "📝 設定内容:"
echo "  - プロジェクトID: $PROJECT_ID"
echo "  - リージョン: $REGION"
echo "  - バケット名: $GCS_BUCKET_NAME"
echo "  - API URL: $API_URL/api"
echo "  - CORS Origin: $CORS_ORIGIN"
echo "  - BASE_HREF: $BASE_HREF"
echo ""
echo "🔐 サービスアカウントキー: $KEY_FILE"
echo "   ⚠️  このファイルは機密情報です。安全に保管してください"
echo ""
echo "📦 次のステップ:"
echo "  1. コードをコミット: git add . && git commit -m 'feat: デプロイ設定'"
echo "  2. mainブランチにプッシュ: git push origin main"
echo "  3. GitHub Actionsが自動的にデプロイを開始します"
echo ""
echo "🔗 確認:"
echo "  - GitHub Actions: https://github.com/$REPO_INFO/actions"
echo "  - Cloud Run: https://console.cloud.google.com/run?project=$PROJECT_ID"
echo "  - フロントエンド: $CORS_ORIGIN"
echo ""

