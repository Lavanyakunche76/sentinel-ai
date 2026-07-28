variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Prefix used for naming all resources"
  type        = string
  default     = "sentinel-ai"
}

variable "environment" {
  description = "Deployment environment name"
  type        = string
  default     = "production"
}

variable "db_name" {
  description = "PostgreSQL database name"
  type        = string
  default     = "sentinel"
}

variable "db_username" {
  description = "PostgreSQL master username"
  type        = string
  default     = "sentinel_admin"
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t4g.micro"
}

variable "backend_image_tag" {
  description = "Docker image tag for the backend service (set by CI on each deploy)"
  type        = string
  default     = "latest"
}

variable "frontend_image_tag" {
  description = "Docker image tag for the frontend service (set by CI on each deploy)"
  type        = string
  default     = "latest"
}

variable "backend_cpu" {
  type    = number
  default = 512
}

variable "backend_memory" {
  type    = number
  default = 1024
}

variable "frontend_cpu" {
  type    = number
  default = 256
}

variable "frontend_memory" {
  type    = number
  default = 512
}

variable "backend_desired_count" {
  type    = number
  default = 2
}

variable "frontend_desired_count" {
  type    = number
  default = 2
}
