CREATE TABLE public.user_streaks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  current_streak INTEGER DEFAULT 0 NOT NULL,
  longest_streak INTEGER DEFAULT 0 NOT NULL,
  last_checkin_date DATE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);