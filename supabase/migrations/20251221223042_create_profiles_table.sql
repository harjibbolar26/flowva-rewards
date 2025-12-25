/** Enable UUID extension */
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

/** Users table (extends Supabase auth.users) */
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  referral_code TEXT UNIQUE NOT NULL,
  referred_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
