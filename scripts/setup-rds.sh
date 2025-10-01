#!/bin/bash

# Safpar Tours RDS Setup Script
# This script sets up the complete RDS infrastructure for the tour management system

set -e  # Exit on any error

echo "🚀 Starting Safpar Tours RDS Setup..."
echo "================================================"

# Configuration
PROFILE="safpar-amplify-dev"
REGION="us-east-1"
DB_IDENTIFIER="safpar-tours-db"
DB_NAME="safpar_tours"
DB_USERNAME="admin"
VPC_ID="vpc-0c34c6b4703df9fa3"
SECURITY_GROUP_NAME="safpar-rds-sg"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command succeeded
check_status() {
    if [ $? -eq 0 ]; then
        print_success "$1"
    else
        print_error "$2"
        exit 1
    fi
}

# Verify AWS CLI and profile
print_status "Verifying AWS CLI configuration..."
aws sts get-caller-identity --profile $PROFILE --region $REGION > /dev/null 2>&1
check_status "AWS CLI profile verified" "Failed to verify AWS CLI profile"

# Get AWS Account ID
ACCOUNT_ID=$(aws sts get-caller-identity --profile $PROFILE --query Account --output text)
print_status "AWS Account ID: $ACCOUNT_ID"

# Step 1: Check if RDS instance already exists
print_status "Checking if RDS instance already exists..."
EXISTING_DB=$(aws rds describe-db-instances \
    --profile $PROFILE \
    --region $REGION \
    --db-instance-identifier $DB_IDENTIFIER \
    --query 'DBInstances[0].DBInstanceIdentifier' \
    --output text 2>/dev/null || echo "None")

if [ "$EXISTING_DB" != "None" ] && [ "$EXISTING_DB" != "" ]; then
    print_warning "RDS instance $DB_IDENTIFIER already exists!"
    
    # Get existing RDS endpoint
    RDS_ENDPOINT=$(aws rds describe-db-instances \
        --profile $PROFILE \
        --region $REGION \
        --db-instance-identifier $DB_IDENTIFIER \
        --query 'DBInstances[0].Endpoint.Address' \
        --output text)
    
    print_status "Existing RDS endpoint: $RDS_ENDPOINT"
    
    echo "Would you like to:"
    echo "1) Use existing RDS instance"
    echo "2) Create new instance with different name"
    echo "3) Exit"
    read -p "Choose option (1-3): " choice
    
    case $choice in
        1)
            print_status "Using existing RDS instance..."
            ;;
        2)
            read -p "Enter new DB identifier: " DB_IDENTIFIER
            print_status "Will create new instance: $DB_IDENTIFIER"
            ;;
        3)
            print_status "Exiting..."
            exit 0
            ;;
        *)
            print_error "Invalid choice"
            exit 1
            ;;
    esac
fi

# Step 2: Create Security Group
print_status "Creating security group for RDS..."

# Check if security group already exists
EXISTING_SG=$(aws ec2 describe-security-groups \
    --profile $PROFILE \
    --region $REGION \
    --filters "Name=group-name,Values=$SECURITY_GROUP_NAME" "Name=vpc-id,Values=$VPC_ID" \
    --query 'SecurityGroups[0].GroupId' \
    --output text 2>/dev/null || echo "None")

if [ "$EXISTING_SG" != "None" ] && [ "$EXISTING_SG" != "" ]; then
    print_warning "Security group $SECURITY_GROUP_NAME already exists: $EXISTING_SG"
    RDS_SECURITY_GROUP_ID=$EXISTING_SG
else
    # Create new security group
    RDS_SECURITY_GROUP_ID=$(aws ec2 create-security-group \
        --profile $PROFILE \
        --region $REGION \
        --group-name $SECURITY_GROUP_NAME \
        --description "Security group for Safpar Tours RDS MySQL instance" \
        --vpc-id $VPC_ID \
        --query 'GroupId' \
        --output text)
    
    check_status "Security group created: $RDS_SECURITY_GROUP_ID" "Failed to create security group"
    
    # Add inbound rule for MySQL
    aws ec2 authorize-security-group-ingress \
        --profile $PROFILE \
        --region $REGION \
        --group-id $RDS_SECURITY_GROUP_ID \
        --protocol tcp \
        --port 3306 \
        --cidr 172.31.0.0/16 > /dev/null 2>&1
    
    check_status "MySQL access rule added to security group" "Failed to add security group rule"
fi

# Step 3: Get subnets for DB subnet group
print_status "Getting subnets for DB subnet group..."
SUBNET_IDS=$(aws ec2 describe-subnets \
    --profile $PROFILE \
    --region $REGION \
    --filters "Name=vpc-id,Values=$VPC_ID" \
    --query 'Subnets[].SubnetId' \
    --output text | tr '\t' ',')

