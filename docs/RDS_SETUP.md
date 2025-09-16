# Safpar Tours - RDS Database Setup Guide

## Overview
This document provides comprehensive instructions for setting up the MySQL RDS instance for Safpar Tours' tour management system.

## RDS Instance Specifications

### Instance Configuration
- **Engine**: MySQL 8.0
- **Instance Class**: `db.t3.micro` (Free Tier eligible)
- **Storage**: 20 GB General Purpose SSD (gp2)
- **Database Name**: `safpar_tours`
- **Username**: `admin`
- **Region**: `us-east-1` (US East - N. Virginia)

### Network & Security
- **VPC**: Default VPC (`vpc-0c34c6b4703df9fa3`)
- **Subnet Group**: Default subnet group (multi-AZ)
- **Public Access**: No (private access only)
- **Security Group**: Custom security group for RDS access

## Prerequisites

### IAM Permissions Required
The `safpar-amplify-dev` user needs additional permissions:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "rds:CreateDBInstance",
                "rds:CreateDBSubnetGroup",
                "rds:DescribeDBInstances",
                "rds:DescribeDBSubnetGroups",
                "ec2:CreateSecurityGroup",
                "ec2:AuthorizeSecurityGroupIngress",
                "ec2:DescribeSecurityGroups",
                "ec2:DescribeVpcs",
                "ec2:DescribeSubnets"
            ],
            "Resource": "*"
        }
    ]
}
```

## Setup Instructions

### Step 1: Create Security Group for RDS

```bash
# Create security group
aws ec2 create-security-group \
  --group-name safpar-rds-sg \
  --description "Security group for Safpar Tours RDS MySQL instance" \
  --vpc-id vpc-0c34c6b4703df9fa3 \
  --profile safpar-amplify-dev

# Note the GroupId from the response
export RDS_SECURITY_GROUP_ID="sg-xxxxxxxxx"

# Allow MySQL access from default security group (for Amplify)
aws ec2 authorize-security-group-ingress \
  --group-id $RDS_SECURITY_GROUP_ID \
  --protocol tcp \
  --port 3306 \
  --source-group sg-default-vpc \
  --profile safpar-amplify-dev

# Allow access from specific CIDR (optional for development)
aws ec2 authorize-security-group-ingress \
  --group-id $RDS_SECURITY_GROUP_ID \
  --protocol tcp \
  --port 3306 \
  --cidr 172.31.0.0/16 \
  --profile safpar-amplify-dev
```

### Step 2: Create DB Subnet Group

```bash
# Get subnet IDs for multi-AZ deployment
SUBNET_IDS="subnet-08b9802dae1e4476e,subnet-0681c5f0284ac5f95,subnet-0a16735280163f515"

# Create DB subnet group
aws rds create-db-subnet-group \
  --db-subnet-group-name safpar-db-subnet-group \
  --db-subnet-group-description "Subnet group for Safpar Tours RDS" \
  --subnet-ids $SUBNET_IDS \
  --profile safpar-amplify-dev
```

### Step 3: Create RDS Instance

```bash
# Generate secure password
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
echo "Database Password: $DB_PASSWORD"

# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier safpar-tours-db \
  --db-instance-class db.t3.micro \
  --engine mysql \
  --engine-version 8.0.35 \
  --master-username admin \
  --master-user-password "$DB_PASSWORD" \
  --allocated-storage 20 \
  --db-name safpar_tours \
  --vpc-security-group-ids $RDS_SECURITY_GROUP_ID \
  --db-subnet-group-name safpar-db-subnet-group \
  --no-publicly-accessible \
  --backup-retention-period 7 \
  --storage-type gp2 \
  --multi-az \
  --storage-encrypted \
  --auto-minor-version-upgrade \
  --deletion-protection \
  --profile safpar-amplify-dev

# Monitor creation status
aws rds describe-db-instances \
  --db-instance-identifier safpar-tours-db \
  --profile safpar-amplify-dev \
  --query 'DBInstances[0].DBInstanceStatus'
