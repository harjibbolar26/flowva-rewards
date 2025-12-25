/* Fix for claim_daily_points logic */
/* Handles NULL last_checkin_date correctly (first check-in) */

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
  
  /* Update streak logic */
  IF last_checkin IS NULL THEN
    /* First ever check-in */
    current_streak_val := 1;
  ELSIF last_checkin = yesterday THEN
    /* Consecutive day */
    current_streak_val := current_streak_val + 1;
  ELSIF last_checkin < yesterday THEN
    /* Streak broken */
    current_streak_val := 1;
  ELSE
    /* Should not happen if "Already claimed today" check works, but safe fallback */
    current_streak_val := current_streak_val; 
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
