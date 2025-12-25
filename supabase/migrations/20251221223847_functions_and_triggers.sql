/* Function to generate unique referral code */
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    code := LOWER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE referral_code = code) INTO exists;
    EXIT WHEN NOT exists;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

/* Function to handle new user signup */
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  ref_code TEXT;
  referrer_user_id UUID;
BEGIN
  /* Generate referral code */
  ref_code := generate_referral_code();
  
  /* Insert profile */
  INSERT INTO public.profiles (id, email, referral_code)
  VALUES (NEW.id, NEW.email, ref_code);
  
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
      /* Update profile with referrer */
      UPDATE public.profiles
      SET referred_by = referrer_user_id
      WHERE id = NEW.id;
      
      /* Create referral record */
      INSERT INTO public.referrals (referrer_id, referred_id, points_awarded)
      VALUES (referrer_user_id, NEW.id, 25);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

/* Trigger for new user */
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

/* Function to complete referral and award points */
CREATE OR REPLACE FUNCTION public.complete_referral(referred_user_id UUID)
RETURNS VOID AS $$
DECLARE
  referral_record RECORD;
BEGIN
  /* Get the referral record */
  SELECT * INTO referral_record
  FROM public.referrals
  WHERE referred_id = referred_user_id AND is_completed = FALSE;
  
  IF FOUND THEN
    /* Mark referral as completed */
    UPDATE public.referrals
    SET is_completed = TRUE, completed_at = NOW()
    WHERE id = referral_record.id;
    
    /* Award points to referrer */
    UPDATE public.user_points
    SET 
      points_balance = points_balance + referral_record.points_awarded,
      total_points_earned = total_points_earned + referral_record.points_awarded
    WHERE user_id = referral_record.referrer_id;
    
    /* Log transaction */
    INSERT INTO public.points_transactions 
      (user_id, points_change, transaction_type, reference_id, description)
    VALUES 
      (referral_record.referrer_id, referral_record.points_awarded, 'referral', 
       referral_record.id, 'Referral bonus');
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

/* Function to claim daily points */
CREATE OR REPLACE FUNCTION public.claim_daily_points(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  today DATE := CURRENT_DATE;
  yesterday DATE := CURRENT_DATE - INTERVAL '1 day';
  last_checkin DATE;
  current_streak_val INTEGER;
  points_to_award INTEGER := 5;
  checkin_id UUID;
  result JSONB;
BEGIN
  /* Check if already claimed today */
  IF EXISTS (
    SELECT 1 FROM public.daily_checkins 
    WHERE user_id = p_user_id AND checkin_date = today
  ) THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'Already claimed today'
    );
  END IF;
  
  /* Get last checkin date and current streak */
  SELECT last_checkin_date, current_streak INTO last_checkin, current_streak_val
  FROM public.user_streaks
  WHERE user_id = p_user_id;
  
  /* Update streak */
  IF last_checkin = yesterday THEN
    current_streak_val := current_streak_val + 1;
  ELSIF last_checkin < yesterday THEN
    current_streak_val := 1;
  END IF;
  
  /* Insert daily checkin */
  INSERT INTO public.daily_checkins (user_id, checkin_date, points_awarded)
  VALUES (p_user_id, today, points_to_award)
  RETURNING id INTO checkin_id;
  
  /* Update points */
  UPDATE public.user_points
  SET 
    points_balance = points_balance + points_to_award,
    total_points_earned = total_points_earned + points_to_award
  WHERE user_id = p_user_id;
  
  /* Update streak */
  UPDATE public.user_streaks
  SET 
    current_streak = current_streak_val,
    longest_streak = GREATEST(longest_streak, current_streak_val),
    last_checkin_date = today
  WHERE user_id = p_user_id;
  
  /* Log transaction */
  INSERT INTO public.points_transactions 
    (user_id, points_change, transaction_type, reference_id, description)
  VALUES 
    (p_user_id, points_to_award, 'daily_checkin', checkin_id, 'Daily check-in bonus');
  
  RETURN jsonb_build_object(
    'success', TRUE,
    'points_awarded', points_to_award,
    'new_streak', current_streak_val
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

/* Function to redeem reward */
CREATE OR REPLACE FUNCTION public.redeem_reward(
  p_user_id UUID,
  p_reward_id UUID,
  p_redemption_data JSONB
)
RETURNS JSONB AS $$
DECLARE
  user_points_balance INTEGER;
  reward_points INTEGER;
  redemption_id UUID;
BEGIN
  /* Get user's points balance */
  SELECT points_balance INTO user_points_balance
  FROM public.user_points
  WHERE user_id = p_user_id;
  
  /* Get reward points required */
  SELECT points_required INTO reward_points
  FROM public.rewards
  WHERE id = p_reward_id AND is_active = TRUE AND is_coming_soon = FALSE;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'Reward not available'
    );
  END IF;
  
  /* Check if user has enough points */
  IF user_points_balance < reward_points THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'Insufficient points'
    );
  END IF;
  
  /* Create redemption record */
  INSERT INTO public.reward_redemptions 
    (user_id, reward_id, points_spent, status, redemption_data)
  VALUES 
    (p_user_id, p_reward_id, reward_points, 'pending', p_redemption_data)
  RETURNING id INTO redemption_id;
  
  /* Deduct points */
  UPDATE public.user_points
  SET 
    points_balance = points_balance - reward_points,
    total_points_spent = total_points_spent + reward_points
  WHERE user_id = p_user_id;
  
  /* Log transaction */
  INSERT INTO public.points_transactions 
    (user_id, points_change, transaction_type, reference_id, description)
  VALUES 
    (p_user_id, -reward_points, 'redemption', redemption_id, 'Reward redemption');
  
  RETURN jsonb_build_object(
    'success', TRUE,
    'redemption_id', redemption_id,
    'points_spent', reward_points
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

/* Insert default rewards */
INSERT INTO public.rewards (name, description, points_required, reward_type, value_amount, is_active) VALUES
('$5 Bank Transfer', 'The $5 equivalent will be transferred to your bank account.', 5000, 'bank_transfer', 5.00, TRUE),
('$5 PayPal International', 'Receive a $5 PayPal balance transfer directly to your PayPal account email.', 5000, 'paypal', 5.00, TRUE),
('$5 Virtual Visa Card', 'Use your $5 prepaid card to shop anywhere Visa is accepted online.', 5000, 'visa_card', 5.00, TRUE),
('$5 Apple Gift Card', 'Redeem this $5 Apple Gift Card for apps, games, music, movies, and more on the App Store and iTunes.', 5000, 'gift_card', 5.00, TRUE),
('$5 Google Play Card', 'Use this $5 Google Play Gift Card to purchase apps, games, movies, books on the Google Play Store.', 5000, 'gift_card', 5.00, TRUE),
('$5 Amazon Gift Card', 'Get a $5 digital gift card to spend on your favorite tools or platforms.', 5000, 'gift_card', 5.00, TRUE),
('$10 Amazon Gift Card', 'Get a $10 digital gift card to spend on your favorite tools or platforms.', 10000, 'gift_card', 10.00, TRUE),
('Free Udemy Course', 'Get access to a free Udemy course of your choice.', 0, 'course', 0.00, TRUE);

/* Update the last reward to be coming soon */
UPDATE public.rewards SET is_coming_soon = TRUE WHERE name = 'Free Udemy Course';