```

### Step 4: Store Database Credentials in Parameter Store

```bash
# Get RDS endpoint once instance is available
RDS_ENDPOINT=$(aws rds describe-db-instances \
  --db-instance-identifier safpar-tours-db \
  --profile safpar-amplify-dev \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text)

# Store connection details in Parameter Store
aws ssm put-parameter \
  --name "/safpar/db/host" \
  --value "$RDS_ENDPOINT" \
  --type "String" \
  --profile safpar-amplify-dev

aws ssm put-parameter \
  --name "/safpar/db/port" \
  --value "3306" \
  --type "String" \
  --profile safpar-amplify-dev

aws ssm put-parameter \
  --name "/safpar/db/database" \
  --value "safpar_tours" \
  --type "String" \
  --profile safpar-amplify-dev

aws ssm put-parameter \
  --name "/safpar/db/username" \
  --value "admin" \
  --type "String" \
  --profile safpar-amplify-dev

aws ssm put-parameter \
  --name "/safpar/db/password" \
  --value "$DB_PASSWORD" \
  --type "SecureString" \
  --profile safpar-amplify-dev
```

### Step 5: Initialize Database Schema

```bash
# Connect to database and run schema
mysql -h $RDS_ENDPOINT -u admin -p safpar_tours < database/schema.sql
```

## Alternative: AWS Console Setup

If CLI setup fails due to permissions, use the AWS Console:

### 1. RDS Console Setup
1. Go to [RDS Console](https://console.aws.amazon.com/rds/)
2. Click "Create database"
3. Choose:
   - **Engine**: MySQL 8.0
   - **Template**: Free tier
   - **DB instance identifier**: `safpar-tours-db`
   - **Master username**: `admin`
   - **Password**: Generate secure password
   - **Instance class**: `db.t3.micro`
   - **Storage**: 20 GB
   - **VPC**: Default VPC
   - **Public access**: No
   - **Database name**: `safpar_tours`

### 2. Security Group Configuration
1. Go to EC2 Console → Security Groups
2. Create new security group: `safpar-rds-sg`
3. Add inbound rule:
   - **Type**: MySQL/Aurora (3306)
   - **Source**: Custom - 172.31.0.0/16

### 3. Parameter Store Configuration
1. Go to Systems Manager → Parameter Store
2. Create parameters:
   - `/safpar/db/host` - RDS endpoint
   - `/safpar/db/username` - admin
   - `/safpar/db/password` - (SecureString)
   - `/safpar/db/database` - safpar_tours
   - `/safpar/db/port` - 3306

## Database Schema

### Tables Overview
1. **categories** - Tour categorization
2. **tours** - Main tour information
3. **rates** - Seasonal pricing with group discounts
4. **booking_inquiries** - Customer inquiry tracking

### Key Features
- **Seasonal Pricing**: Low, High, Peak seasons
- **Group Discounts**: Configurable discount percentages
- **Full-text Search**: On tour names and descriptions
- **Status Management**: Active, inactive, seasonal tours
- **Booking Tracking**: Customer inquiries with status workflow

### Sample Data Included
- 4 tour categories (River Cruises, Adventure, Wildlife, Cultural)
- 4 featured tours with complete details
- Seasonal rates for all tours
- Sample booking inquiry

## Database Connection

### Environment Variables
```bash
# Add to .env.local or Amplify environment variables
DB_HOST=safpar-tours-db.xxxxx.us-east-1.rds.amazonaws.com
DB_PORT=3306
DB_DATABASE=safpar_tours
DB_USERNAME=admin
DB_PASSWORD=your-secure-password
```

### Connection Example (Node.js)
```javascript
import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl: {
    rejectUnauthorized: false
  }
});
```

## Performance Optimization

### Indexes
- **Primary Keys**: Auto-increment IDs on all tables
- **Foreign Keys**: Proper relationships with cascading
- **Search Indexes**: Full-text search on tour content
- **Date Indexes**: Optimized date range queries for rates

### Query Patterns
```sql
-- Get active tours with current pricing
SELECT t.*, r.adult_price, r.child_price, r.season
FROM tours t
JOIN rates r ON t.id = r.tour_id
WHERE t.status = 'active' 
  AND r.valid_from <= CURDATE() 
  AND r.valid_to >= CURDATE()
