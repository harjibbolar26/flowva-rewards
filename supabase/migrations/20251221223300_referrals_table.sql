CREATE TABLE public.referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  referred_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  points_awarded INTEGER DEFAULT 25 NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(referred_id)
);