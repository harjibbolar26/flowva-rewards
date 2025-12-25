CREATE TABLE public.daily_checkins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  checkin_date DATE NOT NULL,
  points_awarded INTEGER DEFAULT 5 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, checkin_date)
);