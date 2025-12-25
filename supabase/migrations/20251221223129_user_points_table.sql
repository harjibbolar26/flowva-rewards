CREATE TABLE public.user_points (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  points_balance INTEGER DEFAULT 0 NOT NULL,
  total_points_earned INTEGER DEFAULT 0 NOT NULL,
  total_points_spent INTEGER DEFAULT 0 NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);