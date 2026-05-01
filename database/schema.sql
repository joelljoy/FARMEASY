-- FRAM EASY - MySQL Schema
-- Run this to initialize database (optional; JPA can create tables with ddl-auto: update.)

CREATE DATABASE IF NOT EXISTS frameasy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE frameasy;

-- Roles
CREATE TABLE IF NOT EXISTS roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    location VARCHAR(500),
    latitude DOUBLE,
    longitude DOUBLE,
    preferred_language VARCHAR(10) DEFAULT 'en',
    farm_size VARCHAR(100),
    equipment_owned TEXT,
    land_details TEXT,
    address TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User-Role mapping (many-to-many)
CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- OTP Verification
CREATE TABLE IF NOT EXISTS otp_verification (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(10) NOT NULL,
    purpose VARCHAR(50) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_otp_email (email),
    INDEX idx_otp_expires (expires_at)
);

-- Equipment listings
CREATE TABLE IF NOT EXISTS equipment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price_per_day DECIMAL(12,2) NOT NULL,
    image_url VARCHAR(500),
    category VARCHAR(100),
    availability VARCHAR(50),
    location VARCHAR(500),
    latitude DOUBLE,
    longitude DOUBLE,
    is_approved BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_equipment_location (latitude, longitude),
    INDEX idx_equipment_category (category)
);

-- Land listings
CREATE TABLE IF NOT EXISTS land (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price_per_month DECIMAL(12,2) NOT NULL,
    image_url VARCHAR(500),
    area VARCHAR(100),
    location VARCHAR(500),
    latitude DOUBLE,
    longitude DOUBLE,
    is_approved BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_land_location (latitude, longitude)
);

-- Trade (crops)
CREATE TABLE IF NOT EXISTS trade (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    crop_name VARCHAR(255) NOT NULL,
    description TEXT,
    price_per_unit DECIMAL(12,2) NOT NULL,
    unit VARCHAR(50),
    quantity VARCHAR(100),
    image_url VARCHAR(500),
    location VARCHAR(500),
    latitude DOUBLE,
    longitude DOUBLE,
    is_approved BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_trade_location (latitude, longitude)
);

-- Government schemes (cached)
CREATE TABLE IF NOT EXISTS schemes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    external_id VARCHAR(255),
    title VARCHAR(500),
    summary TEXT,
    eligibility TEXT,
    timeline VARCHAR(500),
    state VARCHAR(100),
    official_url VARCHAR(500),
    raw_json TEXT,
    fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_schemes_state (state),
    INDEX idx_schemes_fetched (fetched_at)
);

-- Agreements (equipment/land/trade deals)
CREATE TABLE IF NOT EXISTS agreements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    agreement_type VARCHAR(50) NOT NULL,
    reference_id BIGINT NOT NULL,
    seller_id BIGINT NOT NULL,
    buyer_id BIGINT NOT NULL,
    buyer_name VARCHAR(255),
    final_price DECIMAL(12,2) NOT NULL,
    due_date DATE,
    terms TEXT,
    pdf_path VARCHAR(500),
    signed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(id),
    FOREIGN KEY (buyer_id) REFERENCES users(id),
    INDEX idx_agreements_seller (seller_id),
    INDEX idx_agreements_buyer (buyer_id)
);

-- Chat messages (WebSocket / real-time)
CREATE TABLE IF NOT EXISTS chat_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sender_id BIGINT NOT NULL,
    receiver_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    related_type VARCHAR(50),
    related_id BIGINT,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_chat_pair (sender_id, receiver_id),
    INDEX idx_chat_related (related_type, related_id)
);

-- Seed roles
INSERT IGNORE INTO roles (name) VALUES ('ROLE_FARMER'), ('ROLE_CUSTOMER'), ('ROLE_ADMIN');
select * from users;
