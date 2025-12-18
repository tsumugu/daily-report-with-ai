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

variable "batch_size" {
  description = "Batch size for database sync"
  type        = string
  default     = "10"
}
