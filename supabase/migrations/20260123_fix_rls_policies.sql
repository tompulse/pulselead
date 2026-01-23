-- =====================================================
-- FIX RLS POLICIES - user_quotas et user_unlocked_prospects
-- =====================================================

-- 1. Enable RLS on user_quotas
ALTER TABLE user_quotas ENABLE ROW LEVEL SECURITY;

-- 2. Enable RLS on user_unlocked_prospects
ALTER TABLE user_unlocked_prospects ENABLE ROW LEVEL SECURITY;

-- 3. Policies for user_quotas
-- Users can read their own quotas
CREATE POLICY "Users can view own quotas" ON user_quotas
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own quotas (for is_first_login flag)
CREATE POLICY "Users can update own quotas" ON user_quotas
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can insert their own quotas (fallback)
CREATE POLICY "Users can insert own quotas" ON user_quotas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Service role can do anything (for triggers and functions)
CREATE POLICY "Service role can manage all quotas" ON user_quotas
  FOR ALL USING (true);

-- 4. Policies for user_unlocked_prospects
-- Users can read their own unlocked prospects
CREATE POLICY "Users can view own unlocked prospects" ON user_unlocked_prospects
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own unlocked prospects
CREATE POLICY "Users can insert own unlocked prospects" ON user_unlocked_prospects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Service role can do anything
CREATE POLICY "Service role can manage all unlocked prospects" ON user_unlocked_prospects
  FOR ALL USING (true);

-- 5. Grant permissions to authenticated users
GRANT SELECT, UPDATE, INSERT ON user_quotas TO authenticated;
GRANT SELECT, INSERT ON user_unlocked_prospects TO authenticated;

-- 6. Grant all permissions to service_role
GRANT ALL ON user_quotas TO service_role;
GRANT ALL ON user_unlocked_prospects TO service_role;

COMMENT ON POLICY "Users can view own quotas" ON user_quotas IS 'Users can read their own quota information';
COMMENT ON POLICY "Users can update own quotas" ON user_quotas IS 'Users can update is_first_login flag when choosing a plan';
