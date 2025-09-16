import { NextApiRequest, NextApiResponse } from 'next';
import { checkDatabaseHealth, initializeSchema, insertSampleData } from '@/lib/database';

/**
 * Database initialization API endpoint
 * 
 * GET: Check database health
 * POST: Initialize schema and optionally insert sample data
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers for local development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // Health check
      const healthCheck = await checkDatabaseHealth();
      
      if (healthCheck.healthy) {
        return res.status(200).json({
          success: true,
          message: 'Database connection successful',
          timestamp: new Date().toISOString(),
          config: {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            database: process.env.DB_DATABASE,
            user: process.env.DB_USERNAME,
          }
        });
      } else {
        return res.status(503).json({
          success: false,
          message: healthCheck.message,
          timestamp: new Date().toISOString(),
        });
      }
    }

    if (req.method === 'POST') {
      const { action = 'init', includeSampleData = false } = req.body;

      if (action === 'health') {
        // Just health check
        const healthCheck = await checkDatabaseHealth();
        
        return res.status(healthCheck.healthy ? 200 : 503).json({
          success: healthCheck.healthy,
          message: healthCheck.message,
          timestamp: new Date().toISOString(),
        });
      }

      if (action === 'init') {
        // Initialize schema
        console.log('Starting database schema initialization...');
        const schemaResult = await initializeSchema();
        
        if (!schemaResult.success) {
          return res.status(500).json({
            success: false,
            message: schemaResult.message,
            timestamp: new Date().toISOString(),
          });
        }

        let sampleDataResult = null;
        if (includeSampleData) {
          console.log('Inserting sample data...');
          sampleDataResult = await insertSampleData();
          
          if (!sampleDataResult.success) {
            return res.status(500).json({
              success: false,
              message: `Schema created but sample data failed: ${sampleDataResult.message}`,
              timestamp: new Date().toISOString(),
            });
          }
        }

        return res.status(200).json({
          success: true,
          message: 'Database initialization completed successfully',
          results: {
            schema: schemaResult,
            sampleData: sampleDataResult,
          },
          timestamp: new Date().toISOString(),
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Invalid action. Use "health" or "init"',
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Database initialization API error:', error);
    
    return res.status(500).json({
      success: false,
      message: `Database operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date().toISOString(),
    });
  }
}