output "cloud_run_url" {
  description = "Cloud Run Service URL"
  value       = google_cloud_run_service.api.status[0].url
}

output "storage_bucket_name" {
  description = "Cloud Storage Bucket Name"
  value       = google_storage_bucket.db.name
}

output "artifact_registry_repository" {
  description = "Artifact Registry Repository URL"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/daily-report"
}

output "service_account_email" {
  description = "Cloud Run Service Account Email"
  value       = google_service_account.cloud_run.email
}
