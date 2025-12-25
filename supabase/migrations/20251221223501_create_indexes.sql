CREATE INDEX idx_user_points_user_id ON public.user_points(user_id);
CREATE INDEX idx_daily_checkins_user_date ON public.daily_checkins(user_id, checkin_date);
CREATE INDEX idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_referred ON public.referrals(referred_id);
CREATE INDEX idx_transactions_user_id ON public.points_transactions(user_id);
CREATE INDEX idx_redemptions_user_id ON public.reward_redemptions(user_id);