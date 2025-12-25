/* Enable Row Level Security */
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_transactions ENABLE ROW LEVEL SECURITY;

/* RLS Policies for profiles */
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

/* RLS Policies for user_points */
CREATE POLICY "Users can view their own points"
  ON public.user_points FOR SELECT
  USING (auth.uid() = user_id);

/* RLS Policies for daily_checkins */
CREATE POLICY "Users can view their own checkins"
  ON public.daily_checkins FOR SELECT
  USING (auth.uid() = user_id);

/* RLS Policies for user_streaks */
CREATE POLICY "Users can view their own streaks"
  ON public.user_streaks FOR SELECT
  USING (auth.uid() = user_id);

/* RLS Policies for referrals */
CREATE POLICY "Users can view their referrals"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

/* RLS Policies for rewards (public read) */
CREATE POLICY "Anyone can view active rewards"
  ON public.rewards FOR SELECT
  USING (is_active = TRUE);

/* RLS Policies for redemptions */
CREATE POLICY "Users can view their own redemptions"
  ON public.reward_redemptions FOR SELECT
  USING (auth.uid() = user_id);

/* RLS Policies for transactions */
CREATE POLICY "Users can view their own transactions"
  ON public.points_transactions FOR SELECT
  USING (auth.uid() = user_id);