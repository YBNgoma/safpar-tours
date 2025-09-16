# Safpar Tours - AWS Amplify Deployment Guide

## Overview
This guide explains how to deploy the Safpar Tours application to AWS Amplify using the console interface.

## Prerequisites
- AWS Account with appropriate permissions
- GitHub repository with the Safpar Tours code
- AWS CLI configured with `safpar-amplify-dev` profile

## Step 1: Deploy to AWS Amplify Console

### 1.1 Create New App in Amplify Console
1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify)
2. Click "Create App" 
3. Choose "Deploy web app"
4. Connect to GitHub and select `safpar-tours` repository
5. Choose branch: `dev` for development, `main` for production

### 1.2 Build Settings
The `amplify.yml` file in the repository root will be automatically detected and used for build configuration:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
        - npm install -g @aws-amplify/cli
        - echo "NEXT_PUBLIC_AMPLIFY_ENV=$AWS_BRANCH" >> .env.production
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
backend:
  phases:
    build:
      commands:
        - npx ampx pipeline-deploy --branch $AWS_BRANCH --app-id $AWS_APP_ID
```

### 1.3 Environment Variables
Configure the following environment variables in Amplify Console:

**For Development (dev branch):**
- `NEXT_PUBLIC_AMPLIFY_REGION=us-east-1`
- `NEXT_PUBLIC_AMPLIFY_ENV=dev`
- `NEXTAUTH_URL=https://dev.your-amplify-url.amplifyapp.com`

**For Production (main branch):**
- `NEXT_PUBLIC_AMPLIFY_REGION=us-east-1` 
- `NEXT_PUBLIC_AMPLIFY_ENV=prod`
- `NEXTAUTH_URL=https://main.your-amplify-url.amplifyapp.com`

## Step 2: Branch-Based Deployments

### 2.1 Development Environment
- **Branch**: `dev`
- **URL**: `https://dev.safpar-tours.amplifyapp.com`
- **Auto-deploy**: On every push to `dev` branch

### 2.2 Production Environment  
- **Branch**: `main`
- **URL**: `https://main.safpar-tours.amplifyapp.com`
- **Auto-deploy**: On every push to `main` branch

## Step 3: Custom Domain (Optional)
1. In Amplify Console, go to Domain management
2. Add custom domain: `safpar.com`
3. Configure DNS settings
4. AWS will automatically provision SSL certificate

## Step 4: Monitoring and Logs
- Build logs: Available in Amplify Console
- Application logs: CloudWatch Logs
- Performance: CloudWatch metrics
- Error tracking: Amplify Console error reports

## GitFlow Integration

### Development Workflow
```bash
# Start new feature
git flow feature start feature-name

# Work on feature...
git add .
git commit -m "Feature implementation"

# Finish feature (merges to dev)
git flow feature finish feature-name

# Push to trigger dev deployment
git push origin dev
```

### Release Workflow
```bash
# Create release from dev
git flow release start v1.0.0

# Final release preparations...
git add .
git commit -m "Prepare release v1.0.0"

# Finish release (merges to main and dev)
git flow release finish v1.0.0

# Push to trigger production deployment
git push origin main
git push origin dev --tags
```

## Next Steps
1. Deploy initial version to dev environment
2. Test all functionality on dev URL
3. Configure custom domain if needed
4. Set up monitoring and alerts
5. Create production release when ready

## Troubleshooting

### Build Failures
- Check build logs in Amplify Console
- Verify all environment variables are set
- Ensure package.json scripts are correct

### Runtime Errors
- Check CloudWatch logs
- Verify API endpoints are accessible
- Check environment variable configuration

### Deployment Issues
- Verify GitHub repository connection
- Check branch settings
- Ensure build permissions are correct