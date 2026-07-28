# Sentinel AI — AWS Terraform

Provisions a production AWS environment: VPC (2 AZ, public+private subnets, NAT gateway), RDS PostgreSQL, ECR repos, an ECS Fargate cluster running the backend and frontend as separate services, and an ALB that path-routes `/api/*`, `/docs`, `/health` to the backend and everything else to the frontend.

**Not run or validated against a real AWS account** — written carefully, but you must run `terraform validate` / `terraform plan` yourself before applying, and review the plan output for anything that doesn't match your account setup (existing VPCs, naming conflicts, service quotas, etc.).

## Prerequisites

- Terraform >= 1.5
- An AWS account with credentials configured (`aws configure` or environment variables)
- Docker images already built and pushed to the ECR repos this creates (see below — there's a chicken-and-egg step on first apply)

## First-time apply (two-phase, because ECR repos don't exist yet)

```bash
cd infra/terraform
terraform init
terraform apply -target=aws_ecr_repository.backend -target=aws_ecr_repository.frontend
```

Then build and push your images to the repos it just created:

```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

docker build -t sentinel-ai-backend ../../backend
docker tag sentinel-ai-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/sentinel-ai-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/sentinel-ai-backend:latest

docker build -t sentinel-ai-frontend ../../frontend --build-arg NEXT_PUBLIC_API_URL=http://<alb-dns-name-from-later-output>
docker tag sentinel-ai-frontend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/sentinel-ai-frontend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/sentinel-ai-frontend:latest
```

Then provision everything else:

```bash
terraform apply
```

## Cost note

This is not free-tier. Running continuously, expect roughly: NAT gateway (~$32/mo) + RDS db.t4g.micro (~$12/mo) + 2x Fargate tasks x2 services (~$30-50/mo depending on CPU/memory) + ALB (~$16/mo). Destroy when not actively demoing:

```bash
terraform destroy
```

## What's intentionally left out

- HTTPS/ACM certificate (needs a real domain you own)
- Multi-AZ RDS (doubles DB cost — flip `multi_az = true` in `rds.tf` for production HA)
- Auto-scaling policies on the ECS services (add `aws_appautoscaling_target`/`policy` resources if you need them)
- Remote state backend (S3 + DynamoDB lock table) — the commented-out block in `main.tf` shows where to add it for team use
