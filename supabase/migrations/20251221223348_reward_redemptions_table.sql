CREATE TABLE public.reward_redemptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reward_id UUID REFERENCES public.rewards(id) NOT NULL,
  points_spent INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL, /* 'pending', 'processing', 'completed', 'failed  ' */
  redemption_data JSONB, /* Store delivery details */
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);