print_status "Available subnets: $SUBNET_IDS"

# Step 4: Create DB Subnet Group
DB_SUBNET_GROUP_NAME="safpar-db-subnet-group"
print_status "Creating DB subnet group..."

# Check if subnet group exists
EXISTING_SUBNET_GROUP=$(aws rds describe-db-subnet-groups \
    --profile $PROFILE \
    --region $REGION \
    --db-subnet-group-name $DB_SUBNET_GROUP_NAME \
    --query 'DBSubnetGroups[0].DBSubnetGroupName' \
    --output text 2>/dev/null || echo "None")

if [ "$EXISTING_SUBNET_GROUP" != "None" ] && [ "$EXISTING_SUBNET_GROUP" != "" ]; then
    print_warning "DB subnet group $DB_SUBNET_GROUP_NAME already exists"
else
    aws rds create-db-subnet-group \
        --profile $PROFILE \
        --region $REGION \
        --db-subnet-group-name $DB_SUBNET_GROUP_NAME \
        --db-subnet-group-description "Subnet group for Safpar Tours RDS" \
        --subnet-ids $SUBNET_IDS > /dev/null 2>&1
    
    check_status "DB subnet group created" "Failed to create DB subnet group"
fi

# Step 5: Generate secure password
print_status "Generating secure database password..."
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
print_status "Database password generated (25 characters)"

# Step 6: Create RDS Instance (if it doesn't exist)
if [ "$EXISTING_DB" = "None" ] || [ "$EXISTING_DB" = "" ]; then
    print_status "Creating RDS MySQL instance..."
    print_status "This may take 10-15 minutes..."
    
    aws rds create-db-instance \
        --profile $PROFILE \
        --region $REGION \
        --db-instance-identifier $DB_IDENTIFIER \
        --db-instance-class db.t3.micro \
        --engine mysql \
        --engine-version 8.0.35 \
        --master-username $DB_USERNAME \
        --master-user-password "$DB_PASSWORD" \
        --allocated-storage 20 \
        --db-name $DB_NAME \
        --vpc-security-group-ids $RDS_SECURITY_GROUP_ID \
        --db-subnet-group-name $DB_SUBNET_GROUP_NAME \
        --no-publicly-accessible \
        --backup-retention-period 7 \
        --storage-type gp2 \
        --no-multi-az \
        --storage-encrypted \
        --auto-minor-version-upgrade \
        --deletion-protection \
        --tags Key=Project,Value=SafparTours Key=Environment,Value=Development > /dev/null 2>&1
    
    check_status "RDS instance creation initiated" "Failed to create RDS instance"
    
    # Wait for RDS to become available
    print_status "Waiting for RDS instance to become available..."
    aws rds wait db-instance-available \
        --profile $PROFILE \
        --region $REGION \
        --db-instance-identifier $DB_IDENTIFIER
    
    check_status "RDS instance is now available" "RDS instance failed to become available"
else
    print_status "Using existing RDS instance..."
fi

# Step 7: Get RDS endpoint
print_status "Getting RDS endpoint..."
RDS_ENDPOINT=$(aws rds describe-db-instances \
    --profile $PROFILE \
    --region $REGION \
    --db-instance-identifier $DB_IDENTIFIER \
    --query 'DBInstances[0].Endpoint.Address' \
    --output text)

check_status "RDS endpoint retrieved: $RDS_ENDPOINT" "Failed to get RDS endpoint"

# Step 8: Store credentials in Parameter Store
print_status "Storing database credentials in Parameter Store..."

aws ssm put-parameter \
    --profile $PROFILE \
    --region $REGION \
    --name "/safpar/db/host" \
    --value "$RDS_ENDPOINT" \
    --type "String" \
    --overwrite > /dev/null 2>&1

aws ssm put-parameter \
    --profile $PROFILE \
    --region $REGION \
    --name "/safpar/db/port" \
    --value "3306" \
    --type "String" \
    --overwrite > /dev/null 2>&1

aws ssm put-parameter \
    --profile $PROFILE \
    --region $REGION \
    --name "/safpar/db/database" \
    --value "$DB_NAME" \
    --type "String" \
    --overwrite > /dev/null 2>&1

aws ssm put-parameter \
    --profile $PROFILE \
    --region $REGION \
    --name "/safpar/db/username" \
    --value "$DB_USERNAME" \
    --type "String" \
    --overwrite > /dev/null 2>&1

# Only store password if we generated a new one
if [ "$EXISTING_DB" = "None" ] || [ "$EXISTING_DB" = "" ]; then
    aws ssm put-parameter \
        --profile $PROFILE \
        --region $REGION \
        --name "/safpar/db/password" \
        --value "$DB_PASSWORD" \
        --type "SecureString" \
        --overwrite > /dev/null 2>&1
    
    print_success "New database password stored in Parameter Store"
