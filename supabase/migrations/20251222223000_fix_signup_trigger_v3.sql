/* Fix for signup trigger - v3
 Combines referral logic with robust trigger definition */

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  ref_code TEXT;
  referrer_user_id UUID;
  referral_id UUID;
  user_email TEXT;
  user_full_name TEXT;
BEGIN
  /* Generate referral code */
  ref_code := public.generate_referral_code();
  
  /* Handle null email (fallback) */
  user_email := NEW.email;
  IF user_email IS NULL THEN
    user_email := 'unknown-' || NEW.id;
  END IF;

  /* Extract full name from metadata */
  user_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'user_name',
    ''
  );
  
  /* Insert profile */
  INSERT INTO public.profiles (id, email, full_name, referral_code)
  VALUES (NEW.id, user_email, user_full_name, ref_code);
  
  /* Initialize points */
  INSERT INTO public.user_points (user_id, points_balance, total_points_earned, total_points_spent)
  VALUES (NEW.id, 0, 0, 0);
  
  /* Initialize streak */
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
      
      /* Create completed referral  */
      INSERT INTO public.referrals (referrer_id, referred_id, points_awarded, is_completed, completed_at)
      VALUES (referrer_user_id, NEW.id, 25, TRUE, NOW())
      RETURNING id INTO referral_id;
      
      /* Award to referrer  */
      UPDATE public.user_points
      SET 
        points_balance = points_balance + 25,
        total_points_earned = total_points_earned + 25
      WHERE user_id = referrer_user_id;
      
      /* Award to new user  */
      UPDATE public.user_points
      SET 
        points_balance = points_balance + 25,
        total_points_earned = total_points_earned + 25
      WHERE user_id = NEW.id;
      
      /* Log transactions  */
      INSERT INTO public.points_transactions 
        (user_id, points_change, transaction_type, reference_id, description)
      VALUES 
        (referrer_user_id, 25, 'referral', referral_id, 'Referral bonus'),
        (NEW.id, 25, 'referral_bonus', referral_id, 'Welcome bonus');
    END IF;
  END IF;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  /* Log error (visible in Supabase logs) */
  RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
  /* Re-raise to fail the transaction so the user knows something went wrong */
  RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

/* Explicitly set search_path for the function */
ALTER FUNCTION public.handle_new_user() SET search_path = public;
