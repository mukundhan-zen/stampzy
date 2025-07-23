-- Add valuation and updated_at columns to the stamps table
ALTER TABLE public.stamps
ADD COLUMN valuation NUMERIC(10, 2),
ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update the updated_at column on stamps table update
CREATE TRIGGER set_stamps_timestamp
BEFORE UPDATE ON public.stamps
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();

COMMENT ON COLUMN public.stamps.valuation IS 'The estimated value of the stamp.';

-- Create the stamp_images table
CREATE TABLE public.stamp_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stamp_id uuid NOT NULL REFERENCES public.stamps(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_type TEXT NOT NULL, -- 'thumbnail' or 'full'
  file_size_kb INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);

COMMENT ON TABLE public.stamp_images IS 'Stores images associated with each stamp, supporting tiered access.';
CREATE INDEX stamp_images_stamp_id_idx ON public.stamp_images(stamp_id);
CREATE INDEX stamp_images_user_id_idx ON public.stamp_images(user_id);

-- Remove old image columns from stamps table to normalize the data
ALTER TABLE public.stamps
DROP COLUMN image_url,
DROP COLUMN thumbnail_url;

-- Set up Row-Level Security (RLS) for the new stamp_images table
ALTER TABLE public.stamp_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own stamp images" ON public.stamp_images
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stamp images" ON public.stamp_images
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stamp images" ON public.stamp_images
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stamp images" ON public.stamp_images
  FOR DELETE USING (auth.uid() = user_id);