else
    print_warning "Existing database - password not updated in Parameter Store"
fi

check_status "Database credentials stored in Parameter Store" "Failed to store credentials"

# Step 9: Test database connectivity (if mysql client is available)
print_status "Checking if MySQL client is available for schema initialization..."
if command -v mysql &> /dev/null; then
    echo "Would you like to initialize the database schema now? (y/N)"
    read -p "Initialize schema: " init_schema
    
    if [ "$init_schema" = "y" ] || [ "$init_schema" = "Y" ]; then
        print_status "Initializing database schema..."
        
        if [ -f "database/schema.sql" ]; then
            # Get password from Parameter Store for initialization
            if [ "$EXISTING_DB" = "None" ] || [ "$EXISTING_DB" = "" ]; then
                RETRIEVED_PASSWORD=$DB_PASSWORD
            else
                RETRIEVED_PASSWORD=$(aws ssm get-parameter \
                    --profile $PROFILE \
                    --region $REGION \
                    --name "/safpar/db/password" \
                    --with-decryption \
                    --query 'Parameter.Value' \
                    --output text 2>/dev/null || echo "")
                
                if [ -z "$RETRIEVED_PASSWORD" ]; then
                    print_error "Could not retrieve password from Parameter Store"
                    print_warning "You'll need to manually initialize the schema"
                else
                    print_status "Retrieved password from Parameter Store"
                fi
            fi
            
            if [ ! -z "$RETRIEVED_PASSWORD" ]; then
                mysql -h $RDS_ENDPOINT -u $DB_USERNAME -p$RETRIEVED_PASSWORD $DB_NAME < database/schema.sql
                check_status "Database schema initialized successfully" "Failed to initialize schema"
            fi
        else
            print_error "Schema file database/schema.sql not found"
        fi
    fi
else
    print_warning "MySQL client not found. You'll need to initialize the schema manually."
fi

# Step 10: Update local environment file
print_status "Updating local environment configuration..."
if [ -f ".env.local" ]; then
    # Remove existing DB configuration if any
    sed -i '/^# Database Configuration/d' .env.local
    sed -i '/^DB_HOST/d' .env.local
    sed -i '/^DB_PORT/d' .env.local
    sed -i '/^DB_USERNAME/d' .env.local
    sed -i '/^DB_PASSWORD/d' .env.local
    sed -i '/^DB_DATABASE/d' .env.local
    
    # Add new configuration
    echo "" >> .env.local
    echo "# Database Configuration (RDS)" >> .env.local
    echo "DB_HOST=$RDS_ENDPOINT" >> .env.local
    echo "DB_PORT=3306" >> .env.local
    echo "DB_USERNAME=$DB_USERNAME" >> .env.local
    if [ "$EXISTING_DB" = "None" ] || [ "$EXISTING_DB" = "" ]; then
        echo "DB_PASSWORD=$DB_PASSWORD" >> .env.local
    else
        echo "# DB_PASSWORD=<existing-password-from-parameter-store>" >> .env.local
    fi
    echo "DB_DATABASE=$DB_NAME" >> .env.local
    
    print_success "Environment file updated with database configuration"
else
    print_warning ".env.local not found. You'll need to configure environment variables manually."
fi

# Summary
echo ""
echo "================================================"
print_success "🎉 Safpar Tours RDS Setup Complete!"
echo "================================================"
echo ""
echo "📋 Setup Summary:"
echo "   • RDS Instance ID: $DB_IDENTIFIER"
echo "   • Database Name: $DB_NAME"
echo "   • Username: $DB_USERNAME"
echo "   • Endpoint: $RDS_ENDPOINT"
echo "   • Security Group: $RDS_SECURITY_GROUP_ID"
echo "   • Region: $REGION"
echo ""
echo "🔐 Security:"
echo "   • Password stored in Parameter Store: /safpar/db/password"
echo "   • Database is private (no public access)"
echo "   • Security group restricts access to VPC only"
echo ""
echo "📝 Next Steps:"
echo "   1. Test database connectivity with your application"
echo "   2. Run database health check: GET /api/tours?health=true"
echo "   3. Verify schema initialization worked correctly"
echo "   4. Update production environment variables in Amplify Console"
echo ""
echo "🔧 Environment Variables Added to .env.local:"
echo "   DB_HOST=$RDS_ENDPOINT"
echo "   DB_PORT=3306"
echo "   DB_USERNAME=$DB_USERNAME"
echo "   DB_DATABASE=$DB_NAME"
if [ "$EXISTING_DB" = "None" ] || [ "$EXISTING_DB" = "" ]; then
    echo "   DB_PASSWORD=<generated-securely>"
fi
echo ""
print_success "RDS setup completed successfully!"