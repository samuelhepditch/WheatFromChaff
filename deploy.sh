#!/bin/bash

# WheatFromChaff Blog Deployment Script
# This script deploys the blog to AWS S3 and CloudFront

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BUCKET_NAME="wheatfromchaffblog"
REGION="us-east-1"
PROFILE=""

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check for required parameters
if [ -z "$BUCKET_NAME" ]; then
    print_error "Please set BUCKET_NAME in the script"
    exit 1
fi

# Build the project
print_status "Building the project..."
npm run build

# Check if build was successful
if [ ! -d "dist/client" ]; then
    print_error "Build failed - dist/client directory not found"
    exit 1
fi

# Create S3 bucket if it doesn't exist
print_status "Creating S3 bucket: $BUCKET_NAME"
if aws s3api head-bucket --bucket "$BUCKET_NAME" ${PROFILE:+--profile $PROFILE} 2>/dev/null; then
    print_warning "Bucket $BUCKET_NAME already exists"
else
    aws s3api create-bucket \
        --bucket "$BUCKET_NAME" \
        --region "$REGION" \
        ${PROFILE:+--profile $PROFILE}

    print_status "Bucket created successfully"
fi

# Create Origin Access Control (OAC)
print_status "Creating Origin Access Control..."
OAC_ID=$(aws cloudfront create-origin-access-control \
    --origin-access-control-config '{
        "Name": "WheatFromChaff-OAC",
        "Description": "OAC for WheatFromChaff blog S3 bucket",
        "OriginAccessControlOriginType": "s3",
        "SigningBehavior": "always",
        "SigningProtocol": "sigv4"
    }' \
    ${PROFILE:+--profile $PROFILE} \
    --query 'OriginAccessControl.Id' \
    --output text)

print_status "Created OAC with ID: $OAC_ID"

# Upload files to S3
print_status "Uploading files to S3..."
aws s3 sync dist/client/ "s3://$BUCKET_NAME" \
    --delete \
    --cache-control "public, max-age=31536000" \
    --exclude "*.html" \
    ${PROFILE:+--profile $PROFILE}

# Upload HTML files with shorter cache
aws s3 sync dist/client/ "s3://$BUCKET_NAME" \
    --delete \
    --cache-control "public, max-age=0, must-revalidate" \
    --exclude "*" \
    --include "*.html" \
    ${PROFILE:+--profile $PROFILE}

print_status "Website deployed successfully!"
print_status "Website URL: http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"

# Optional: Create CloudFront distribution
read -p "Do you want to create a CloudFront distribution? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Creating CloudFront distribution..."

    # Get AWS Account ID for bucket policy
    ACCOUNT_ID=$(aws sts get-caller-identity --query 'Account' --output text ${PROFILE:+--profile $PROFILE})

    # Replace placeholders in CloudFront config
    TIMESTAMP=$(date +%s)
    sed -e "s/{TIMESTAMP}/$TIMESTAMP/g" \
        -e "s/{BUCKET_NAME}/$BUCKET_NAME/g" \
        -e "s/{OAC_ID}/$OAC_ID/g" \
        deploy/cloudfront-distribution.json > /tmp/cloudfront-config.json

    DISTRIBUTION_ID=$(aws cloudfront create-distribution \
        --distribution-config file:///tmp/cloudfront-config.json \
        ${PROFILE:+--profile $PROFILE} \
        --query 'Distribution.Id' \
        --output text)

    print_status "CloudFront distribution created with ID: $DISTRIBUTION_ID"

    # Apply bucket policy for CloudFront access only
    print_status "Applying private bucket policy for CloudFront access..."
    sed -e "s/your-bucket-name/$BUCKET_NAME/g" \
        -e "s/{ACCOUNT_ID}/$ACCOUNT_ID/g" \
        -e "s/{DISTRIBUTION_ID}/$DISTRIBUTION_ID/g" \
        deploy/s3-bucket.json > /tmp/bucket-policy.json

    aws s3api put-bucket-policy \
        --bucket "$BUCKET_NAME" \
        --policy file:///tmp/bucket-policy.json \
        ${PROFILE:+--profile $PROFILE}

    print_status "Distribution URL will be available in ~15 minutes"

    # Get the distribution domain name
    DOMAIN_NAME=$(aws cloudfront get-distribution \
        --id "$DISTRIBUTION_ID" \
        ${PROFILE:+--profile $PROFILE} \
        --query 'Distribution.DomainName' \
        --output text)

    print_status "CloudFront URL: https://$DOMAIN_NAME"
fi

# Clean up temp files
rm -f /tmp/bucket-policy.json /tmp/cloudfront-config.json

print_status "Deployment complete!"