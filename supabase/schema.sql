-- ============================================
-- GreenPot · Golf Charity Platform
-- Supabase SQL Schema
--
-- Safe to run fresh. Idempotent (IF NOT EXISTS +
-- DROP IF EXISTS guards on all policies/triggers).
--
-- Fixes applied:
--   1. profiles table created FIRST, then is_admin()
--      function — fixes "relation does not exist" error
--   2. is_admin() SECURITY DEFINER helper — eliminates
--      infinite recursion in RLS policies
--   3. profiles_charity_id_fkey explicit FK constraint —
--      fixes PGRST200 join error in PostgREST
--   4. ON CONFLICT (id) DO NOTHING in handle_new_user
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES (extends auth.users)
-- Table must exist BEFORE is_admin() function.
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT,
  avatar_url    TEXT,
  handicap      INT DEFAULT 0,
  plan          TEXT DEFAULT 'free' CHECK (plan IN ('free','monthly','yearly')),
  plan_status   TEXT DEFAULT 'inactive' CHECK (plan_status IN ('active','inactive','cancelled','lapsed')),
  plan_start    TIMESTAMPTZ,
  plan_end      TIMESTAMPTZ,
  charity_id    UUID,  -- FK added below after charities table exists
  charity_pct   INT DEFAULT 10 CHECK (charity_pct >= 10 AND charity_pct <= 100),
  is_admin      BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ADMIN HELPER FUNCTION
-- Defined AFTER profiles table exists.
-- SECURITY DEFINER bypasses RLS so policies that
-- call this never trigger recursive lookups.
-- ============================================
CREATE OR REPLACE FUNCTION public.is_admin(uid uuid)
RETURNS boolean AS $$
  SELECT COALESCE(is_admin, false) FROM public.profiles WHERE id = uid;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Drop policies so script is re-runnable
DROP POLICY IF EXISTS "Users view own profile"     ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile"   ON public.profiles;
DROP POLICY IF EXISTS "Admins view all profiles"   ON public.profiles;
DROP POLICY IF EXISTS "Admins update all profiles" ON public.profiles;

CREATE POLICY "Users view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Uses helper function — no recursive subquery
CREATE POLICY "Admins view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.is_admin(auth.uid()));


