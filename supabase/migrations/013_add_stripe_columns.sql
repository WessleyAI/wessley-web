-- 013_add_stripe_columns.sql - Add Stripe integration columns to profiles
--
-- Adds columns needed for Stripe subscription management:
-- - stripe_customer_id: Stripe customer ID (cus_xxx)
-- - stripe_subscription_id: Active subscription ID (sub_xxx)
--
-- Also updates subscription_status to support 'past_due' for payment failures.

-- Add Stripe customer ID column
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE;

-- Add Stripe subscription ID column
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT UNIQUE;

-- Update subscription_status CHECK constraint to include 'past_due'
-- First drop the existing constraint if it exists
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_subscription_status_check;

-- Add updated constraint with 'past_due' status
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_subscription_status_check
CHECK (subscription_status IN ('active', 'inactive', 'expired', 'trial', 'past_due'));

-- Create indexes for efficient webhook lookups by Stripe IDs
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id
ON public.profiles(stripe_customer_id)
WHERE stripe_customer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription_id
ON public.profiles(stripe_subscription_id)
WHERE stripe_subscription_id IS NOT NULL;

-- Add column comments for documentation
COMMENT ON COLUMN public.profiles.stripe_customer_id IS
'Stripe Customer ID (cus_xxx) - created when user first subscribes';

COMMENT ON COLUMN public.profiles.stripe_subscription_id IS
'Stripe Subscription ID (sub_xxx) - active subscription, null if cancelled';
