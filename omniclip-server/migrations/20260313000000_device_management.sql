-- 20260313000000_device_management.sql

-- Add max_allowed_devices and role to users
ALTER TABLE users ADD COLUMN max_allowed_devices INT NOT NULL DEFAULT 2;
ALTER TABLE users ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'user';

-- Insert the default super_admin if there isn't one already
INSERT INTO users (email, password_hash, role)
VALUES ('jsuunykhan2@gmail.com', '$2b$12$K899k1P5P0eUo3A.z09ZlOE5h6lP3i6W1B.eN4A0sTkF0bE87n9vS', 'super_admin') -- password: tanpura123@@ 
ON CONFLICT (email) DO UPDATE SET role = 'super_admin';

-- Create devices table
CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    os VARCHAR(255) NOT NULL,
    last_sync TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, device_id)
);

-- Create promo_codes table
CREATE TABLE promo_codes (
    code VARCHAR(255) PRIMARY KEY,
    device_boost_count INT NOT NULL,
    usage_limit INT NOT NULL DEFAULT 1,
    times_used INT NOT NULL DEFAULT 0,
    expiry_date TIMESTAMPTZ
);