-- Auto-create profile row when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================
-- CHARITIES
-- ============================================
CREATE TABLE IF NOT EXISTS public.charities (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  description   TEXT,
  logo_url      TEXT,
  website       TEXT,
  category      TEXT,
  is_featured   BOOLEAN DEFAULT false,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.charities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active charities" ON public.charities;
DROP POLICY IF EXISTS "Admins manage charities"          ON public.charities;

CREATE POLICY "Anyone can view active charities"
  ON public.charities FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins manage charities"
  ON public.charities FOR ALL
  USING (public.is_admin(auth.uid()));


-- Seed charities (skips rows that already exist)
INSERT INTO public.charities (name, slug, description, category, is_featured)
SELECT 'Cancer Research UK','cancer-research-uk',
       'Funding life-saving cancer research across the UK and beyond.','Health',true
WHERE NOT EXISTS (SELECT 1 FROM public.charities WHERE slug = 'cancer-research-uk');

INSERT INTO public.charities (name, slug, description, category, is_featured)
SELECT 'Macmillan Cancer Support','macmillan-cancer-support',
       'Supporting people living with cancer through treatment and beyond.','Health',false
WHERE NOT EXISTS (SELECT 1 FROM public.charities WHERE slug = 'macmillan-cancer-support');

INSERT INTO public.charities (name, slug, description, category, is_featured)
SELECT 'British Heart Foundation','british-heart-foundation',
       'Fighting heart and circulatory diseases through research and care.','Health',true
WHERE NOT EXISTS (SELECT 1 FROM public.charities WHERE slug = 'british-heart-foundation');

INSERT INTO public.charities (name, slug, description, category, is_featured)
SELECT 'RSPCA','rspca',
       'Preventing cruelty and promoting kindness to animals everywhere.','Animals',false
WHERE NOT EXISTS (SELECT 1 FROM public.charities WHERE slug = 'rspca');

INSERT INTO public.charities (name, slug, description, category, is_featured)
SELECT 'Oxfam','oxfam',
       'Fighting poverty and injustice across the world.','International',false
WHERE NOT EXISTS (SELECT 1 FROM public.charities WHERE slug = 'oxfam');

INSERT INTO public.charities (name, slug, description, category, is_featured)
SELECT 'Age UK','age-uk',
       'Providing love, support and charity to older people in the UK.','Social',false
WHERE NOT EXISTS (SELECT 1 FROM public.charities WHERE slug = 'age-uk');

INSERT INTO public.charities (name, slug, description, category, is_featured)
SELECT 'Mind','mind',
       'Mental health support for everyone, everywhere.','Mental Health',true
WHERE NOT EXISTS (SELECT 1 FROM public.charities WHERE slug = 'mind');

INSERT INTO public.charities (name, slug, description, category, is_featured)
SELECT 'Save the Children','save-the-children',
       'Giving children the chance to reach their potential.','Children',false
WHERE NOT EXISTS (SELECT 1 FROM public.charities WHERE slug = 'save-the-children');


-- ============================================
-- PROFILES → CHARITIES FOREIGN KEY
-- Added after charities table exists.
-- Named constraint lets PostgREST resolve the join
-- unambiguously (fixes PGRST200 error).
-- ============================================
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_charity_id_fkey;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_charity_id_fkey
  FOREIGN KEY (charity_id) REFERENCES public.charities(id) ON DELETE SET NULL;


-- ============================================
-- SCORES
-- ============================================
CREATE TABLE IF NOT EXISTS public.scores (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  score         INT NOT NULL CHECK (score >= 1 AND score <= 45),
  played_at     DATE NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own scores" ON public.scores;
DROP POLICY IF EXISTS "Admins view all scores"  ON public.scores;

CREATE POLICY "Users manage own scores"
  ON public.scores FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins view all scores"
  ON public.scores FOR SELECT
  USING (public.is_admin(auth.uid()));


-- Rolling 5-score limit enforced at DB level
CREATE OR REPLACE FUNCTION public.enforce_score_limit()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.scores
  WHERE id IN (
    SELECT id FROM public.scores
    WHERE user_id = NEW.user_id
    ORDER BY played_at DESC, created_at DESC
    OFFSET 5
  );
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS after_score_insert ON public.scores;
CREATE TRIGGER after_score_insert
  AFTER INSERT ON public.scores
  FOR EACH ROW EXECUTE FUNCTION public.enforce_score_limit();


-- ============================================
-- DRAWS
-- ============================================
CREATE TABLE IF NOT EXISTS public.draws (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  month           TEXT NOT NULL,  -- e.g. "2026-03"
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending','simulated','published')),
  draw_type       TEXT DEFAULT 'random' CHECK (draw_type IN ('random','algorithmic')),
  winning_numbers INT[] NOT NULL,
  jackpot_amount  NUMERIC(10,2) DEFAULT 0,
  pool_4match     NUMERIC(10,2) DEFAULT 0,
  pool_3match     NUMERIC(10,2) DEFAULT 0,
  total_entries   INT DEFAULT 0,
  jackpot_rolled  BOOLEAN DEFAULT false,
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.draws ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view published draws" ON public.draws;
DROP POLICY IF EXISTS "Admins manage draws"             ON public.draws;

CREATE POLICY "Anyone can view published draws"
  ON public.draws FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admins manage draws"
  ON public.draws FOR ALL
  USING (public.is_admin(auth.uid()));


-- ============================================
-- DRAW ENTRIES (score snapshot per draw per user)
-- ============================================
CREATE TABLE IF NOT EXISTS public.draw_entries (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_id       UUID NOT NULL REFERENCES public.draws(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  scores        INT[] NOT NULL,
  match_count   INT DEFAULT 0,
  prize_tier    TEXT CHECK (prize_tier IN ('jackpot','4match','3match',null)),
  prize_amount  NUMERIC(10,2),
  verified      BOOLEAN DEFAULT false,
  paid          BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.draw_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own entries" ON public.draw_entries;
DROP POLICY IF EXISTS "Admins manage entries"  ON public.draw_entries;

CREATE POLICY "Users view own entries"
  ON public.draw_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins manage entries"
  ON public.draw_entries FOR ALL
  USING (public.is_admin(auth.uid()));


-- ============================================
-- SUBSCRIPTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan          TEXT NOT NULL CHECK (plan IN ('monthly','yearly')),
  amount        NUMERIC(10,2) NOT NULL,
  status        TEXT DEFAULT 'active' CHECK (status IN ('active','cancelled','expired')),
  stripe_id     TEXT,
  started_at    TIMESTAMPTZ DEFAULT now(),
  ends_at       TIMESTAMPTZ
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins manage subscriptions"  ON public.subscriptions;

CREATE POLICY "Users view own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins manage subscriptions"
  ON public.subscriptions FOR ALL
  USING (public.is_admin(auth.uid()));


-- ============================================
-- ANALYTICS VIEW (admin use)
-- ============================================
CREATE OR REPLACE VIEW public.admin_analytics AS
SELECT
  (SELECT COUNT(*)                 FROM public.profiles      WHERE plan_status = 'active') AS active_subscribers,
  (SELECT COUNT(*)                 FROM public.profiles)                                    AS total_users,
  (SELECT COALESCE(SUM(amount), 0) FROM public.subscriptions WHERE status = 'active')      AS total_revenue,
  (SELECT COUNT(*)                 FROM public.draws          WHERE status = 'published')   AS total_draws,
  (SELECT COUNT(*)                 FROM public.charities      WHERE is_active = true)       AS active_charities;
