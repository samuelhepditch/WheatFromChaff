#!/bin/bash

# Custom Domain Setup for WheatFromChaff Blog
# This script helps set up a custom domain with CloudFront

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration - UPDATE THESE VALUES
DOMAIN_NAME="wheatfromchaff.org"              # e.g., "blog.example.com"
HOSTED_ZONE_ID="Z0313910ICPCA5WY4RQD"          # Route 53 hosted zone ID (if using Route 53)
DISTRIBUTION_ID="E1G0FWE5HJMM4U"         # Your existing CloudFront distribution ID

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

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check for required parameters
if [ -z "$DOMAIN_NAME" ]; then
    print_error "Please set DOMAIN_NAME in the script (e.g., blog.example.com)"
    exit 1
fi

print_step "Setting up custom domain: $DOMAIN_NAME"

# Step 1: Request SSL Certificate
print_status "Step 1: Requesting SSL certificate..."
CERT_ARN=$(aws acm request-certificate \
    --domain-name "$DOMAIN_NAME" \
    --validation-method DNS \
    --region us-east-1 \
    --query 'CertificateArn' \
    --output text)

print_status "Certificate requested with ARN: $CERT_ARN"
print_warning "You need to validate this certificate before proceeding"

# Get validation records
print_status "Getting DNS validation records..."
aws acm describe-certificate \
    --certificate-arn "$CERT_ARN" \
    --region us-east-1 \
    --query 'Certificate.DomainValidationOptions[0].ResourceRecord' \
    --output table

echo -e "${YELLOW}ACTION REQUIRED:${NC}"
echo "1. Add the DNS validation record shown above to your domain's DNS"
echo "2. Wait for certificate validation (usually 5-10 minutes)"
echo ""

# Wait for certificate validation
read -p "Press Enter after you've added the DNS record and want to check validation status..."

print_status "Checking certificate validation status..."
STATUS="PENDING_VALIDATION"
while [ "$STATUS" = "PENDING_VALIDATION" ]; do
    STATUS=$(aws acm describe-certificate \
        --certificate-arn "$CERT_ARN" \
        --region us-east-1 \
        --query 'Certificate.Status' \
        --output text)

    if [ "$STATUS" = "PENDING_VALIDATION" ]; then
        print_warning "Certificate still pending validation. Waiting 30 seconds..."
        sleep 30
    elif [ "$STATUS" = "ISSUED" ]; then
        print_status "Certificate validated successfully!"
    else
        print_error "Certificate validation failed with status: $STATUS"
        exit 1
    fi
done

# Step 2: Update CloudFront Distribution
if [ -z "$DISTRIBUTION_ID" ]; then
    print_warning "No distribution ID provided. Please update manually or provide DISTRIBUTION_ID"
    print_status "To update manually:"
    echo "1. Go to CloudFront console"
    echo "2. Edit your distribution"
    echo "3. Add alternate domain name: $DOMAIN_NAME"
    echo "4. Select the SSL certificate: $CERT_ARN"
else
    print_status "Step 2: Updating CloudFront distribution..."

    # Get current distribution config
    aws cloudfront get-distribution-config \
        --id "$DISTRIBUTION_ID" \
        --query 'DistributionConfig' > /tmp/distribution-config.json

    print_status "Current distribution config saved. Manual update required."
    print_warning "CloudFront distribution updates require manual editing of the JSON config"
    print_status "Update /tmp/distribution-config.json to include:"
    echo "  - Aliases: [\"$DOMAIN_NAME\"]"
    echo "  - ViewerCertificate.AcmCertificateArn: \"$CERT_ARN\""
    echo "  - ViewerCertificate.SSLSupportMethod: \"sni-only\""
fi

# Step 3: DNS Configuration
print_step "Step 3: DNS Configuration"

if [ -n "$HOSTED_ZONE_ID" ]; then
    print_status "Setting up Route 53 DNS records..."

    # Get CloudFront domain name
    CF_DOMAIN=$(aws cloudfront get-distribution \
        --id "$DISTRIBUTION_ID" \
        --query 'Distribution.DomainName' \
        --output text)

    # Create DNS record
    cat > /tmp/dns-record.json << EOF
{
    "Comment": "Add $DOMAIN_NAME CNAME to CloudFront",
    "Changes": [
        {
            "Action": "CREATE",
            "ResourceRecordSet": {
                "Name": "$DOMAIN_NAME",
                "Type": "CNAME",
                "TTL": 300,
                "ResourceRecords": [
                    {
                        "Value": "$CF_DOMAIN"
                    }
                ]
            }
        }
    ]
}
EOF

    aws route53 change-resource-record-sets \
        --hosted-zone-id "$HOSTED_ZONE_ID" \
        --change-batch file:///tmp/dns-record.json

    print_status "DNS record created successfully!"
else
    print_status "Manual DNS configuration required:"
    echo "Create a CNAME record in your DNS provider:"
    echo "  Name: $(echo $DOMAIN_NAME | cut -d'.' -f1)"
    echo "  Value: [YOUR_CLOUDFRONT_DOMAIN] (e.g., d1234567890123.cloudfront.net)"
fi

print_status "Custom domain setup complete!"
print_status "Certificate ARN: $CERT_ARN"
print_warning "Note: CloudFront changes can take 15-20 minutes to propagate globally"

# Cleanup
rm -f /tmp/dns-record.json /tmp/distribution-config.json