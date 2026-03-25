-- ============================================
-- GreenPot · Dev Reset
-- Drops everything cleanly, then run schema.sql
-- ============================================

-- Triggers first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS after_score_insert   ON public.scores;

-- Views
DROP VIEW IF EXISTS public.admin_analytics;

-- Tables in dependency order (also drops their RLS policies)
DROP TABLE IF EXISTS public.draw_entries  CASCADE;
DROP TABLE IF EXISTS public.draws         CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.scores        CASCADE;
DROP TABLE IF EXISTS public.profiles      CASCADE;
DROP TABLE IF EXISTS public.charities     CASCADE;

-- Functions last — CASCADE drops any remaining dependents
DROP FUNCTION IF EXISTS public.handle_new_user()    CASCADE;
DROP FUNCTION IF EXISTS public.enforce_score_limit() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin(uuid)        CASCADE;
