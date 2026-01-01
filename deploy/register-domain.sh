#!/bin/bash

# Domain Registration Script for Route 53
# Register wheatfromchaff domain

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
DOMAIN_BASE="wheatfromchaff"
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

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed. Please install it first."
    exit 1
fi

print_step "Checking domain availability for: $DOMAIN_BASE"

# List of TLDs to check
TLDS=("com" "net" "org" "dev" "blog" "io")
AVAILABLE_DOMAINS=()

for tld in "${TLDS[@]}"; do
    domain="$DOMAIN_BASE.$tld"
    print_status "Checking $domain..."

    result=$(aws route53domains check-domain-availability \
        --domain-name "$domain" \
        ${PROFILE:+--profile $PROFILE} \
        --query 'Availability' \
        --output text 2>/dev/null || echo "UNAVAILABLE")

    if [ "$result" = "AVAILABLE" ]; then
        AVAILABLE_DOMAINS+=("$domain")
        print_status "✅ $domain is AVAILABLE"
    else
        print_warning "❌ $domain is not available"
    fi
done

if [ ${#AVAILABLE_DOMAINS[@]} -eq 0 ]; then
    print_error "No domains available with base name: $DOMAIN_BASE"
    exit 1
fi

echo ""
print_step "Available domains:"
for i in "${!AVAILABLE_DOMAINS[@]}"; do
    echo "$((i+1)). ${AVAILABLE_DOMAINS[i]}"
done

echo ""
read -p "Which domain would you like to register? (Enter number): " choice

if [[ ! "$choice" =~ ^[0-9]+$ ]] || [ "$choice" -lt 1 ] || [ "$choice" -gt ${#AVAILABLE_DOMAINS[@]} ]; then
    print_error "Invalid choice"
    exit 1
fi

SELECTED_DOMAIN="${AVAILABLE_DOMAINS[$((choice-1))]}"
print_status "Selected domain: $SELECTED_DOMAIN"

# Get domain price
print_status "Getting pricing information..."
PRICE=$(aws route53domains get-domain-detail \
    --domain-name "$SELECTED_DOMAIN" \
    ${PROFILE:+--profile $PROFILE} \
    --query 'RegistrationFee.Price' \
    --output text 2>/dev/null || echo "Unknown")

if [ "$PRICE" != "Unknown" ]; then
    print_status "Registration cost: \$$PRICE USD"
fi

# Create contact info file
print_step "Setting up contact information"
echo "Please provide contact information for domain registration:"

read -p "First Name: " FIRST_NAME
read -p "Last Name: " LAST_NAME
read -p "Email: " EMAIL
read -p "Phone (e.g., +1.5551234567): " PHONE
read -p "Address Line 1: " ADDRESS1
read -p "City: " CITY
read -p "State/Province: " STATE
read -p "Postal Code: " ZIP
read -p "Country Code (e.g., US): " COUNTRY

cat > /tmp/contact-info.json << EOF
{
    "FirstName": "$FIRST_NAME",
    "LastName": "$LAST_NAME",
    "ContactType": "PERSON",
    "OrganizationName": "$FIRST_NAME $LAST_NAME",
    "AddressLine1": "$ADDRESS1",
    "City": "$CITY",
    "State": "$STATE",
    "CountryCode": "$COUNTRY",
    "ZipCode": "$ZIP",
    "PhoneNumber": "$PHONE",
    "Email": "$EMAIL"
}
EOF

echo ""
print_warning "⚠️  Domain registration will charge your AWS account!"
print_status "Domain: $SELECTED_DOMAIN"
print_status "Cost: \$${PRICE:-Unknown} USD"
echo ""

read -p "Do you want to proceed with registration? (y/n): " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_status "Registration cancelled"
    exit 0
fi

# Register domain
print_step "Registering domain: $SELECTED_DOMAIN"
print_status "This may take a few minutes..."

OPERATION_ID=$(aws route53domains register-domain \
    --domain-name "$SELECTED_DOMAIN" \
    --duration-in-years 1 \
    --admin-contact file:///tmp/contact-info.json \
    --registrant-contact file:///tmp/contact-info.json \
    --tech-contact file:///tmp/contact-info.json \
    --privacy-protect-admin-contact \
    --privacy-protect-registrant-contact \
    --privacy-protect-tech-contact \
    ${PROFILE:+--profile $PROFILE} \
    --query 'OperationId' \
    --output text)

print_status "Domain registration initiated!"
print_status "Operation ID: $OPERATION_ID"
print_status "Domain: $SELECTED_DOMAIN"

# Check registration status
print_status "Checking registration status..."
STATUS="SUBMITTED"
while [ "$STATUS" = "SUBMITTED" ] || [ "$STATUS" = "IN_PROGRESS" ]; do
    sleep 30
    STATUS=$(aws route53domains get-operation-detail \
        --operation-id "$OPERATION_ID" \
        ${PROFILE:+--profile $PROFILE} \
        --query 'Status' \
        --output text)

    print_status "Registration status: $STATUS"
done

if [ "$STATUS" = "SUCCESSFUL" ]; then
    print_status "🎉 Domain registration successful!"
    print_status "Domain: $SELECTED_DOMAIN"
    print_status "You can now use this domain with your CloudFront distribution"

    echo ""
    print_step "Next steps:"
    echo "1. Update custom-domain-setup.sh with: DOMAIN_NAME=\"$SELECTED_DOMAIN\""
    echo "2. Run: ./deploy/custom-domain-setup.sh"
    echo "3. Your blog will be available at: https://$SELECTED_DOMAIN"
else
    print_error "Domain registration failed with status: $STATUS"

    # Get failure reason
    MESSAGE=$(aws route53domains get-operation-detail \
        --operation-id "$OPERATION_ID" \
        ${PROFILE:+--profile $PROFILE} \
        --query 'Message' \
        --output text 2>/dev/null || echo "Unknown error")

    print_error "Error message: $MESSAGE"
fi

# Cleanup
rm -f /tmp/contact-info.json

print_status "Domain registration process complete!"