#!/bin/bash

# CinePass Backend Deployment Script for AWS Elastic Beanstalk
# This script automates the entire backend deployment process

set -e  # Exit on error

echo "============================================"
echo "CinePass Backend Deployment Script"
echo "============================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}Checking prerequisites...${NC}"

    # Check Maven
    if ! command -v mvnw &> /dev/null; then
        echo -e "${RED}Maven wrapper not found. Please run from Backend directory.${NC}"
        exit 1
    fi

    # Check EB CLI
    if ! command -v eb &> /dev/null; then
        echo -e "${RED}EB CLI not found. Install with: pip install awsebcli${NC}"
        exit 1
    fi

    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        echo -e "${RED}AWS CLI not found. Install from https://aws.amazon.com/cli/${NC}"
        exit 1
    fi

    echo -e "${GREEN}All prerequisites satisfied${NC}"
    echo ""
}

# Build the application
build_application() {
    echo -e "${YELLOW}Building Spring Boot application...${NC}"

    ./mvnw clean package -DskipTests

    if [ ! -f "target/*.jar" ]; then
        echo -e "${RED}Build failed. JAR file not found in target directory.${NC}"
        exit 1
    fi

    echo -e "${GREEN}Build successful${NC}"
    echo ""
}

# Initialize Elastic Beanstalk
init_elastic_beanstalk() {
    if [ ! -d ".elasticbeanstalk" ]; then
        echo -e "${YELLOW}Initializing Elastic Beanstalk...${NC}"

        read -p "Enter application name (default: cinepass): " APP_NAME
        APP_NAME=${APP_NAME:-cinepass}

        read -p "Enter region (default: us-east-1): " REGION
        REGION=${REGION:-us-east-1}

            read -p "Enter EB platform (default: corretto-21): " PLATFORM
            PLATFORM=${PLATFORM:-corretto-21}

            eb init -p "$PLATFORM" "$APP_NAME" --region "$REGION"

        echo -e "${GREEN}Elastic Beanstalk initialized${NC}"
    else
        echo -e "${GREEN}Elastic Beanstalk already initialized${NC}"
    fi
    echo ""
}

# Create or update environment
deploy_to_elastic_beanstalk() {
    echo -e "${YELLOW}Deploying to Elastic Beanstalk...${NC}"

    ENV_NAME=$(eb list 2>/dev/null | grep "^\*" | awk '{print $1}' | sed 's/^\*//')

    if [ -z "$ENV_NAME" ]; then
        echo -e "${YELLOW}Creating new Elastic Beanstalk environment...${NC}"
        read -p "Enter environment name (default: cinepass-env): " ENV_NAME
        ENV_NAME=${ENV_NAME:-cinepass-env}

        read -p "Enter RDS endpoint (e.g., cinepass-db.XXXXX.us-east-1.rds.amazonaws.com): " RDS_ENDPOINT
        read -p "Enter RDS username (default: cinepassadmin): " RDS_USER
        RDS_USER=${RDS_USER:-cinepassadmin}

        read -sp "Enter RDS password: " RDS_PASSWORD
        echo ""

        eb create "$ENV_NAME" \
            --instance-type t2.micro \
            --envvars SPRING_PROFILES_ACTIVE=prod,SPRING_DATASOURCE_URL="jdbc:postgresql://$RDS_ENDPOINT:5432/cinepass",SPRING_DATASOURCE_USERNAME="$RDS_USER",SPRING_DATASOURCE_PASSWORD="$RDS_PASSWORD"

        echo -e "${GREEN}Environment created${NC}"
    else
        echo -e "${YELLOW}Deploying to existing environment: $ENV_NAME${NC}"
        eb deploy
        echo -e "${GREEN}Deployment complete${NC}"
    fi
    echo ""
}

# Display environment info
display_info() {
    echo -e "${GREEN}============================================${NC}"
    echo -e "${GREEN}Deployment Complete!${NC}"
    echo -e "${GREEN}============================================${NC}"

    API_URL=$(eb open --print-url 2>/dev/null || echo "Check AWS Console")

    echo ""
    echo -e "Your backend API is available at: ${YELLOW}$API_URL${NC}"
    echo ""
    echo "Useful commands:"
    echo "  eb status       - Check environment status"
    echo "  eb health       - Check instance health"
    echo "  eb logs         - View application logs"
    echo "  eb open         - Open in browser"
    echo "  eb deploy       - Deploy changes"
    echo "  eb terminate    - Delete environment"
    echo ""
}

# Main execution
main() {
    check_prerequisites
    build_application
    init_elastic_beanstalk
    deploy_to_elastic_beanstalk
    display_info
}

main "$@"

