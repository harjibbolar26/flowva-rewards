/* Drop old trigger */
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

/* Updated function */
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  ref_code TEXT;
  referrer_user_id UUID;
  referral_id UUID;
BEGIN
  ref_code := generate_referral_code();
  
  INSERT INTO public.profiles (id, email, referral_code)
  VALUES (NEW.id, NEW.email, ref_code);
  
  INSERT INTO public.user_points (user_id, points_balance, total_points_earned, total_points_spent)
  VALUES (NEW.id, 0, 0, 0);
  
  INSERT INTO public.user_streaks (user_id, current_streak, longest_streak)
  VALUES (NEW.id, 0, 0);
  
  /* Handle referral */
  IF NEW.raw_user_meta_data->>'referred_by' IS NOT NULL THEN
    SELECT id INTO referrer_user_id
    FROM public.profiles
    WHERE referral_code = NEW.raw_user_meta_data->>'referred_by';
    
    IF referrer_user_id IS NOT NULL THEN
      UPDATE public.profiles
      SET referred_by = referrer_user_id
      WHERE id = NEW.id;
      
      /* Create completed referral */
      INSERT INTO public.referrals (referrer_id, referred_id, points_awarded, is_completed, completed_at)
      VALUES (referrer_user_id, NEW.id, 25, TRUE, NOW())
      RETURNING id INTO referral_id;
      
      /* Award to referrer */
      UPDATE public.user_points
      SET 
        points_balance = points_balance + 25,
        total_points_earned = total_points_earned + 25
      WHERE user_id = referrer_user_id;
      
      /* Award to new user */
      UPDATE public.user_points
      SET 
        points_balance = points_balance + 25,
        total_points_earned = total_points_earned + 25
      WHERE user_id = NEW.id;
      
      /* Log transactions */
      INSERT INTO public.points_transactions 
        (user_id, points_change, transaction_type, reference_id, description)
      VALUES 
        (referrer_user_id, 25, 'referral', referral_id, 'Referral bonus'),
        (NEW.id, 25, 'referral_bonus', referral_id, 'Welcome bonus');
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

/* Recreate trigger */
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();