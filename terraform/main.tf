terraform {
  required_version = ">= 1.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# Cloud Storageバケット（データベースファイル保存用）
resource "google_storage_bucket" "db" {
  name     = "${var.project_id}-daily-report-db"
  location = var.region

  # バージョニングを有効化（データ保護）
  versioning {
    enabled = true
  }

  # 古いバージョンの自動削除（30日後）
  lifecycle_rule {
    condition {
      age = 30
    }
    action {
      type = "Delete"
    }
  }

  # 一律なバケットレベルのアクセス
  uniform_bucket_level_access = true
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

# Cloud RunサービスアカウントにSecret Managerへのアクセス権限を付与
resource "google_project_iam_member" "cloud_run_secret_access" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.cloud_run.email}"
}

# Secret Manager（JWT_SECRET用）
resource "google_secret_manager_secret" "jwt_secret" {
  secret_id = "jwt-secret"

  replication {
    auto {}
  }
}

# Secret Managerのバージョン
resource "google_secret_manager_secret_version" "jwt_secret_version" {
  secret      = google_secret_manager_secret.jwt_secret.id
  secret_data = var.jwt_secret
}

# Artifact Registryリポジトリ
resource "google_artifact_registry_repository" "docker_repo" {
  location      = var.region
  repository_id = "daily-report"
  description   = "Daily Report API Docker repository"
  format        = "DOCKER"
}

# Cloud Runサービス
resource "google_cloud_run_service" "api" {
  name     = "daily-report-api"
  location = var.region

  template {
    spec {
      service_account_name  = google_service_account.cloud_run.email
      container_concurrency = 1

      containers {
        image = "${var.region}-docker.pkg.dev/${var.project_id}/daily-report/daily-report-api:latest"

        ports {
          container_port = 8080
        }

        resources {
          limits = {
            cpu    = "1000m"
            memory = "512Mi"
          }
        }

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
          name  = "BATCH_SIZE"
          value = var.batch_size
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

    metadata {
      annotations = {
        "autoscaling.knative.dev/minScale" = "0"
        "autoscaling.knative.dev/maxScale" = "10"
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

# Cloud Runサービスを公開アクセス可能にする
resource "google_cloud_run_service_iam_member" "public_access" {
  service  = google_cloud_run_service.api.name
  location = google_cloud_run_service.api.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}
