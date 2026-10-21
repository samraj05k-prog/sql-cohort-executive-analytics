-- =====================================================================
-- ObsidianPulse Analytics: MariaDB Database Schema & Seed Data
-- Target Database: enterprise_retail_db
-- Target User: dev_user / DevPassword123!
-- =====================================================================

CREATE DATABASE IF NOT EXISTS enterprise_retail_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'dev_user'@'localhost' IDENTIFIED BY 'DevPassword123!';
GRANT ALL PRIVILEGES ON enterprise_retail_db.* TO 'dev_user'@'localhost';
FLUSH PRIVILEGES;

USE enterprise_retail_db;

-- 1. Customers Table
CREATE TABLE IF NOT EXISTS customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(150) NOT NULL,
    contact_name VARCHAR(100) NOT NULL,
    contact_title VARCHAR(80) NOT NULL,
    contact_email VARCHAR(120) NOT NULL UNIQUE,
    state VARCHAR(50) NOT NULL,
    country VARCHAR(10) NOT NULL DEFAULT 'US',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_state (state),
    INDEX idx_company (company_name)
) ENGINE=InnoDB;

-- 2. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    order_date DATE NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    order_status ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'REFUNDED') DEFAULT 'COMPLETED',
    fulfillment_rate DECIMAL(5,2) DEFAULT 100.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_order_date_status (order_date, order_status),
    INDEX idx_customer (customer_id),
    CONSTRAINT fk_customer_orders FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Seed Customers
INSERT INTO customers (customer_id, company_name, contact_name, contact_title, contact_email, state, country) VALUES
(1, 'Novus Vantage Global', 'Sarah Lin', 'VP Ops', 'contact@novus-vantage.com', 'CA', 'US'),
(2, 'Apex Prime Synthetics', 'Marcus Vance', 'Dir. Supply', 'procure@apexprime.co', 'NY', 'US'),
(3, 'Helios Cloud Systems', 'Elena Rostova', 'CRO', 'finances@helios-cloud.io', 'TX', 'US'),
(4, 'Krypton Logistics Intl', 'David Chen', 'Head of Procurement', 'api-team@krypton-intl.com', 'WA', 'US'),
(5, 'OmniData Foundry', 'Lisa Sterling', 'VP Analytics', 'accounts@omnidata.io', 'IL', 'US'),
(6, 'Stratosphere Corp', 'Robert Thorne', 'COO', 'enterprise@stratosphere.tech', 'MA', 'US'),
(7, 'Vortex Energy Solutions', 'Claire Dupont', 'Supply Director', 'c.dupont@vortex-energy.com', 'CO', 'US'),
(8, 'Aegis Biotech Laboratories', 'Dr. Julian Walsh', 'Principal Investigator', 'lab-supplies@aegis-bio.org', 'NC', 'US'),
(9, 'Zenith Quantum Corp', 'Maya Patel', 'Technical Director', 'procurement@zenith-quantum.io', 'WA', 'US'),
(10, 'Pulsefire Robotics', 'Kenji Sato', 'Operations Lead', 'orders@pulsefire-robotics.jp', 'CA', 'US')
ON DUPLICATE KEY UPDATE company_name=VALUES(company_name);

-- Seed Orders
INSERT INTO orders (customer_id, order_date, total_amount, order_status) VALUES
(1, '2024-01-15', 38200.00, 'COMPLETED'),
(1, '2024-03-20', 84200.00, 'COMPLETED'),
(1, '2024-07-12', 124500.00, 'COMPLETED'),
(1, '2024-11-05', 236010.00, 'COMPLETED'),
(2, '2024-02-14', 45000.00, 'COMPLETED'),
(2, '2024-06-18', 112000.00, 'COMPLETED'),
(2, '2024-10-22', 237120.00, 'COMPLETED'),
(3, '2024-04-10', 89000.00, 'COMPLETED'),
(3, '2024-08-19', 115000.00, 'COMPLETED'),
(3, '2024-12-01', 137890.00, 'COMPLETED'),
(4, '2024-03-12', 65000.00, 'COMPLETED'),
(4, '2024-09-15', 214540.00, 'COMPLETED'),
(5, '2024-05-18', 78600.00, 'COMPLETED'),
(5, '2024-11-20', 140000.00, 'COMPLETED'),
(6, '2024-06-25', 92400.00, 'COMPLETED'),
(6, '2024-10-14', 100000.00, 'COMPLETED'),
(7, '2024-04-05', 85320.00, 'COMPLETED'),
(7, '2024-08-11', 80000.00, 'COMPLETED'),
(8, '2024-07-21', 142100.00, 'COMPLETED'),
(9, '2024-09-30', 118450.00, 'COMPLETED'),
(10, '2024-10-05', 89200.00, 'COMPLETED');
