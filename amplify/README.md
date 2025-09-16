# Safpar Tours - Amplify Backend Configuration

## Overview
This directory contains the Amplify Gen 2 backend configuration for Safpar Tours. The backend is designed to support the tour operator's needs including authentication, data storage, and API management.

## Structure
```
amplify/
├── backend.ts           # Main backend configuration
├── auth/
│   └── resource.ts      # Authentication configuration (Cognito)
├── data/
│   └── resource.ts      # Data layer configuration (GraphQL API)
├── package.json         # Backend dependencies
└── tsconfig.json        # TypeScript configuration
```

## Backend Services

### 1. Authentication (Auth)
- **Service**: Amazon Cognito User Pools
- **Purpose**: Admin-only authentication for V1
- **Configuration**: Located in `auth/resource.ts`
- **Features**:
  - Email-based authentication
  - Secure JWT tokens
  - MFA support (configurable)

### 2. Data Layer (Data)
- **Service**: AWS AppSync GraphQL API
- **Purpose**: API for tour data and booking management
- **Configuration**: Located in `data/resource.ts`
- **Features**:
  - Real-time data synchronization
  - Offline support
  - Type-safe GraphQL schema

## Local Development

### Prerequisites
- AWS CLI configured with `safpar-amplify-dev` profile
- Node.js 18+ installed
- Proper IAM permissions for Amplify deployment

### Commands
```bash
# Start local development sandbox
npm run amplify:sandbox

# Deploy backend to AWS
npm run amplify:deploy

# Type check backend code
npm run type-check
```

### Sandbox Environment
The sandbox environment allows you to:
- Test backend changes locally
- Experiment with schema modifications
- Debug authentication flows
- Validate API operations

## Deployment

### Automatic Deployment
Backend deployment is integrated into the CI/CD pipeline:
- **Dev Environment**: Deploys on push to `dev` branch
- **Production**: Deploys on push to `main` branch

### Manual Deployment
```bash
# Deploy to specific environment
npx ampx pipeline-deploy --branch dev --profile safpar-amplify-dev
```

## Environment Configuration

### Development
- Environment: `dev`
- Auto-deploy: Yes
- Monitoring: CloudWatch logs enabled

### Production  
- Environment: `prod`
- Auto-deploy: Yes (from main branch)
- Monitoring: Enhanced with alarms

## Schema Design

### Tours
```graphql
type Tour {
  id: ID!
  name: String!
  slug: String!
  description: String
  category: TourCategory!
  duration: Int!
  maxParticipants: Int!
  difficulty: DifficultyLevel!
  images: [String!]!
  pricing: [Rate!]!
  status: TourStatus!
}
```

### Rates
```graphql
type Rate {
  id: ID!
  tourId: ID!
  season: Season!
  adultPrice: Float!
  childPrice: Float
  groupDiscount: Float
  validFrom: AWSDate!
  validTo: AWSDate!
}
```

## Security

### Authentication
- Admin-only access for V1
- JWT-based authentication
- Secure token refresh
- Session management

### Authorization
- Role-based access control
- API-level permissions
- Resource-level security

### Data Protection
- Encryption at rest
- Encryption in transit
- VPC endpoints for private communication

## Monitoring

### CloudWatch Integration
- API request/response logging
- Error rate monitoring
- Performance metrics
- Custom business metrics

### Alerts
- High error rates
- Unusual traffic patterns
- Authentication failures
- Database performance issues

## Troubleshooting

### Common Issues
1. **Sandbox fails to start**
   - Check AWS credentials
   - Verify IAM permissions
   - Ensure profile configuration

2. **Schema deployment errors**
   - Validate GraphQL schema syntax
   - Check for breaking changes
   - Review CloudFormation logs

3. **Authentication issues**
   - Verify Cognito configuration
   - Check user pool settings
   - Validate JWT tokens

### Support
For technical support:
1. Check CloudWatch logs
2. Review Amplify Console
3. Consult AWS documentation
4. Contact development team

## Next Steps
1. Complete IAM permission setup
2. Deploy sandbox environment
3. Test authentication flow
4. Implement tour data schema
5. Add rate management functionality