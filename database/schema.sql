-- Safpar Tours Database Schema
-- MySQL 8.0 compatible schema for tour management system
-- Database: safpar_tours

-- Drop existing tables if they exist (for development)
DROP TABLE IF EXISTS booking_inquiries;
DROP TABLE IF EXISTS rates;
DROP TABLE IF EXISTS tours;
DROP TABLE IF EXISTS categories;

-- Categories table for tour categorization
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    display_order INT DEFAULT 0,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_status (status),
    INDEX idx_display_order (display_order)
);

-- Tours table - Main tour information
CREATE TABLE tours (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    short_description VARCHAR(500),
    category_id INT,
    duration_hours INT NOT NULL,
    max_participants INT NOT NULL,
    min_participants INT DEFAULT 2,
    difficulty_level ENUM('easy', 'moderate', 'challenging') NOT NULL,
    
    -- Images stored as JSON array of S3 keys
    image_urls JSON,
    featured_image VARCHAR(500),
    
    -- Tour details
    inclusions TEXT,
    exclusions TEXT,
    requirements TEXT,
    meeting_point VARCHAR(255),
    
    -- SEO and metadata
    meta_title VARCHAR(255),
    meta_description TEXT,
    
    -- Status and timestamps
    status ENUM('active', 'inactive', 'seasonal') DEFAULT 'active',
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    
    -- Indexes for performance
    INDEX idx_category (category_id),
    INDEX idx_status (status),
    INDEX idx_featured (featured),
    INDEX idx_slug (slug),
    FULLTEXT idx_search (name, short_description, description)
);

-- Rates table - Pricing information with seasonal variations
CREATE TABLE rates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tour_id INT NOT NULL,
    season ENUM('low', 'high', 'peak') NOT NULL,
    
    -- Pricing
    adult_price DECIMAL(10,2) NOT NULL,
    child_price DECIMAL(10,2),
    infant_price DECIMAL(10,2) DEFAULT 0.00,
    
    -- Group discounts
    group_discount_percent DECIMAL(5,2) DEFAULT 0.00,
    min_group_size INT DEFAULT 6,
    
    -- Validity period
    valid_from DATE NOT NULL,
    valid_to DATE NOT NULL,
    
    -- Currency and metadata
    currency VARCHAR(3) DEFAULT 'USD',
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_tour_season (tour_id, season),
    INDEX idx_validity (valid_from, valid_to),
    INDEX idx_dates (valid_from, valid_to)
);

-- Booking inquiries table - For customer inquiries (V1)
CREATE TABLE booking_inquiries (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tour_id INT NOT NULL,
    
    -- Customer information
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    
    -- Booking details
    preferred_date DATE,
    participants_adult INT DEFAULT 1,
    participants_child INT DEFAULT 0,
    participants_infant INT DEFAULT 0,
    
    -- Additional information
    special_requirements TEXT,
    message TEXT,
    
    -- Status tracking
    status ENUM('pending', 'contacted', 'confirmed', 'cancelled') DEFAULT 'pending',
    admin_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_tour (tour_id),
    INDEX idx_status (status),
    INDEX idx_date (preferred_date),
    INDEX idx_created (created_at)
);

-- Insert sample categories
INSERT INTO categories (name, slug, description, display_order) VALUES
('River Cruises', 'river-cruises', 'Scenic boat trips along the Zambezi River with wildlife viewing opportunities', 1),
('Adventure Activities', 'adventure-activities', 'High-energy activities including white-water rafting and extreme sports', 2),
('Wildlife Safaris', 'wildlife-safaris', 'Game drives and wildlife encounters in national parks', 3),
('Cultural Tours', 'cultural-tours', 'Authentic cultural experiences with local communities', 4);

