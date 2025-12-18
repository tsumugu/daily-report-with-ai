#!/bin/bash

# 既存のGCPリソースをTerraformにインポートするスクリプト
# すでにGCPコンソールや手動で作成したリソースをTerraformで管理できるようにします

set -e

# 色付き出力
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# プロジェクトIDの取得
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT_ID" ]; then
    echo "❌ GCPプロジェクトが設定されていません"
    exit 1
fi

# リージョンの設定（terraform.tfvarsから取得、またはデフォルト）
REGION="asia-northeast1"
if [ -f "terraform/terraform.tfvars" ]; then
    REGION=$(grep "^region" terraform/terraform.tfvars | cut -d'"' -f2)
fi

echo "🔄 既存リソースのインポート開始"
echo "  プロジェクト: $PROJECT_ID"
echo "  リージョン: $REGION"
echo ""

cd terraform

# 1. Cloud Storageバケット
info "Cloud Storageバケットのインポート..."
BUCKET_NAME="${PROJECT_ID}-daily-report-db"
if gsutil ls -b gs://$BUCKET_NAME >/dev/null 2>&1; then
    terraform import google_storage_bucket.db $BUCKET_NAME 2>/dev/null || true
    success "Cloud Storageバケットをインポートしました"
else
    info "Cloud Storageバケットが存在しません。スキップします"
fi

# 2. Secret Manager
info "Secret Managerのインポート..."
if gcloud secrets describe jwt-secret >/dev/null 2>&1; then
    terraform import google_secret_manager_secret.jwt_secret projects/$PROJECT_ID/secrets/jwt-secret 2>/dev/null || true
    success "Secret Managerをインポートしました"

    # Secret Versionもインポート（最新バージョン）
    LATEST_VERSION=$(gcloud secrets versions list jwt-secret --limit=1 --format="value(name)" 2>/dev/null)
    if [ -n "$LATEST_VERSION" ]; then
        terraform import google_secret_manager_secret_version.jwt_secret_version projects/$PROJECT_ID/secrets/jwt-secret/versions/$LATEST_VERSION 2>/dev/null || true
        success "Secret Versionをインポートしました"
    fi
else
    info "Secret Managerが存在しません。スキップします"
fi

# 3. Artifact Registry
info "Artifact Registryのインポート..."
if gcloud artifacts repositories describe daily-report --location=$REGION >/dev/null 2>&1; then
    terraform import google_artifact_registry_repository.docker_repo projects/$PROJECT_ID/locations/$REGION/repositories/daily-report 2>/dev/null || true
    success "Artifact Registryをインポートしました"
else
    info "Artifact Registryが存在しません。スキップします"
fi

# 4. Cloud Runサービスアカウント
info "Cloud Runサービスアカウントのインポート..."
SA_EMAIL="cloud-run-api@${PROJECT_ID}.iam.gserviceaccount.com"
if gcloud iam service-accounts describe $SA_EMAIL >/dev/null 2>&1; then
    terraform import google_service_account.cloud_run projects/$PROJECT_ID/serviceAccounts/$SA_EMAIL 2>/dev/null || true
    success "Cloud Runサービスアカウントをインポートしました"
else
    info "Cloud Runサービスアカウントが存在しません。スキップします"
fi

# 5. Cloud Runサービス
info "Cloud Runサービスのインポート..."
if gcloud run services describe daily-report-api --region=$REGION >/dev/null 2>&1; then
    terraform import google_cloud_run_service.api projects/$PROJECT_ID/locations/$REGION/services/daily-report-api 2>/dev/null || true
    success "Cloud Runサービスをインポートしました"
else
    info "Cloud Runサービスが存在しません。スキップします"
fi

# 6. IAMポリシーバインディング（個別にインポートする必要がある）
info "IAMポリシーバインディングのインポート..."

# Storage Admin
terraform import google_project_iam_member.cloud_run_storage_access "$PROJECT_ID roles/storage.objectAdmin serviceAccount:$SA_EMAIL" 2>/dev/null || true

# Secret Manager Accessor
terraform import google_project_iam_member.cloud_run_secret_access "$PROJECT_ID roles/secretmanager.secretAccessor serviceAccount:$SA_EMAIL" 2>/dev/null || true

success "IAMポリシーバインディングをインポートしました"

# 7. Cloud Run IAM（Public Access）
info "Cloud Run IAM（Public Access）のインポート..."
if gcloud run services get-iam-policy daily-report-api --region=$REGION --format=json | grep -q "allUsers" 2>/dev/null; then
    terraform import google_cloud_run_service_iam_member.public_access "projects/$PROJECT_ID/locations/$REGION/services/daily-report-api roles/run.invoker allUsers" 2>/dev/null || true
    success "Cloud Run IAMをインポートしました"
else
    info "Cloud Run Public Accessが存在しません。スキップします"
fi

cd ..

echo ""
echo "=========================================="
echo "🎉 インポートが完了しました！"
echo "=========================================="
echo ""
echo "次のステップ:"
echo "  1. terraform plan を実行して差分を確認"
echo "  2. terraform apply を実行してリソースを更新"
echo ""
