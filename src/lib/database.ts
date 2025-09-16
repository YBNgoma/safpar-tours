// Database connection and utility functions for Safpar Tours
// Handles MySQL connections and common database operations

import mysql from 'mysql2/promise';
import { TourWithRates, BookingInquiry } from '@/types';

// Database connection configuration
interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl?: {
    rejectUnauthorized: boolean;
  };
}

// Get database configuration from environment variables
function getDatabaseConfig(): DatabaseConfig {
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USERNAME || 'admin',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'safpar_tours',
    ssl: {
      rejectUnauthorized: false
    }
  };
}

// Create database connection
export async function createConnection() {
  try {
    const config = getDatabaseConfig();
    const connection = await mysql.createConnection(config);
    
    // Test the connection
    await connection.ping();
    
    return connection;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw new Error('Unable to connect to database');
  }
}

// Execute query with automatic connection management
export async function executeQuery<T = unknown>(
  query: string, 
  params: unknown[] = []
): Promise<T[]> {
  const connection = await createConnection();
  
  try {
    const [rows] = await connection.execute(query, params);
    return rows as T[];
  } catch (error) {
    console.error('Query execution failed:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Get all active tours with current pricing
export async function getActiveToursWithPricing(): Promise<TourWithRates[]> {
  const query = `
    SELECT 
      t.*,
      c.name as category_name,
      c.slug as category_slug,
      r.adult_price,
      r.child_price,
      r.infant_price,
      r.season,
      r.group_discount_percent,
      r.min_group_size,
      r.currency
    FROM tours t
    JOIN categories c ON t.category_id = c.id
    JOIN rates r ON t.id = r.tour_id
    WHERE t.status = 'active' 
      AND c.status = 'active'
      AND r.valid_from <= CURDATE() 
      AND r.valid_to >= CURDATE()
    ORDER BY t.featured DESC, t.name ASC
  `;
  
  return executeQuery<TourWithRates>(query);
}

// Get tours by category
export async function getToursByCategory(categorySlug: string): Promise<TourWithRates[]> {
  const query = `
    SELECT 
      t.*,
      c.name as category_name,
      c.slug as category_slug,
      r.adult_price,
      r.child_price,
      r.infant_price,
      r.season,
      r.group_discount_percent,
      r.min_group_size,
      r.currency
    FROM tours t
    JOIN categories c ON t.category_id = c.id
    JOIN rates r ON t.id = r.tour_id
    WHERE t.status = 'active' 
      AND c.status = 'active'
      AND c.slug = ?
      AND r.valid_from <= CURDATE() 
      AND r.valid_to >= CURDATE()
    ORDER BY t.featured DESC, t.name ASC
  `;
  
  return executeQuery<TourWithRates>(query, [categorySlug]);
}

// Get single tour by slug with pricing
export async function getTourBySlug(slug: string): Promise<TourWithRates | null> {
  const query = `
    SELECT 
      t.*,
      c.name as category_name,
      c.slug as category_slug,
      r.adult_price,
      r.child_price,
      r.infant_price,
      r.season,
      r.group_discount_percent,
      r.min_group_size,
      r.currency,
      r.valid_from,
      r.valid_to
    FROM tours t
    JOIN categories c ON t.category_id = c.id
    JOIN rates r ON t.id = r.tour_id
    WHERE t.status = 'active' 
      AND c.status = 'active'
      AND t.slug = ?
      AND r.valid_from <= CURDATE() 
      AND r.valid_to >= CURDATE()
    LIMIT 1
  `;
  
  const results = await executeQuery<TourWithRates>(query, [slug]);
  return results.length > 0 ? results[0] : null;
}

// Search tours by keyword
export async function searchTours(keyword: string): Promise<TourWithRates[]> {
  const query = `
    SELECT 
      t.*,
      c.name as category_name,
      c.slug as category_slug,
      r.adult_price,
      r.child_price,
      r.infant_price,
      r.season,
      r.group_discount_percent,
      r.min_group_size,
      r.currency,
      MATCH(t.name, t.short_description, t.description) 
        AGAINST(? IN NATURAL LANGUAGE MODE) as relevance
    FROM tours t
    JOIN categories c ON t.category_id = c.id
    JOIN rates r ON t.id = r.tour_id
    WHERE t.status = 'active' 
      AND c.status = 'active'
      AND MATCH(t.name, t.short_description, t.description) 
          AGAINST(? IN NATURAL LANGUAGE MODE)
      AND r.valid_from <= CURDATE() 
      AND r.valid_to >= CURDATE()
    ORDER BY relevance DESC, t.featured DESC
  `;
  
  return executeQuery<TourWithRates>(query, [keyword, keyword]);
}

// Get featured tours
export async function getFeaturedTours(limit: number = 4): Promise<TourWithRates[]> {
  const query = `
    SELECT 
      t.*,
      c.name as category_name,
      c.slug as category_slug,
      r.adult_price,
      r.child_price,
      r.infant_price,
      r.season,
      r.group_discount_percent,
      r.min_group_size,
      r.currency
    FROM tours t
    JOIN categories c ON t.category_id = c.id
    JOIN rates r ON t.id = r.tour_id
    WHERE t.status = 'active' 
      AND c.status = 'active'
      AND t.featured = TRUE
      AND r.valid_from <= CURDATE() 
      AND r.valid_to >= CURDATE()
    ORDER BY t.name ASC
    LIMIT ?
  `;
  
  return executeQuery<TourWithRates>(query, [limit]);
}

// Create booking inquiry
export async function createBookingInquiry(inquiry: {
  tourId: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  preferredDate?: string;
  participantsAdult: number;
  participantsChild: number;
  participantsInfant: number;
  specialRequirements?: string;
  message?: string;
}): Promise<number> {
  const query = `
    INSERT INTO booking_inquiries (
      tour_id, customer_name, customer_email, customer_phone,
      preferred_date, participants_adult, participants_child, participants_infant,
      special_requirements, message, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
  `;
  
  const params = [
    inquiry.tourId,
    inquiry.customerName,
    inquiry.customerEmail,
    inquiry.customerPhone || null,
    inquiry.preferredDate || null,
    inquiry.participantsAdult,
    inquiry.participantsChild,
    inquiry.participantsInfant,
    inquiry.specialRequirements || null,
    inquiry.message || null
  ];
  
  const connection = await createConnection();
  
  try {
    const [result] = await connection.execute(query, params);
    const insertResult = result as mysql.ResultSetHeader;
    return insertResult.insertId;
  } catch (error) {
    console.error('Failed to create booking inquiry:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Get all booking inquiries (admin)
export async function getBookingInquiries(
  status?: string,
  limit: number = 50,
  offset: number = 0
): Promise<(BookingInquiry & { tour_name: string })[]> {
  let query = `
    SELECT 
      bi.*,
      t.name as tour_name,
      t.slug as tour_slug
    FROM booking_inquiries bi
    JOIN tours t ON bi.tour_id = t.id
  `;
  
  const params: unknown[] = [];
  
  if (status) {
    query += ` WHERE bi.status = ?`;
    params.push(status);
  }
  
  query += ` ORDER BY bi.created_at DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);
  
  return executeQuery(query, params);
}

// Update booking inquiry status (admin)
export async function updateBookingInquiryStatus(
  inquiryId: number,
  status: 'pending' | 'contacted' | 'confirmed' | 'cancelled',
  adminNotes?: string
): Promise<boolean> {
  const query = `
    UPDATE booking_inquiries 
    SET status = ?, admin_notes = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  
  const connection = await createConnection();
  
  try {
    const [result] = await connection.execute(query, [status, adminNotes || null, inquiryId]);
    const updateResult = result as mysql.ResultSetHeader;
    return updateResult.affectedRows > 0;
  } catch (error) {
    console.error('Failed to update booking inquiry:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Get database statistics (admin dashboard)
export async function getDashboardStats() {
  const queries = {
    totalTours: 'SELECT COUNT(*) as count FROM tours WHERE status = "active"',
    totalBookings: 'SELECT COUNT(*) as count FROM booking_inquiries',
    pendingBookings: 'SELECT COUNT(*) as count FROM booking_inquiries WHERE status = "pending"',
    featuredTours: 'SELECT COUNT(*) as count FROM tours WHERE status = "active" AND featured = TRUE'
  };
  
  const connection = await createConnection();
  
  try {
    const stats: Record<string, number> = {};
    
    for (const [key, query] of Object.entries(queries)) {
      const [rows] = await connection.execute(query);
      stats[key] = (rows as { count: number }[])[0].count;
    }
    
    return stats;
  } catch (error) {
    console.error('Failed to get dashboard stats:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Health check for database connectivity
export async function checkDatabaseHealth(): Promise<{ healthy: boolean; message: string }> {
  try {
    const connection = await createConnection();
    await connection.ping();
    await connection.end();
    
    return {
      healthy: true,
      message: 'Database connection successful'
    };
  } catch (error) {
    return {
      healthy: false,
      message: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}