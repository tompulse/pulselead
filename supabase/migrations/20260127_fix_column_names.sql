-- Migration: Fix column names in user_quotas table
-- Date: 2026-01-27
-- Description: Ensure correct column names match code expectations

-- 1. Add prospects_unlocked_count if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'user_quotas' 
    AND column_name = 'prospects_unlocked_count'
  ) THEN
    ALTER TABLE user_quotas ADD COLUMN prospects_unlocked_count int DEFAULT 0;
  END IF;
END $$;

-- 2. Add tournees_created_count if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'user_quotas' 
    AND column_name = 'tournees_created_count'
  ) THEN
    ALTER TABLE user_quotas ADD COLUMN tournees_created_count int DEFAULT 0;
  END IF;
END $$;

-- 3. Remove old columns if they exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'user_quotas' 
    AND column_name = 'unlocked_prospects_count'
  ) THEN
    -- Copy data before dropping
    EXECUTE 'UPDATE user_quotas SET prospects_unlocked_count = COALESCE(unlocked_prospects_count, 0)';
    ALTER TABLE user_quotas DROP COLUMN unlocked_prospects_count;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'user_quotas' 
    AND column_name = 'tournees_created_this_month'
  ) THEN
    -- Copy data before dropping
    EXECUTE 'UPDATE user_quotas SET tournees_created_count = COALESCE(tournees_created_this_month, 0)';
    ALTER TABLE user_quotas DROP COLUMN tournees_created_this_month;
  END IF;
END $$;

-- 2. Ensure all existing users have correct default values
UPDATE user_quotas 
SET 
  prospects_unlocked_count = COALESCE(prospects_unlocked_count, 0),
  tournees_created_count = COALESCE(tournees_created_count, 0)
WHERE prospects_unlocked_count IS NULL 
   OR tournees_created_count IS NULL;

-- 3. Show final structure for verification
SELECT 
  column_name, 
  data_type, 
  column_default
FROM information_schema.columns
WHERE table_name = 'user_quotas'
ORDER BY ordinal_position;

COMMENT ON COLUMN user_quotas.prospects_unlocked_count IS 'Number of prospects unlocked by FREE user (max 30)';
COMMENT ON COLUMN user_quotas.tournees_created_count IS 'Number of tournees created this month by FREE user (max 2, resets monthly)';
