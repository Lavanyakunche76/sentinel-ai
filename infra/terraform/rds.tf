# --------------------------------------------------------------------------
# Secrets — DB password and JWT signing secret, generated once and stored
# in Secrets Manager. ECS tasks pull these at container start, never baked
# into the image or task definition as plaintext.
# --------------------------------------------------------------------------
resource "random_password" "db_password" {
  length  = 24
  special = false
}

resource "random_password" "jwt_secret" {
  length  = 48
  special = false
}

resource "aws_secretsmanager_secret" "db_credentials" {
  name = "${var.project_name}/${var.environment}/db-credentials"
}

resource "aws_secretsmanager_secret_version" "db_credentials" {
  secret_id = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    username = var.db_username
    password = random_password.db_password.result
    dbname   = var.db_name
    host     = aws_db_instance.main.address
    port     = 5432
  })
}

resource "aws_secretsmanager_secret" "jwt_secret" {
  name = "${var.project_name}/${var.environment}/jwt-secret"
}

resource "aws_secretsmanager_secret_version" "jwt_secret" {
  secret_id     = aws_secretsmanager_secret.jwt_secret.id
  secret_string = random_password.jwt_secret.result
}

# --------------------------------------------------------------------------
# RDS
# --------------------------------------------------------------------------
resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db-subnets"
  subnet_ids = aws_subnet.private[*].id
}

resource "aws_security_group" "rds" {
  name        = "${var.project_name}-rds-sg"
  description = "Allow Postgres traffic from ECS tasks only"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_tasks.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_db_instance" "main" {
  identifier             = "${var.project_name}-${var.environment}"
  engine                 = "postgres"
  engine_version         = "16.4"
  instance_class         = var.db_instance_class
  allocated_storage      = 20
  storage_type           = "gp3"
  db_name                = var.db_name
  username               = var.db_username
  password               = random_password.db_password.result
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  backup_retention_period = 7
  multi_az                = false # set true for production HA (doubles cost)
  storage_encrypted       = true
  deletion_protection     = true
  skip_final_snapshot     = false
  final_snapshot_identifier = "${var.project_name}-${var.environment}-final"

  tags = { Name = "${var.project_name}-postgres" }
}