-- Insert sample tours with S3 image references
INSERT INTO tours (
    name, slug, description, short_description, category_id, duration_hours, 
    max_participants, min_participants, difficulty_level, featured_image,
    inclusions, exclusions, requirements, meeting_point, status, featured
) VALUES
(
    'Zambezi Sunset Cruise',
    'zambezi-sunset-cruise',
    'Experience the magic of an African sunset while cruising the mighty Zambezi River. This peaceful evening cruise includes drinks, snacks, and the chance to spot hippos and crocodiles in their natural habitat. As the sun sets over Victoria Falls, enjoy traditional Zambian hospitality and stunning photo opportunities.',
    'Peaceful evening cruise with drinks and wildlife spotting',
    1, -- River Cruises
    3,
    20,
    2,
    'easy',
    'images/river-cruises/zambezi-sunset-cruise.jpg',
    'Welcome drinks, snacks, life jackets, professional guide, hotel transfers',
    'Meals, gratuities, personal expenses',
    'No swimming ability required, suitable for all ages',
    'Victoria Falls Waterfront',
    'active',
    TRUE
),
(
    'Victoria Falls White-Water Rafting',
    'victoria-falls-rafting',
    'Navigate the world-famous Grade 5 rapids below Victoria Falls on the Zambezi River. This full-day adventure includes comprehensive safety briefing, professional guides, and a celebratory lunch. Experience the ultimate adrenaline rush as you tackle some of the most challenging rapids in the world.',
    'Grade 5 rapids adventure below Victoria Falls',
    2, -- Adventure Activities
    6,
    12,
    4,
    'challenging',
    'images/adventure-activities/white-water-rafting.jpg',
    'Safety equipment, professional guides, lunch, transport, safety briefing',
    'Personal items, photos, gratuities',
    'Must be able to swim, minimum age 15, good physical condition required',
    'High Water Mark - Batoka Gorge',
    'active',
    TRUE
),
(
    'Mosi-oa-Tunya National Park Safari',
    'mosi-oa-tunya-safari',
    'Explore Zambias premier wildlife park with excellent chances to see white rhinos, elephants, zebras, and over 400 bird species. This morning game drive takes you through diverse habitats including riverine forest and open grasslands, offering spectacular views of Victoria Falls.',
    'Wildlife safari with rhino encounters and Victoria Falls views',
    3, -- Wildlife Safaris
    4,
    8,
    2,
    'moderate',
    'images/wildlife-safaris/mosi-oa-tunya-safari.jpg',
    'Transport, professional guide, park fees, refreshments, binoculars',
    'Meals, personal expenses, additional park activities',
    'Suitable for all ages, walking involved',
    'Park Headquarters',
    'active',
    TRUE
),
(
    'Cultural Village Experience',
    'cultural-village-tour',
    'Immerse yourself in authentic Zambian culture with visits to local villages, traditional craft demonstrations, and sampling of local cuisine. Learn about local customs, traditions, and the daily life of rural communities while supporting sustainable tourism initiatives.',
    'Authentic Zambian cultural immersion with village visits',
    4, -- Cultural Tours
    5,
    15,
    3,
    'easy',
    'images/cultural-tours/village-experience.jpg',
    'Transport, guide, traditional lunch, craft demonstrations, cultural performances',
    'Personal purchases, additional donations, gratuities',
    'Respectful dress code required, comfortable walking shoes',
    'Cultural Center',
    'active',
    TRUE
);

-- Insert sample rates for all tours
-- Low season rates (January-May)
INSERT INTO rates (tour_id, season, adult_price, child_price, group_discount_percent, valid_from, valid_to) VALUES
(1, 'low', 45.00, 25.00, 10.00, '2024-01-15', '2024-05-31'),
(2, 'low', 125.00, 85.00, 15.00, '2024-01-15', '2024-05-31'),
(3, 'low', 75.00, 35.00, 12.00, '2024-01-15', '2024-05-31'),
(4, 'low', 55.00, 25.00, 8.00, '2024-01-15', '2024-05-31');

-- High season rates (June-October)  
INSERT INTO rates (tour_id, season, adult_price, child_price, group_discount_percent, valid_from, valid_to) VALUES
(1, 'high', 65.00, 35.00, 10.00, '2024-06-01', '2024-10-31'),
(2, 'high', 165.00, 115.00, 15.00, '2024-06-01', '2024-10-31'),
(3, 'high', 95.00, 45.00, 12.00, '2024-06-01', '2024-10-31'),
(4, 'high', 75.00, 35.00, 8.00, '2024-06-01', '2024-10-31');

-- Peak season rates (November-January)
INSERT INTO rates (tour_id, season, adult_price, child_price, group_discount_percent, valid_from, valid_to) VALUES
(1, 'peak', 85.00, 45.00, 8.00, '2024-11-01', '2025-01-14'),
(2, 'peak', 195.00, 135.00, 12.00, '2024-11-01', '2025-01-14'),
(3, 'peak', 115.00, 55.00, 10.00, '2024-11-01', '2025-01-14'),
(4, 'peak', 95.00, 45.00, 5.00, '2024-11-01', '2025-01-14');

-- Sample booking inquiry
INSERT INTO booking_inquiries (
    tour_id, customer_name, customer_email, customer_phone,
    preferred_date, participants_adult, participants_child,
    message, status
) VALUES
(
    1, 'John Smith', 'john.smith@example.com', '+1-555-0123',
    '2024-07-15', 2, 1,
    'Looking forward to the sunset cruise. Are vegetarian snacks available?',
    'pending'
);