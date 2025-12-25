/* Create table to track stack shares */
CREATE TABLE IF NOT EXISTS public.stack_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  stack_content TEXT NOT NULL,
  share_link TEXT NOT NULL,
  platform TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

/* Enable RLS */
ALTER TABLE public.stack_shares ENABLE ROW LEVEL SECURITY;

/* Policy: Users can view their own shares */
CREATE POLICY "Users can view own stack shares"
  ON public.stack_shares
  FOR SELECT
  USING (auth.uid() = user_id);

/* Policy: Users can insert their own shares */
CREATE POLICY "Users can insert own stack shares"
  ON public.stack_shares
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

/* Function to submit share and award points */
CREATE OR REPLACE FUNCTION public.submit_stack_share(
  p_stack_content TEXT,
  p_share_link TEXT,
  p_platform TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_points_amount INTEGER := 25;
  v_share_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  /* Check if link already submitted (basic duplicate check) */
  IF EXISTS (SELECT 1 FROM public.stack_shares WHERE share_link = p_share_link) THEN
     RETURN jsonb_build_object('success', false, 'error', 'This link has already been submitted');
  END IF;

  /* Insert share record */
  INSERT INTO public.stack_shares (user_id, stack_content, share_link, platform)
  VALUES (v_user_id, p_stack_content, p_share_link, p_platform)
  RETURNING id INTO v_share_id;

  /* Award points */
  UPDATE public.user_points
  SET 
    points_balance = points_balance + v_points_amount,
    total_points_earned = total_points_earned + v_points_amount,
    updated_at = NOW()
  WHERE user_id = v_user_id;

  /* Log transaction */
  INSERT INTO public.points_transactions (user_id, points_change, transaction_type, description, reference_id)
  VALUES (v_user_id, v_points_amount, 'earn', 'Shared tech stack on ' || p_platform, v_share_id);

  RETURN jsonb_build_object(
    'success', true,
    'points_awarded', v_points_amount
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
