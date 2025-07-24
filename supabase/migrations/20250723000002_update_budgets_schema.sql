
BEGIN;

-- 1. Create ENUM type for budget intervals if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'budget_interval') THEN
        CREATE TYPE public.budget_interval AS ENUM ('weekly', 'monthly', 'quarterly', 'yearly');
    END IF;
END$$;

-- 2. Add new columns, making them nullable for the transition
ALTER TABLE public.budgets
  ADD COLUMN IF NOT EXISTS "interval" public.budget_interval,
  ADD COLUMN IF NOT EXISTS "start_date" DATE,
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMPTZ;

-- 3. Populate the new `interval` column from the old `limit_type`
-- This assumes limit_type contains values that can be cast to the enum.
UPDATE public.budgets
SET "interval" = lower("limit_type")::public.budget_interval
WHERE "interval" IS NULL;

-- 4. Populate the `start_date` for existing records.
-- Sets it to the first day of the month of creation as a default.
UPDATE public.budgets
SET "start_date" = date_trunc('month', created_at)::date
WHERE "start_date" IS NULL;

-- 5. Set default for updated_at
UPDATE public.budgets
SET "updated_at" = NOW()
WHERE "updated_at" IS NULL;


-- 6. Now that columns are populated, make them NOT NULL
ALTER TABLE public.budgets
  ALTER COLUMN "interval" SET NOT NULL,
  ALTER COLUMN "start_date" SET NOT NULL,
  ALTER COLUMN "updated_at" SET NOT NULL;


-- 7. Drop the old unique constraint and the `limit_type` column if they exist
DO $$
BEGIN
    IF EXISTS(SELECT 1 FROM pg_constraint WHERE conname = 'budgets_user_id_limit_type_key') THEN
        ALTER TABLE public.budgets DROP CONSTRAINT budgets_user_id_limit_type_key;
    END IF;
    IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='budgets' AND column_name='limit_type') THEN
        ALTER TABLE public.budgets DROP COLUMN limit_type;
    END IF;
END$$;


-- 8. Add new unique constraint
ALTER TABLE public.budgets
  ADD CONSTRAINT budgets_user_id_interval_start_date_key UNIQUE (user_id, interval, start_date);

-- 9. Add trigger for `updated_at`
CREATE TRIGGER set_budgets_timestamp
BEFORE UPDATE ON public.budgets
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();

COMMENT ON TABLE public.budgets IS 'Stores user-defined spending budgets for specific periods.';
COMMENT ON COLUMN public.budgets.interval IS 'The frequency of the budget cycle.';
COMMENT ON COLUMN public.budgets.start_date IS 'The start date of the budget period.';

COMMIT;
