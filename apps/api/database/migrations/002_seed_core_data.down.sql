-- Migration: 002_seed_core_data.down.sql
-- Created: 2026-03-16
-- Purpose: Revert baseline seed records from 002_seed_core_data.up.sql

START TRANSACTION;

DELETE FROM audit_logs
WHERE entity_type = 'system'
  AND entity_id = 'core_data_v1';

DELETE FROM reviews
WHERE comment = 'SEED_REVIEW_001';

DELETE FROM invoices
WHERE invoice_number = 'INV-SEED-0001';

DELETE FROM payments
WHERE provider_reference = 'txn_seed_booking_001';

DELETE FROM bookings
WHERE notes = 'SEED_BOOKING_001';

DELETE FROM subscriptions
WHERE provider_reference = 'sub_seed_exec_001';

DELETE FROM fleet_vehicles
WHERE vehicle_plate = 'SEED-001-AC'
  AND company_id = 1;

DELETE FROM customers
WHERE notes = 'SEED_CUSTOMER_001'
   OR user_id IN (
      SELECT id FROM users
      WHERE email IN (
          'customer@seed.aldens-autocare.local'
      )
   );

DELETE FROM services
WHERE slug IN ('basic-wash', 'premium-detailing', 'ceramic-coating');

DELETE FROM companies
WHERE email = 'fleet@seed.aldens-autocare.local';

DELETE FROM users
WHERE email IN (
    'admin@seed.aldens-autocare.local',
    'customer@seed.aldens-autocare.local',
    'manager@seed.aldens-autocare.local',
    'staff@seed.aldens-autocare.local'
);

DELETE FROM plans
WHERE code IN ('essential', 'premium', 'executive');

COMMIT;
