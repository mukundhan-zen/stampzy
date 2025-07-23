
-- Create the profiles table to store user-specific data
CREATE TABLE public.profiles (
  id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  tier TEXT DEFAULT '''free''' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.profiles IS 'Stores public-facing profile information for each user.';

-- Create the stamps table for collection items
CREATE TABLE public.stamps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  purchase_date DATE,
  cost NUMERIC(10, 2),
  seller TEXT,
  currency VARCHAR(3),
  image_url TEXT,
  thumbnail_url TEXT,
  status TEXT DEFAULT '''owned''' NOT NULL, -- e.g., 'owned', 'sold'
  created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.stamps IS 'Stores individual stamp records for user collections.';
CREATE INDEX stamps_user_id_idx ON public.stamps(user_id);

-- Create the sales table to track sold items
CREATE TABLE public.sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stamp_id uuid NOT NULL REFERENCES public.stamps(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sale_date DATE NOT NULL,
  sale_price NUMERIC(10, 2) NOT NULL,
  buyer TEXT,
  profit_loss NUMERIC(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.sales IS 'Tracks sales details and profit/loss for sold items.';
CREATE INDEX sales_user_id_idx ON public.sales(user_id);
CREATE INDEX sales_stamp_id_idx ON public.sales(stamp_id);

-- Create the budgets table for user spending limits
CREATE TABLE public.budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  limit_type TEXT NOT NULL, -- e.g., 'monthly', 'yearly'
  amount NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, limit_type)
);
COMMENT ON TABLE public.budgets IS 'Stores user-defined spending budgets.';
CREATE INDEX budgets_user_id_idx ON public.budgets(user_id);

-- Set up Row-Level Security (RLS) policies
-- RLS ensures that users can only access their own data.

-- Enable RLS for all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stamps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- Policies for 'profiles' table
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policies for 'stamps' table
CREATE POLICY "Users can view their own stamps" ON public.stamps
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own stamps" ON public.stamps
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own stamps" ON public.stamps
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own stamps" ON public.stamps
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for 'sales' table
CREATE POLICY "Users can view their own sales" ON public.sales
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own sales" ON public.sales
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sales" ON public.sales
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own sales" ON public.sales
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for 'budgets' table
CREATE POLICY "Users can view their own budgets" ON public.budgets
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own budgets" ON public.budgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own budgets" ON public.budgets
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own budgets" ON public.budgets
  FOR DELETE USING (auth.uid() = user_id);

-- Automatically create a profile for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
