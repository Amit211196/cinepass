#!/bin/bash

# CinePass Database Setup Script
# Creates RDS PostgreSQL instance on AWS

set -e

echo "============================================"
echo "CinePass Database Setup Script"
echo "============================================"
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

if ! command -v aws &> /dev/null; then
    echo -e "${RED}AWS CLI not found. Install from https://aws.amazon.com/cli/${NC}"
    exit 1
fi

echo -e "${GREEN}AWS CLI found${NC}"
echo ""

# Get user input
echo -e "${YELLOW}Enter database configuration:${NC}"
read -p "Database instance identifier (default: cinepass-db): " DB_INSTANCE_ID
DB_INSTANCE_ID=${DB_INSTANCE_ID:-cinepass-db}

read -p "Master username (default: cinepassadmin): " DB_USER
DB_USER=${DB_USER:-cinepassadmin}

read -sp "Master password (min 8 characters): " DB_PASSWORD
echo ""

read -p "Allocated storage in GB (default: 20, free tier max): " STORAGE
STORAGE=${STORAGE:-20}

read -p "Region (default: us-east-1): " REGION
REGION=${REGION:-us-east-1}

echo ""

# Create RDS instance
echo -e "${YELLOW}Creating RDS PostgreSQL instance...${NC}"
echo "Instance ID: $DB_INSTANCE_ID"
echo "Username: $DB_USER"
echo "Region: $REGION"
echo ""

aws rds create-db-instance \
    --db-instance-identifier "$DB_INSTANCE_ID" \
    --db-instance-class db.t3.micro \
    --engine postgres \
    --engine-version 15.3 \
    --master-username "$DB_USER" \
    --master-user-password "$DB_PASSWORD" \
    --allocated-storage "$STORAGE" \
    --publicly-accessible true \
    --storage-type gp2 \
    --region "$REGION" \
    --no-multi-az \
    --backup-retention-period 1 \
    --storage-encrypted false

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Database instance creation initiated${NC}"
else
    echo -e "${RED}Failed to create database instance${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Waiting for database to be available (this may take 5-10 minutes)...${NC}"

# Wait for database to be available
aws rds wait db-instance-available \
    --db-instance-identifier "$DB_INSTANCE_ID" \
    --region "$REGION"

echo -e "${GREEN}Database is now available!${NC}"
echo ""

# Get database endpoint
echo -e "${YELLOW}Retrieving database endpoint...${NC}"

ENDPOINT=$(aws rds describe-db-instances \
    --db-instance-identifier "$DB_INSTANCE_ID" \
    --region "$REGION" \
    --query 'DBInstances[0].Endpoint.Address' \
    --output text)

echo -e "${GREEN}Database Endpoint: ${YELLOW}$ENDPOINT${NC}"
echo ""

# Display configuration
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}Database Created Successfully!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "Configuration Details:"
echo "======================"
echo "Instance ID:  $DB_INSTANCE_ID"
echo "Engine:       PostgreSQL 15.3"
echo "Class:        db.t3.micro (free tier)"
echo "Storage:      ${STORAGE}GB"
echo "Endpoint:     $ENDPOINT"
echo "Port:         5432"
echo "Username:     $DB_USER"
echo ""
echo "Spring Boot Configuration:"
echo "=========================="
echo "spring.datasource.url=jdbc:postgresql://$ENDPOINT:5432/cinepass"
echo "spring.datasource.username=$DB_USER"
echo "spring.datasource.password=[your password]"
echo "spring.datasource.driver-class-name=org.postgresql.Driver"
echo "spring.jpa.database-platform=org.hibernate.dialect.PostgreSQL10Dialect"
echo "spring.jpa.hibernate.ddl-auto=update"
echo ""
echo "Next steps:"
echo "==========="
echo "1. Save the endpoint: $ENDPOINT"
echo "2. Test connection with psql:"
echo "   psql -h $ENDPOINT -U $DB_USER -d postgres"
echo "3. Create the database (optional, Hibernate will create it):"
echo "   createdb -h $ENDPOINT -U $DB_USER cinepass"
echo "4. Update backend environment variables in EB"
echo "5. Configure security group to allow Elastic Beanstalk"
echo ""
echo "To delete this instance later:"
echo "==============================="
echo "aws rds delete-db-instance --db-instance-identifier $DB_INSTANCE_ID --skip-final-snapshot --region $REGION"
echo ""

