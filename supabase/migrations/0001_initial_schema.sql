-- supabase/migrations/0001_initial_schema.sql

-- Tiers Table
CREATE TABLE tiers (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    item_limit INT NOT NULL,
    image_limit INT NOT NULL
);

-- Profiles Table
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tier_id BIGINT REFERENCES tiers(id),
    full_name TEXT
);

-- Stamps Table
CREATE TABLE stamps (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    purchase_price DECIMAL(10, 2),
    sale_price DECIMAL(10, 2)
);

-- Stamp Images Table
CREATE TABLE stamp_images (
    id BIGSERIAL PRIMARY KEY,
    stamp_id BIGINT REFERENCES stamps(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    is_thumbnail BOOLEAN DEFAULT FALSE
);

-- Seed Tiers Data
INSERT INTO tiers (name, item_limit, image_limit) VALUES
('free', 50, 100),
('paid', 5000, 10000);

-- Function to create a profile for a new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  free_tier_id BIGINT;
BEGIN
  -- Get the ID of the 'free' tier
  SELECT id INTO free_tier_id FROM public.tiers WHERE name = 'free' LIMIT 1;

  -- Insert a new profile for the new user with the free tier
  INSERT INTO public.profiles (id, tier_id)
  VALUES (new.id, free_tier_id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create a profile when a new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

