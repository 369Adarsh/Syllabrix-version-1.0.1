-- Migration 076: Add full_name column to users table
-- Stores the user's real full name entered at registration (separate from auto-generated username)

ALTER TABLE users ADD COLUMN full_name VARCHAR(100) NULL AFTER username;
