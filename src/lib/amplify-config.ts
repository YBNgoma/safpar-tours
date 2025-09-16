import { Amplify, type ResourcesConfig } from 'aws-amplify';

// This configuration will be populated when deploying to AWS Amplify
// For now, this is a placeholder for the Safpar Tours project

const amplifyConfig: ResourcesConfig = {
  // Auth configuration - will be populated when Auth is set up
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_AMPLIFY_USER_POOL_ID || '',
      userPoolClientId: process.env.NEXT_PUBLIC_AMPLIFY_USER_POOL_CLIENT_ID || '',
      identityPoolId: process.env.NEXT_PUBLIC_AMPLIFY_IDENTITY_POOL_ID || '',
    }
  },
  // Storage configuration - will be populated when S3 is set up
  Storage: {
    S3: {
      bucket: process.env.NEXT_PUBLIC_AMPLIFY_STORAGE_BUCKET_NAME || '',
      region: process.env.NEXT_PUBLIC_AMPLIFY_REGION || 'us-east-1'
    }
  }
};

// Configure Amplify with the settings (only if we have valid config)
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_AMPLIFY_USER_POOL_ID) {
  Amplify.configure(amplifyConfig);
}

export default amplifyConfig;
