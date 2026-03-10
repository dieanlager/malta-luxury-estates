-- MALTA LUXURY ESTATES — PLAN LIMITS ENFORCEMENT (BACKEND)
-- Run this in your Supabase SQL Editor

-- 1. Create the enforcement function
CREATE OR REPLACE FUNCTION check_listing_limit()
RETURNS TRIGGER AS $$
DECLARE
  v_plan         TEXT;
  v_count        INTEGER;
  v_limit        INTEGER;
BEGIN
  -- Get agency plan
  SELECT plan INTO v_plan FROM public.agencies WHERE id = NEW.agency_id;

  -- Define limits based on plan
  v_limit := CASE v_plan
    WHEN 'basic'    THEN 10
    WHEN 'pro'      THEN 100
    WHEN 'featured' THEN 2147483647 -- Effectively unlimited
    ELSE 10 -- Default to basic
  END;

  -- Count current active listings (exclude the one being updated)
  SELECT COUNT(*) INTO v_count
  FROM public.properties
  WHERE agency_id = NEW.agency_id
    AND status IN ('active', 'paused', 'draft')
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);

  -- Check if limit exceeded
  IF v_count >= v_limit THEN
    RAISE EXCEPTION 'PLAN_LIMIT_EXCEEDED|%|%|%', v_plan, v_limit, v_count
    USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Attach the trigger to properties table
DROP TRIGGER IF EXISTS enforce_listing_limit ON public.properties;
CREATE TRIGGER enforce_listing_limit
  BEFORE INSERT OR UPDATE OF status ON public.properties
  FOR EACH ROW
  WHEN (NEW.status IN ('active', 'paused', 'draft'))
  EXECUTE FUNCTION check_listing_limit();

-- 3. Monitoring View for Admin
CREATE OR REPLACE VIEW agency_plan_usage AS
SELECT
  a.id, 
  a.name, 
  a.email, 
  a.plan,
  COUNT(p.id)::int AS listing_count,
  CASE a.plan 
    WHEN 'basic' THEN 10 
    WHEN 'pro' THEN 100 
    ELSE NULL 
  END AS listing_limit,
  CASE a.plan
    WHEN 'featured' THEN NULL
    ELSE ROUND(COUNT(p.id)::NUMERIC / 
      NULLIF(CASE a.plan WHEN 'basic' THEN 10 WHEN 'pro' THEN 100 ELSE 100 END, 0) * 100, 1)
  END AS usage_percent
FROM public.agencies a
LEFT JOIN public.properties p 
  ON p.agency_id = a.id AND p.status IN ('active', 'paused', 'draft')
GROUP BY a.id, a.name, a.email, a.plan;
