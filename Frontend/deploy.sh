#!/bin/bash

# CinePass Frontend Deployment Script
# Deploys React frontend to S3 and CloudFront

set -e

echo "============================================"
echo "CinePass Frontend Deployment Script"
echo "============================================"
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}Checking prerequisites...${NC}"

    if ! command -v npm &> /dev/null; then
        echo -e "${RED}Node.js/npm not found. Install from https://nodejs.org/${NC}"
        exit 1
    fi

    if ! command -v aws &> /dev/null; then
        echo -e "${RED}AWS CLI not found. Install from https://aws.amazon.com/cli/${NC}"
        exit 1
    fi

    echo -e "${GREEN}All prerequisites satisfied${NC}"
    echo ""
}

# Install dependencies and build
build_frontend() {
    echo -e "${YELLOW}Installing dependencies and building frontend...${NC}"

    npm install
    npm run build

    if [ ! -d "dist" ]; then
        echo -e "${RED}Build failed. dist directory not found.${NC}"
        exit 1
    fi

    echo -e "${GREEN}Frontend build successful${NC}"
    echo ""
}

# Create S3 bucket
create_s3_bucket() {
    read -p "Enter S3 bucket name (must be globally unique, e.g., cinepass-frontend-$(date +%s)): " BUCKET_NAME

    if aws s3 ls "s3://$BUCKET_NAME" 2>&1 | grep -q 'NoSuchBucket'; then
        echo -e "${YELLOW}Creating S3 bucket: $BUCKET_NAME${NC}"
        aws s3 mb "s3://$BUCKET_NAME" --region ap-south-1
        echo -e "${GREEN}Bucket created${NC}"
    else
        echo -e "${GREEN}Bucket already exists${NC}"
    fi

    echo $BUCKET_NAME
}

# Configure S3 for static website
configure_s3_website() {
    local BUCKET_NAME=$1

    echo -e "${YELLOW}Configuring S3 for static website hosting...${NC}"

    # Enable static website hosting
    aws s3 website "s3://$BUCKET_NAME/" \
        --index-document index.html \
        --error-document index.html \
        --region ap-south-1

    # Set bucket policy for public read
    cat > /tmp/bucket-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
    }
  ]
}
EOF

    aws s3api put-bucket-policy --bucket "$BUCKET_NAME" --policy file:///tmp/bucket-policy.json

    echo -e "${GREEN}S3 configured${NC}"
}

# Upload to S3
upload_to_s3() {
    local BUCKET_NAME=$1

    echo -e "${YELLOW}Uploading frontend to S3...${NC}"

    aws s3 sync dist/ "s3://$BUCKET_NAME/" --delete --region ap-south-1

    echo -e "${GREEN}Upload complete${NC}"
}

# Create CloudFront distribution
create_cloudfront_distribution() {
    local BUCKET_NAME=$1

    echo -e "${YELLOW}Creating CloudFront distribution...${NC}"

    cat > /tmp/cloudfront-config.json << EOF
{
  "CallerReference": "cinepass-$(date +%s)",
  "DefaultRootObject": "index.html",
  "Comment": "CinePass Frontend Distribution",
  "Enabled": true,
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3Origin",
        "DomainName": "$BUCKET_NAME.s3.ap-south-1.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "AllowedMethods": {
      "Quantity": 2,
      "Items": ["GET", "HEAD"]
    },
    "CachedMethods": {
      "Quantity": 2,
      "Items": ["GET", "HEAD"]
    },
    "TargetOriginId": "S3Origin",
    "ViewerProtocolPolicy": "redirect-to-https",
    "MinTTL": 0,
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {"Forward": "none"}
    },
    "TrustedSigners": {
      "Enabled": false,
      "Quantity": 0
    }
  },
  "CacheBehaviors": {
    "Quantity": 0,
    "Items": []
  }
}
EOF

    DISTRIBUTION_ID=$(aws cloudfront create-distribution --distribution-config file:///tmp/cloudfront-config.json --query 'Distribution.Id' --output text)

    echo -e "${GREEN}CloudFront distribution created: $DISTRIBUTION_ID${NC}"
    echo $DISTRIBUTION_ID
}

# Display info
display_info() {
    local BUCKET_NAME=$1
    local DISTRIBUTION_ID=$2

    echo ""
    echo -e "${GREEN}============================================${NC}"
    echo -e "${GREEN}Frontend Deployment Complete!${NC}"
    echo -e "${GREEN}============================================${NC}"
    echo ""
    echo -e "S3 Bucket: ${YELLOW}$BUCKET_NAME${NC}"
    echo -e "CloudFront Distribution: ${YELLOW}$DISTRIBUTION_ID${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Wait for CloudFront distribution to be active (5-15 minutes)"
    echo "2. Get CloudFront URL: aws cloudfront get-distribution --id $DISTRIBUTION_ID --query 'Distribution.DomainName'"
    echo "3. Update backend CORS policy with frontend URL"
    echo ""
}

# Main execution
main() {
    check_prerequisites
    build_frontend
    BUCKET_NAME=$(create_s3_bucket)
    configure_s3_website "$BUCKET_NAME"
    upload_to_s3 "$BUCKET_NAME"
    DISTRIBUTION_ID=$(create_cloudfront_distribution "$BUCKET_NAME")
    display_info "$BUCKET_NAME" "$DISTRIBUTION_ID"
}

main "$@"