ORDER BY t.featured DESC, t.name;

-- Search tours by keyword
SELECT t.*, MATCH(t.name, t.short_description, t.description) 
       AGAINST('wildlife safari' IN NATURAL LANGUAGE MODE) as relevance
FROM tours t
WHERE MATCH(t.name, t.short_description, t.description) 
      AGAINST('wildlife safari' IN NATURAL LANGUAGE MODE)
  AND t.status = 'active'
ORDER BY relevance DESC;
```

## Security Considerations

### Network Security
- **Private Access**: No public internet access to RDS
- **VPC Security Groups**: Restricted to application access only
- **Subnet Groups**: Multi-AZ deployment for reliability

### Data Protection
- **Encryption**: Storage encryption enabled
- **Backups**: 7-day automated backup retention
- **Parameter Store**: Secure credential storage
- **SSL**: Enforced encrypted connections

### Access Control
- **Database Users**: Separate users for different access levels
- **Application Access**: Read-only user for public API
- **Admin Access**: Full access for admin operations

## Monitoring & Maintenance

### CloudWatch Metrics
- **Connection Count**: Monitor active connections
- **Query Performance**: Slow query identification
- **Storage Usage**: Monitor disk space utilization
- **Error Rates**: Database error tracking

### Backup Strategy
- **Automated Backups**: Daily backups with 7-day retention
- **Snapshots**: Manual snapshots before major updates
- **Point-in-time Recovery**: Recovery within backup window

### Maintenance Windows
- **Auto Updates**: Minor version updates enabled
- **Maintenance Window**: Sunday 3:00-4:00 AM UTC
- **Multi-AZ**: Minimal downtime during maintenance

## Troubleshooting

### Common Issues

1. **Connection Timeouts**
   - Check security group configuration
   - Verify VPC and subnet settings
   - Confirm RDS instance is available

2. **Authentication Failures**
   - Verify credentials in Parameter Store
   - Check username/password combination
   - Ensure SSL configuration is correct

3. **Performance Issues**
   - Monitor CloudWatch metrics
   - Check for missing indexes
   - Analyze slow query logs

### Debugging Tools
- **RDS Performance Insights**: Query performance analysis
- **CloudWatch Logs**: Error and slow query logs
- **MySQL Workbench**: Database administration
- **CLI Tools**: Command-line database access

## Cost Optimization

### Free Tier Benefits
- **Instance Hours**: 750 hours/month db.t3.micro
- **Storage**: 20 GB General Purpose SSD
- **Backup**: 20 GB backup storage
- **Monitoring**: Basic CloudWatch metrics

### Cost Management
- **Right-sizing**: Monitor CPU and memory usage
- **Storage**: Regular cleanup of old data
- **Backups**: Optimize retention periods
- **Reserved Instances**: Consider for production

## Next Steps

1. **Complete RDS Setup**: Create instance and security groups
2. **Initialize Schema**: Run database/schema.sql
3. **Configure Connections**: Update application environment variables
4. **Test Connectivity**: Verify database access from application
5. **Load Sample Data**: Confirm schema and data integrity
6. **Monitor Performance**: Set up CloudWatch alarms
7. **Backup Verification**: Test backup and restore procedures

## Resources

- [AWS RDS MySQL Documentation](https://docs.aws.amazon.com/rds/latest/userguide/CHAP_MySQL.html)
- [MySQL 8.0 Reference Manual](https://dev.mysql.com/doc/refman/8.0/en/)
- [AWS Systems Manager Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html)
- [RDS Security Best Practices](https://docs.aws.amazon.com/rds/latest/userguide/CHAP_BestPractices.Security.html)