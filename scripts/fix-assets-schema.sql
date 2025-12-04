-- Fix assets table schema to handle large market cap values
-- Run this on your Aiven database AFTER restore

USE defaultdb;

-- Increase precision for financial columns to handle trillion-dollar market caps
ALTER TABLE assets
  MODIFY COLUMN `marketCapUsd` DECIMAL(30,8) NOT NULL,
  MODIFY COLUMN `volumeUsd24Hr` DECIMAL(30,8) DEFAULT NULL,
  MODIFY COLUMN `supply` DECIMAL(30,8) NOT NULL,
  MODIFY COLUMN `maxSupply` DECIMAL(30,8) DEFAULT NULL;

-- Verify changes
DESCRIBE assets;
