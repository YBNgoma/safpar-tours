// Production database configuration for AWS Amplify deployment
// This shows how to access database credentials from AWS Parameter Store or Secrets Manager

import { SSMClient, GetParametersCommand } from "@aws-sdk/client-ssm";
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

/**
 * Database configuration for production environment
 * Credentials are retrieved from AWS Parameter Store or Secrets Manager
 * This approach is more secure than hardcoded environment variables
 */

// Option 1: Using AWS Systems Manager Parameter Store
export async function getDbConfigFromParameterStore() {
  const client = new SSMClient({ 
    region: process.env.AWS_REGION || 'us-east-1' 
  });
  
  try {
    const command = new GetParametersCommand({
      Names: [
        '/safpar/db/host',
        '/safpar/db/port', 
        '/safpar/db/database',
        '/safpar/db/username'
      ],
      WithDecryption: false
    });
    
    const passwordCommand = new GetParametersCommand({
      Names: ['/safpar/db/password'],
      WithDecryption: true  // Decrypt SecureString
    });
    
    const [params, passwordParam] = await Promise.all([
      client.send(command),
      client.send(passwordCommand)
    ]);
    
    const config = {};
    params.Parameters?.forEach(param => {
      const key = param.Name?.split('/').pop(); // Extract key from path
      if (key && param.Value) {
        config[key] = param.Value;
      }
    });
    
    if (passwordParam.Parameters?.[0]?.Value) {
      config['password'] = passwordParam.Parameters[0].Value;
    }
    
    return {
      host: config['host'],
      port: parseInt(config['port'] || '3306'),
      database: config['database'],
      user: config['username'],
      password: config['password']
    };
    
  } catch (error) {
    console.error('Failed to retrieve database config from Parameter Store:', error);
    throw new Error('Database configuration unavailable');
  }
}

// Option 2: Using AWS Secrets Manager (alternative approach)
export async function getDbConfigFromSecretsManager() {
  const client = new SecretsManagerClient({ 
    region: process.env.AWS_REGION || 'us-east-1' 
  });
  
  try {
    const command = new GetSecretValueCommand({
      SecretId: 'safpar/db/credentials'
    });
    
    const response = await client.send(command);
    
    if (response.SecretString) {
      const credentials = JSON.parse(response.SecretString);
      
      return {
        host: credentials.host,
        port: credentials.port || 3306,
        database: credentials.database,
        user: credentials.username,
        password: credentials.password
      };
    }
    
    throw new Error('Secret string not found');
    
  } catch (error) {
    console.error('Failed to retrieve database config from Secrets Manager:', error);
    throw new Error('Database configuration unavailable');
  }
}

// Development vs Production configuration
export function getDatabaseConfig() {
  if (process.env.NODE_ENV === 'production') {
    // In production (Amplify), use Parameter Store
    return getDbConfigFromParameterStore();
  } else {
    // In development, use environment variables
    return Promise.resolve({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      database: process.env.DB_DATABASE || 'safpar_tours',
      user: process.env.DB_USERNAME || 'admin',
      password: process.env.DB_PASSWORD || ''
    });
  }
}

// Example usage in API routes:
// 
// In /pages/api/bookings.ts:
// 
// import { getDatabaseConfig } from '@/lib/db-config-production';
// import mysql from 'mysql2/promise';
//
// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   try {
//     const dbConfig = await getDatabaseConfig();
//     const connection = await mysql.createConnection(dbConfig);
//     
//     // Use connection for database operations
//     // ...
//     
//   } catch (error) {
//     // Handle error
//   }
// }

export default getDatabaseConfig;