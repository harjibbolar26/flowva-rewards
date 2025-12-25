CREATE TABLE public.points_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  points_change INTEGER NOT NULL,
  transaction_type TEXT NOT NULL, /* 'daily_checkin', 'referral', 'redemption', 'bonus' */
  reference_id UUID, /* Links to related record (checkin, referral, redemption) */
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);