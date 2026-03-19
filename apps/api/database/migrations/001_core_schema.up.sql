-- Migration: 001_core_schema.up.sql
-- Created: 2026-03-16
-- SQL Dialect: MySQL 8+

SET NAMES utf8mb4;

-- -----------------------------------------------------------------------------
-- USERS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
    full_name      VARCHAR(120) NOT NULL,
    email          VARCHAR(150) NOT NULL,
    phone          VARCHAR(25),
    password_hash  VARCHAR(255) NOT NULL,
    role           ENUM('customer', 'staff', 'admin', 'company_admin') NOT NULL DEFAULT 'customer',
    status         ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
    created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email (email),
    KEY idx_users_role_status (role, status)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- COMPANIES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS companies (
    id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
    company_name  VARCHAR(180) NOT NULL,
    contact_name  VARCHAR(120),
    email         VARCHAR(150),
    phone         VARCHAR(25),
    address       VARCHAR(255),
    status        ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_companies_email (email),
    KEY idx_companies_status (status)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- PLANS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS plans (
    id                          INT UNSIGNED NOT NULL AUTO_INCREMENT,
    code                        VARCHAR(60) NOT NULL,
    name                        VARCHAR(120) NOT NULL,
    description                 TEXT,
    monthly_price               DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    yearly_price                DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    max_bookings_per_month      INT UNSIGNED,
    allows_priority_booking     TINYINT(1) NOT NULL DEFAULT 0,
    allows_premium_services     TINYINT(1) NOT NULL DEFAULT 0,
    allows_fleet_dashboard      TINYINT(1) NOT NULL DEFAULT 0,
    is_active                   TINYINT(1) NOT NULL DEFAULT 1,
    created_at                  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_plans_code (code),
    KEY idx_plans_active (is_active)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- CUSTOMERS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
    id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id          INT UNSIGNED NOT NULL,
    default_address  VARCHAR(255),
    notes            TEXT,
    created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_customers_user_id (user_id),
    CONSTRAINT fk_customers_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- FLEET VEHICLES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fleet_vehicles (
    id                INT UNSIGNED NOT NULL AUTO_INCREMENT,
    company_id        INT UNSIGNED NOT NULL,
    vehicle_plate     VARCHAR(40) NOT NULL,
    vehicle_type      VARCHAR(60) NOT NULL,
    vehicle_make      VARCHAR(80),
    vehicle_model     VARCHAR(80),
    service_level     ENUM('essential', 'premium', 'executive') NOT NULL DEFAULT 'essential',
    status            ENUM('active', 'inactive', 'retired') NOT NULL DEFAULT 'active',
    created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_fleet_company_plate (company_id, vehicle_plate),
    KEY idx_fleet_company_status (company_id, status),
    CONSTRAINT fk_fleet_company
        FOREIGN KEY (company_id) REFERENCES companies (id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- SERVICES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS services (
    id                INT UNSIGNED NOT NULL AUTO_INCREMENT,
    slug              VARCHAR(120) NOT NULL,
    name              VARCHAR(150) NOT NULL,
    description       TEXT,
    base_price        DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    duration_minutes  INT UNSIGNED NOT NULL,
    is_active         TINYINT(1) NOT NULL DEFAULT 1,
    created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_services_slug (slug),
    KEY idx_services_active (is_active)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- BOOKINGS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bookings (
    id                INT UNSIGNED NOT NULL AUTO_INCREMENT,
    customer_id       INT UNSIGNED NOT NULL,
    company_id        INT UNSIGNED,
    service_id        INT UNSIGNED NOT NULL,
    vehicle_type      VARCHAR(60) NOT NULL,
    vehicle_plate     VARCHAR(40),
    service_address   VARCHAR(255) NOT NULL,
    scheduled_date    DATE NOT NULL,
    scheduled_time    TIME NOT NULL,
    status            ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')
                      NOT NULL DEFAULT 'pending',
    payment_status    ENUM('unpaid', 'paid', 'refunded', 'failed')
                      NOT NULL DEFAULT 'unpaid',
    booking_source    ENUM('web', 'mobile', 'admin', 'phone') NOT NULL DEFAULT 'web',
    assigned_staff_id INT UNSIGNED,
    notes             TEXT,
    created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_bookings_customer_date (customer_id, scheduled_date),
    KEY idx_bookings_company_date (company_id, scheduled_date),
    KEY idx_bookings_status (status),
    KEY idx_bookings_payment_status (payment_status),
    CONSTRAINT fk_bookings_customer
        FOREIGN KEY (customer_id) REFERENCES customers (id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_bookings_company
        FOREIGN KEY (company_id) REFERENCES companies (id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_bookings_service
        FOREIGN KEY (service_id) REFERENCES services (id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_bookings_assigned_staff
        FOREIGN KEY (assigned_staff_id) REFERENCES users (id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- SUBSCRIPTIONS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subscriptions (
    id                    INT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id               INT UNSIGNED NOT NULL,
    company_id            INT UNSIGNED,
    plan_id               INT UNSIGNED NOT NULL,
    status                ENUM('active', 'trialing', 'past_due', 'paused', 'cancelled', 'expired')
                          NOT NULL DEFAULT 'active',
    billing_cycle         ENUM('monthly', 'yearly') NOT NULL DEFAULT 'monthly',
    start_date            DATE NOT NULL,
    renewal_date          DATE NOT NULL,
    cancel_at_period_end  TINYINT(1) NOT NULL DEFAULT 0,
    provider              ENUM('paystack', 'manual') NOT NULL DEFAULT 'paystack',
    provider_reference    VARCHAR(150),
    created_at            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_subscriptions_user_status (user_id, status),
    KEY idx_subscriptions_company_status (company_id, status),
    KEY idx_subscriptions_renewal_date (renewal_date),
    CONSTRAINT fk_subscriptions_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_subscriptions_company
        FOREIGN KEY (company_id) REFERENCES companies (id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_subscriptions_plan
        FOREIGN KEY (plan_id) REFERENCES plans (id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- PAYMENTS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
    id                  INT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id             INT UNSIGNED NOT NULL,
    booking_id          INT UNSIGNED,
    subscription_id     INT UNSIGNED,
    provider            ENUM('paystack', 'manual') NOT NULL DEFAULT 'paystack',
    provider_reference  VARCHAR(150) NOT NULL,
    amount              DECIMAL(12, 2) NOT NULL,
    currency            CHAR(3) NOT NULL DEFAULT 'NGN',
    status              ENUM('pending', 'success', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
    payment_type        ENUM('booking', 'subscription') NOT NULL,
    paid_at             DATETIME,
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_payments_provider_reference (provider_reference),
    KEY idx_payments_user_status (user_id, status),
    KEY idx_payments_booking (booking_id),
    KEY idx_payments_subscription (subscription_id),
    CONSTRAINT fk_payments_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_payments_booking
        FOREIGN KEY (booking_id) REFERENCES bookings (id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_payments_subscription
        FOREIGN KEY (subscription_id) REFERENCES subscriptions (id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- INVOICES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS invoices (
    id                  INT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id             INT UNSIGNED NOT NULL,
    company_id          INT UNSIGNED,
    booking_id          INT UNSIGNED,
    subscription_id     INT UNSIGNED,
    invoice_number      VARCHAR(80) NOT NULL,
    amount              DECIMAL(12, 2) NOT NULL,
    status              ENUM('draft', 'issued', 'paid', 'void', 'overdue') NOT NULL DEFAULT 'issued',
    issued_at           DATETIME NOT NULL,
    due_at              DATETIME,
    paid_at             DATETIME,
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_invoices_invoice_number (invoice_number),
    KEY idx_invoices_user_status (user_id, status),
    KEY idx_invoices_company_status (company_id, status),
    CONSTRAINT fk_invoices_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_invoices_company
        FOREIGN KEY (company_id) REFERENCES companies (id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_invoices_booking
        FOREIGN KEY (booking_id) REFERENCES bookings (id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_invoices_subscription
        FOREIGN KEY (subscription_id) REFERENCES subscriptions (id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- REVIEWS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
    id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
    customer_id  INT UNSIGNED NOT NULL,
    booking_id   INT UNSIGNED NOT NULL,
    rating       TINYINT UNSIGNED NOT NULL,
    comment      TEXT,
    created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_reviews_booking_id (booking_id),
    KEY idx_reviews_customer_created (customer_id, created_at),
    CONSTRAINT fk_reviews_customer
        FOREIGN KEY (customer_id) REFERENCES customers (id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_reviews_booking
        FOREIGN KEY (booking_id) REFERENCES bookings (id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_reviews_rating CHECK (rating BETWEEN 1 AND 5)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- AUDIT LOGS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    actor_user_id  INT UNSIGNED,
    action         VARCHAR(120) NOT NULL,
    entity_type    VARCHAR(80) NOT NULL,
    entity_id      VARCHAR(80) NOT NULL,
    metadata_json  JSON,
    created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_audit_actor_created (actor_user_id, created_at),
    KEY idx_audit_entity (entity_type, entity_id),
    CONSTRAINT fk_audit_actor
        FOREIGN KEY (actor_user_id) REFERENCES users (id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;
