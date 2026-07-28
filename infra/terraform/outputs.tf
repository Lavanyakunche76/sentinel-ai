output "alb_dns_name" {
  description = "Public URL for the application (frontend served at root, API at /api/*)"
  value       = aws_lb.main.dns_name
}

output "ecr_backend_repository_url" {
  value = aws_ecr_repository.backend.repository_url
}

output "ecr_frontend_repository_url" {
  value = aws_ecr_repository.frontend.repository_url
}

output "rds_endpoint" {
  value     = aws_db_instance.main.address
  sensitive = true
}
