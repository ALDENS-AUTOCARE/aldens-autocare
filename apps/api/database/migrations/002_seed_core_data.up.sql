-- Migration: 002_seed_core_data.up.sql
-- Created: 2026-03-16
-- Purpose: Seed baseline plans and sample data for local development

START TRANSACTION;

INSERT INTO plans (
    id,
    code,
    name,
    description,
    monthly_price,
    yearly_price,
    max_bookings_per_month,
    allows_priority_booking,
    allows_premium_services,
    allows_fleet_dashboard,
    is_active,
    created_at,
    updated_at
)
VALUES
    (1, 'essential', 'Essential', 'Starter care plan for single vehicle owners.', 15000.00, 150000.00, 4, 0, 0, 0, 1, NOW(), NOW()),
    (2, 'premium', 'Premium', 'Enhanced care plan with premium services.', 35000.00, 350000.00, 12, 1, 1, 0, 1, NOW(), NOW()),
    (3, 'executive', 'Executive', 'Enterprise-level plan with fleet analytics.', 75000.00, 750000.00, 50, 1, 1, 1, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    description = VALUES(description),
    monthly_price = VALUES(monthly_price),
    yearly_price = VALUES(yearly_price),
    max_bookings_per_month = VALUES(max_bookings_per_month),
    allows_priority_booking = VALUES(allows_priority_booking),
    allows_premium_services = VALUES(allows_premium_services),
    allows_fleet_dashboard = VALUES(allows_fleet_dashboard),
    is_active = VALUES(is_active),
    updated_at = NOW();

INSERT INTO users (
    id,
    full_name,
    email,
    phone,
    password_hash,
    role,
    status,
    created_at,
    updated_at
)
VALUES
    (1, 'Aldens Admin', 'admin@seed.aldens-autocare.local', '+2348000000001', 'seed_hash_change_me', 'admin', 'active', NOW(), NOW()),
    (2, 'Kemi Customer', 'customer@seed.aldens-autocare.local', '+2348000000002', 'seed_hash_change_me', 'customer', 'active', NOW(), NOW()),
    (3, 'Fleet Manager', 'manager@seed.aldens-autocare.local', '+2348000000003', 'seed_hash_change_me', 'company_admin', 'active', NOW(), NOW()),
    (4, 'Service Staff', 'staff@seed.aldens-autocare.local', '+2348000000004', 'seed_hash_change_me', 'staff', 'active', NOW(), NOW())
ON DUPLICATE KEY UPDATE
    full_name = VALUES(full_name),
    phone = VALUES(phone),
    password_hash = VALUES(password_hash),
    role = VALUES(role),
    status = VALUES(status),
    updated_at = NOW();

INSERT INTO companies (
    id,
    company_name,
    contact_name,
    email,
    phone,
    address,
    status,
    created_at,
    updated_at
)
VALUES
    (1, 'Seed Fleet Company', 'Fleet Manager', 'fleet@seed.aldens-autocare.local', '+2348000000099', '12 Seed Avenue, Ikeja', 'active', NOW(), NOW())
ON DUPLICATE KEY UPDATE
    company_name = VALUES(company_name),
    contact_name = VALUES(contact_name),
    phone = VALUES(phone),
    address = VALUES(address),
    status = VALUES(status),
    updated_at = NOW();

INSERT INTO customers (
    id,
    user_id,
    default_address,
    notes,
    created_at,
    updated_at
)
VALUES
    (1, 2, '34 Seed Street, Yaba', 'SEED_CUSTOMER_001', NOW(), NOW())
ON DUPLICATE KEY UPDATE
    default_address = VALUES(default_address),
    notes = VALUES(notes),
    updated_at = NOW();

INSERT INTO fleet_vehicles (
    id,
    company_id,
    vehicle_plate,
    vehicle_type,
    vehicle_make,
    vehicle_model,
    service_level,
    status,
    created_at,
    updated_at
)
VALUES
    (1, 1, 'SEED-001-AC', 'SUV', 'Toyota', 'Prado', 'executive', 'active', NOW(), NOW())
ON DUPLICATE KEY UPDATE
    vehicle_type = VALUES(vehicle_type),
    vehicle_make = VALUES(vehicle_make),
    vehicle_model = VALUES(vehicle_model),
    service_level = VALUES(service_level),
    status = VALUES(status),
    updated_at = NOW();

INSERT INTO services (
    id,
    slug,
    name,
    description,
    base_price,
    duration_minutes,
    is_active,
    created_at,
    updated_at
)
VALUES
    (1, 'basic-wash', 'Basic Wash', 'Exterior wash and quick interior cleanup.', 12000.00, 45, 1, NOW(), NOW()),
    (2, 'premium-detailing', 'Premium Detailing', 'Full detailing package for luxury finish.', 45000.00, 120, 1, NOW(), NOW()),
    (3, 'ceramic-coating', 'Ceramic Coating', 'High-protection ceramic coating treatment.', 120000.00, 240, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    description = VALUES(description),
    base_price = VALUES(base_price),
    duration_minutes = VALUES(duration_minutes),
    is_active = VALUES(is_active),
    updated_at = NOW();

INSERT INTO subscriptions (
    id,
    user_id,
    company_id,
    plan_id,
    status,
    billing_cycle,
    start_date,
    renewal_date,
    cancel_at_period_end,
    provider,
    provider_reference,
    created_at,
    updated_at
)
VALUES
    (1, 3, 1, 3, 'active', 'monthly', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 MONTH), 0, 'paystack', 'sub_seed_exec_001', NOW(), NOW())
ON DUPLICATE KEY UPDATE
    status = VALUES(status),
    billing_cycle = VALUES(billing_cycle),
    start_date = VALUES(start_date),
    renewal_date = VALUES(renewal_date),
    cancel_at_period_end = VALUES(cancel_at_period_end),
    provider = VALUES(provider),
    updated_at = NOW();

INSERT INTO bookings (
    id,
    customer_id,
    company_id,
    service_id,
    vehicle_type,
    vehicle_plate,
    service_address,
    scheduled_date,
    scheduled_time,
    status,
    payment_status,
    booking_source,
    assigned_staff_id,
    notes,
    created_at,
    updated_at
)
VALUES
    (1, 1, 1, 1, 'SUV', 'SEED-001-AC', '34 Seed Street, Yaba', DATE_ADD(CURDATE(), INTERVAL 1 DAY), '10:00:00', 'completed', 'paid', 'web', 4, 'SEED_BOOKING_001', NOW(), NOW())
ON DUPLICATE KEY UPDATE
    service_id = VALUES(service_id),
    service_address = VALUES(service_address),
    scheduled_date = VALUES(scheduled_date),
    scheduled_time = VALUES(scheduled_time),
    status = VALUES(status),
    payment_status = VALUES(payment_status),
    booking_source = VALUES(booking_source),
    assigned_staff_id = VALUES(assigned_staff_id),
    notes = VALUES(notes),
    updated_at = NOW();

INSERT INTO payments (
    id,
    user_id,
    booking_id,
    subscription_id,
    provider,
    provider_reference,
    amount,
    currency,
    status,
    payment_type,
    paid_at,
    created_at,
    updated_at
)
VALUES
    (1, 2, 1, NULL, 'paystack', 'txn_seed_booking_001', 12000.00, 'NGN', 'success', 'booking', NOW(), NOW(), NOW())
ON DUPLICATE KEY UPDATE
    amount = VALUES(amount),
    currency = VALUES(currency),
    status = VALUES(status),
    payment_type = VALUES(payment_type),
    paid_at = VALUES(paid_at),
    updated_at = NOW();

INSERT INTO invoices (
    id,
    user_id,
    company_id,
    booking_id,
    subscription_id,
    invoice_number,
    amount,
    status,
    issued_at,
    due_at,
    paid_at,
    created_at,
    updated_at
)
VALUES
    (1, 2, 1, 1, NULL, 'INV-SEED-0001', 12000.00, 'paid', NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), NOW(), NOW(), NOW())
ON DUPLICATE KEY UPDATE
    amount = VALUES(amount),
    status = VALUES(status),
    issued_at = VALUES(issued_at),
    due_at = VALUES(due_at),
    paid_at = VALUES(paid_at),
    updated_at = NOW();

INSERT INTO reviews (
    id,
    customer_id,
    booking_id,
    rating,
    comment,
    created_at
)
VALUES
    (1, 1, 1, 5, 'SEED_REVIEW_001', NOW())
ON DUPLICATE KEY UPDATE
    rating = VALUES(rating),
    comment = VALUES(comment);

INSERT INTO audit_logs (
    id,
    actor_user_id,
    action,
    entity_type,
    entity_id,
    metadata_json,
    created_at
)
VALUES
    (1, 1, 'seed.initialize', 'system', 'core_data_v1', JSON_OBJECT('source', '002_seed_core_data.up.sql'), NOW())
ON DUPLICATE KEY UPDATE
    metadata_json = VALUES(metadata_json),
    created_at = VALUES(created_at);

COMMIT;
