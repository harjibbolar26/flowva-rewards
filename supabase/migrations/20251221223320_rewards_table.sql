CREATE TABLE public.rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  points_required INTEGER NOT NULL,
  reward_type TEXT NOT NULL, /* 'gift_card', 'bank_transfer', 'paypal', etc. */
  value_amount DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  is_coming_soon BOOLEAN DEFAULT FALSE,
  stock_quantity INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);