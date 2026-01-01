# AWS Deployment Guide

This directory contains configuration files and scripts for deploying your WheatFromChaff blog to AWS S3 and CloudFront.

## Prerequisites

1. **AWS CLI installed and configured**:
   ```bash
   # Install AWS CLI
   pip install awscli
   # or
   brew install awscli

   # Configure AWS credentials
   aws configure
   ```

2. **Required AWS permissions**:
   - S3: CreateBucket, PutObject, PutBucketPolicy, PutBucketWebsite
   - CloudFront: CreateDistribution, GetDistribution

## Quick Start

1. **Edit the deployment script**:
   ```bash
   # Open deploy.sh and set your configuration
   BUCKET_NAME="your-unique-bucket-name"  # Must be globally unique
   REGION="us-east-1"                     # Optional: change region
   PROFILE=""                             # Optional: AWS profile name
   ```

2. **Run the deployment**:
   ```bash
   ./deploy.sh
   ```

## What the script does

1. **Builds your project** using `npm run build`
2. **Creates S3 bucket** with static website hosting
3. **Uploads files** with appropriate cache headers:
   - Static assets (CSS, JS): 1-year cache
   - HTML files: No cache (for immediate updates)
4. **Optionally creates CloudFront distribution** for global CDN

## Manual Configuration

### S3 Bucket Setup

```bash
# Create bucket
aws s3api create-bucket --bucket your-bucket-name --region us-east-1

# Enable static website hosting
aws s3 website s3://your-bucket-name --index-document index.html --error-document index.html

# Apply public read policy
aws s3api put-bucket-policy --bucket your-bucket-name --policy file://deploy/s3-bucket.json
```

### CloudFront Distribution

```bash
# Create distribution
aws cloudfront create-distribution --distribution-config file://deploy/cloudfront-distribution.json
```

## File Structure

```
deploy/
├── README.md                    # This file
├── s3-bucket.json              # S3 bucket policy for public read access
├── cloudfront-distribution.json # CloudFront distribution configuration
└── ../deploy.sh               # Main deployment script
```

## Configuration Files

### s3-bucket.json
- Bucket policy allowing public read access to all objects
- Required for static website hosting

### cloudfront-distribution.json
- CloudFront distribution configuration
- Includes error page redirects for SPA routing
- Sets up caching behaviors and compression

## Updating Your Site

After making changes to your blog:

```bash
# Build and deploy
npm run build
./deploy.sh

# Or just sync if bucket already exists
aws s3 sync dist/client/ s3://your-bucket-name --delete
```

## Custom Domain (Optional)

To use a custom domain with CloudFront:

1. **Register domain** in Route 53 or your preferred registrar
2. **Request SSL certificate** in AWS Certificate Manager
3. **Update CloudFront distribution** to use custom domain
4. **Configure DNS** to point to CloudFront distribution

## Costs

- **S3**: ~$0.023 per GB stored + $0.0004 per 1,000 requests
- **CloudFront**: ~$0.085 per GB transferred (first 10 TB)
- **Route 53** (if using custom domain): $0.50 per hosted zone/month

For a typical blog, monthly costs are usually under $5.

## Troubleshooting

### Common Issues

1. **Bucket name already exists**: S3 bucket names must be globally unique
2. **Access denied**: Check AWS credentials and permissions
3. **404 errors**: Ensure error document is set to `index.html` for SPA routing
4. **Caching issues**: CloudFront may cache old content for up to 24 hours

### Invalidate CloudFront Cache

```bash
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```