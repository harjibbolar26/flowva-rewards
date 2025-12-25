/* Enable pgcrypto for gen_random_uuid() if not already enabled */
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

/* Update handle_new_user to be more robust and capture full_name */
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  ref_code TEXT;
  referrer_user_id UUID;
  user_email TEXT;
  user_full_name TEXT;
BEGIN
  /* Generate referral code */
  ref_code := generate_referral_code();
  
  /* Handle null email (fallback) */
  user_email := NEW.email;
  IF user_email IS NULL THEN
    user_email := 'unknown-' || NEW.id;
  END IF;

  /* Extract full name from metadata */
  user_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'user_name'
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
  
  /* Handle referral if exists in metadata */
  IF NEW.raw_user_meta_data->>'referred_by' IS NOT NULL THEN
    SELECT id INTO referrer_user_id
    FROM public.profiles
    WHERE referral_code = NEW.raw_user_meta_data->>'referred_by';
    
    IF referrer_user_id IS NOT NULL THEN
      /*  Update profile with referrer */
      UPDATE public.profiles
      SET referred_by = referrer_user_id
      WHERE id = NEW.id;
      
      /*  Create referral record */
      INSERT INTO public.referrals (referrer_id, referred_id, points_awarded)
      VALUES (referrer_user_id, NEW.id, 25);
    END IF;
  END IF;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  /* Re-raise error to ensure transaction fails and we don't end up with a broken user */
  RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
