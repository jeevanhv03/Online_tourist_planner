-- ============================================
-- Online Tourist Planner - MySQL Schema
-- ============================================

CREATE DATABASE IF NOT EXISTS tourist_planner_db;
USE tourist_planner_db;

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(20) UNIQUE NOT NULL
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(120) NOT NULL,
    phone VARCHAR(20),
    address VARCHAR(100),
    created_at DATETIME,
    is_active BOOLEAN DEFAULT TRUE
);

-- User-Roles mapping
CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
    vehicle_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    vehicle_type VARCHAR(50) NOT NULL,
    capacity INT NOT NULL,
    mileage DOUBLE,
    charge_per_km DOUBLE NOT NULL,
    misc_charges DOUBLE DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE'
);

-- Packages table
CREATE TABLE IF NOT EXISTS packages (
    package_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    destination_name VARCHAR(100) NOT NULL,
    number_of_days INT NOT NULL,
    number_of_nights INT NOT NULL,
    package_capacity INT NOT NULL,
    price DOUBLE NOT NULL,
    food_details TEXT,
    accommodation_details TEXT,
    sightseeing_details TEXT,
    description TEXT,
    image_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    booking_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    package_id BIGINT NOT NULL,
    vehicle_id BIGINT NOT NULL,
    travel_start_date DATE NOT NULL,
    travel_end_date DATE NOT NULL,
    booking_date DATETIME,
    passenger_count INT NOT NULL,
    total_amount DOUBLE NOT NULL,
    booking_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    payment_status VARCHAR(20) DEFAULT 'PENDING',
    special_requests TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (package_id) REFERENCES packages(package_id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id)
);

-- Vehicle Schedules (to track bookings per vehicle per date range)
CREATE TABLE IF NOT EXISTS vehicle_schedules (
    schedule_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id BIGINT NOT NULL,
    package_id BIGINT,
    booking_id BIGINT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    notes TEXT,
    created_at DATETIME,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id),
    FOREIGN KEY (package_id) REFERENCES packages(package_id),
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id)
);

-- ============================================
-- NOTE: Hibernate will create/update these tables
-- automatically via spring.jpa.hibernate.ddl-auto=update
-- This schema can be used for manual reference.
-- ============================================
