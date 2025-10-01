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

// Initialize database schema
export async function initializeSchema(): Promise<{ success: boolean; message: string }> {
  const connection = await createConnection();
  try {
    // Categories table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        slug VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        image_url VARCHAR(500),
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Tours table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS tours (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category_id INT NOT NULL,
        name VARCHAR(200) NOT NULL,
        slug VARCHAR(200) NOT NULL UNIQUE,
        short_description TEXT,
        description TEXT NOT NULL,
        duration VARCHAR(100),
        difficulty_level ENUM('Easy', 'Moderate', 'Challenging', 'Extreme') DEFAULT 'Moderate',
        max_group_size INT DEFAULT 12,
        included TEXT,
        excluded TEXT,
        what_to_bring TEXT,
        meeting_point VARCHAR(500),
        image_url VARCHAR(500),
        gallery_images JSON,
        featured BOOLEAN DEFAULT FALSE,
        status ENUM('active', 'inactive', 'draft') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
        INDEX idx_category (category_id),
        INDEX idx_slug (slug),
        INDEX idx_featured (featured),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Rates table  
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS rates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tour_id INT NOT NULL,
        season VARCHAR(50) NOT NULL,
        adult_price DECIMAL(10,2) NOT NULL,
        child_price DECIMAL(10,2),
        infant_price DECIMAL(10,2) DEFAULT 0.00,
        currency VARCHAR(3) DEFAULT 'USD',
        group_discount_percent DECIMAL(5,2) DEFAULT 10.00,
        min_group_size INT DEFAULT 6,
        valid_from DATE,
        valid_to DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE,
        INDEX idx_tour_season (tour_id, season),
        INDEX idx_valid_dates (valid_from, valid_to)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Booking inquiries table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS booking_inquiries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tour_id INT NOT NULL,
        customer_name VARCHAR(200) NOT NULL,
        customer_email VARCHAR(200) NOT NULL,
        customer_phone VARCHAR(50),
        preferred_date DATE,
        participants_adult INT NOT NULL DEFAULT 1,
        participants_child INT DEFAULT 0,
        participants_infant INT DEFAULT 0,
        special_requirements TEXT,
        message TEXT,
        status ENUM('pending', 'contacted', 'confirmed', 'cancelled') DEFAULT 'pending',
        admin_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE,
        INDEX idx_tour (tour_id),
        INDEX idx_status (status),
        INDEX idx_date (preferred_date),
        INDEX idx_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    return { success: true, message: 'Database schema initialized successfully' };
  } catch (error) {
    console.error('Schema initialization failed:', error);
    return { 
      success: false, 
      message: `Schema initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  } finally {
    await connection.end();
  }
}

// Insert sample data
export async function insertSampleData(): Promise<{ success: boolean; message: string }> {
  const connection = await createConnection();
  try {
    // Insert categories using parameterized queries
    const categories = [
      ['River Cruises', 'river-cruises', 'Experience the majestic Zambezi River with our scenic boat cruises', 'https://safpar-tours-images-1758010007.s3.us-east-1.amazonaws.com/demo/river-cruise.jpg'],
      ['Adventure Activities', 'adventure-activities', 'Thrilling outdoor adventures for adrenaline seekers', 'https://safpar-tours-images-1758010007.s3.us-east-1.amazonaws.com/demo/adventure.jpg'],
      ['Wildlife Safaris', 'wildlife-safaris', "Discover Zambia's incredible wildlife in their natural habitat", 'https://safpar-tours-images-1758010007.s3.us-east-1.amazonaws.com/demo/wildlife-safari.jpg'],
      ['Cultural Tours', 'cultural-tours', 'Immerse yourself in local Zambian culture and traditions', 'https://safpar-tours-images-1758010007.s3.us-east-1.amazonaws.com/demo/cultural-tour.jpg']
    ];

    for (const [name, slug, description, imageUrl] of categories) {
      await connection.execute(
        'INSERT IGNORE INTO categories (name, slug, description, image_url) VALUES (?, ?, ?, ?)',
        [name, slug, description, imageUrl]
      );
    }

    // Insert tours using parameterized queries
    const tours = [
      [
        1, 'Zambezi Sunset Cruise', 'zambezi-sunset-cruise', 
        'Romantic sunset cruise with wildlife viewing on the Zambezi River', 
        'Experience the magic of an African sunset while cruising along the mighty Zambezi River. Watch elephants, hippos, and crocodiles from the comfort of our well-appointed river boat.', 
        '3 hours', 'Easy', 12, 
        'Boat cruise, Drinks (beer, wine, soft drinks), Snacks, Professional guide', 
        'Transportation to/from accommodation, Gratuities', 
        'Camera, Sun hat, Sunscreen, Light jacket for evening', 
        'Safpar Tours Office, Livingstone', 
        'https://safpar-tours-images-1758010007.s3.us-east-1.amazonaws.com/demo/river-cruise.jpg', 
        1, 'active'
      ],
      [
        2, 'Victoria Falls Bridge Bungee Jump', 'victoria-falls-bungee-jump', 
        'Ultimate adrenaline rush with a 111m bungee jump over the Zambezi', 
        'Take the ultimate leap of faith with a 111-meter bungee jump from the historic Victoria Falls Bridge, right over the roaring Zambezi River.', 
        '2 hours', 'Extreme', 8, 
        'Professional instruction, Safety equipment, Certificate, Photos and video', 
        'Transportation, Personal expenses', 
        'Comfortable clothing, Closed-toe shoes', 
        'Victoria Falls Bridge', 
        'https://safpar-tours-images-1758010007.s3.us-east-1.amazonaws.com/demo/adventure.jpg', 
        1, 'active'
      ],
      [
        3, 'Chobe National Park Day Trip', 'chobe-national-park-day-trip', 
        "Full day safari in Botswana's renowned Chobe National Park", 
        'Cross into Botswana for an unforgettable day in Chobe National Park, famous for its large herds of elephants and diverse wildlife.', 
        '12 hours', 'Moderate', 16, 
        'Transportation, Park fees, Game drive, Boat cruise, Lunch, Professional guide', 
        'Beverages, Gratuities', 
        'Camera, Binoculars, Hat, Sunscreen, Comfortable clothing', 
        'Safpar Tours Office, Livingstone', 
        'https://safpar-tours-images-1758010007.s3.us-east-1.amazonaws.com/demo/wildlife-safari.jpg', 
        1, 'active'
      ],
      [
        4, 'Livingstone Cultural Village Tour', 'livingstone-cultural-village-tour', 
        'Authentic cultural experience with village visits and local traditions', 
        'Immerse yourself in traditional Zambian culture with visits to local villages, traditional craft demonstrations, and authentic local cuisine.', 
        '5 hours', 'Easy', 10, 
        'Transportation, Village visits, Cultural demonstrations, Traditional lunch, Local guide', 
        'Personal purchases, Gratuities', 
        'Comfortable walking shoes, Camera, Respectful clothing', 
        'Safpar Tours Office, Livingstone', 
        'https://safpar-tours-images-1758010007.s3.us-east-1.amazonaws.com/demo/cultural-tour.jpg', 
        0, 'active'
      ]
    ];

    for (const tourData of tours) {
      await connection.execute(
        'INSERT IGNORE INTO tours (category_id, name, slug, short_description, description, duration, difficulty_level, max_group_size, included, excluded, what_to_bring, meeting_point, image_url, featured, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        tourData
      );
    }

    // Insert rates using parameterized queries
    const rates = [
      [1, 'High Season', 85.00, 45.00, 0.00, 10.00, 6, '2024-06-01', '2024-10-31'],
      [1, 'Low Season', 70.00, 35.00, 0.00, 10.00, 6, '2024-11-01', '2024-05-31'],
      [2, 'All Year', 160.00, null, null, 5.00, 4, '2024-01-01', '2024-12-31'],
      [3, 'High Season', 180.00, 90.00, 0.00, 15.00, 8, '2024-06-01', '2024-10-31'],
      [3, 'Low Season', 150.00, 75.00, 0.00, 15.00, 8, '2024-11-01', '2024-05-31'],
      [4, 'All Year', 65.00, 35.00, 0.00, 12.00, 6, '2024-01-01', '2024-12-31']
    ];

    for (const rateData of rates) {
      await connection.execute(
        'INSERT IGNORE INTO rates (tour_id, season, adult_price, child_price, infant_price, group_discount_percent, min_group_size, valid_from, valid_to) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        rateData
      );
    }

    return { success: true, message: 'Sample data inserted successfully' };
  } catch (error) {
    console.error('Sample data insertion failed:', error);
    return { 
      success: false, 
      message: `Sample data insertion failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  } finally {
    await connection.end();
  }
}
