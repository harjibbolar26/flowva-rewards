# Database Migrations Documentation

This document provides a detailed explanation of the database migrations used in the Flowva Rewards Hub. The migrations are ordered chronologically.

## 1. Initial Schema Setup (2025-12-21)

The foundation of the application was built with a modular set of migrations to establish the core tables and security policies.

- **`20251221223042_create_profiles_table.sql`**

  - **Purpose**: Creates the `profiles` table which extends Supabase's `auth.users`.
  - **Key Fields**: `id` (FK to auth.users), `email`, `full_name`, `referral_code`, `referred_by`.

- **`20251221223129_user_points_table.sql`**

  - **Purpose**: Tracks user point balances.
  - **Key Fields**: `points_balance`, `total_points_earned`, `total_points_spent`.

- **`20251221223204_daily_checkins_table.sql`**

  - **Purpose**: Logs every daily check-in to prevent duplicate claims and track history.
  - **Key Fields**: `checkin_date`, `points_awarded`.

- **`20251221223234_user_streaks_table.sql`**

  - **Purpose**: Stores current and longest streaks for gamification.
  - **Key Fields**: `current_streak`, `longest_streak`, `last_checkin_date`.

- **`20251221223300_referrals_table.sql`**

  - **Purpose**: Tracks referral relationships and their completion status.
  - **Key Fields**: `referrer_id`, `referred_id`, `is_completed`.

- **`20251221223320_rewards_table.sql`**

  - **Purpose**: Catalog of available rewards (Gift cards, etc.).
  - **Key Fields**: `points_required`, `reward_type`, `value_amount`, `is_active`.

- **`20251221223348_reward_redemptions_table.sql`**

  - **Purpose**: Records user redemption requests.
  - **Key Fields**: `status` (pending/completed), `redemption_data`.

- **`20251221223423_points_transactions_table.sql`**

  - **Purpose**: Immutable audit log of all point changes.
  - **Key Fields**: `points_change`, `transaction_type`, `description`.

- **`20251221223501_create_indexes.sql`**

  - **Purpose**: Adds performance indexes on frequently queried foreign keys (e.g., `user_id` on all tables).

- **`20251221223559_rls_policies.sql`**

  - **Purpose**: Enables Row Level Security (RLS) on all tables.
  - **Policies**: Generally allows users to view/insert their own data, while restricting updates to secure server-side functions.

- **`20251221223847_functions_and_triggers.sql`**
  - **Purpose**: Implements core business logic as database functions.
  - **Functions**:
    - `handle_new_user()`: Trigger to create profile/points/streak rows on signup.
    - `claim_daily_points()`: Logic to award points and update streaks.
    - `redeem_reward()`: Transactional logic to deduct points and create redemption record.

## 2. Fixes & Feature Additions (2025-12-22 onwards)

Subsequent migrations addressed bugs, improved robustness, or added new features.

### Signup Trigger Improvements

- **`20251222004500_fix_signup_trigger.sql`**
  - **Change**: Improved `handle_new_user` to robustly handle missing metadata and ensure `full_name` is captured from various metadata fields.
- **`20251222010500_fix_signup_trigger_v2.sql`**
  - **Change**: Security hardening. Explicitly sets `search_path` and fully qualifies function calls to prevent search path hijacking vulnerabilities in `SECURITY DEFINER` functions.
- **`20251222223000_fix_signup_trigger_v3.sql`**
  - **Change**: Further refinement to integrate referral logic directly into the signup trigger, ensuring referrals are processed atomically with user creation.

### Referral Logic

- **`20251222211131_award_referral_points.sql`**
  - **Change**: Updates logic to immediately award points when a referral is marked as completed, rather than waiting for a separate process.

### Gamification Logic

- **`20251222230000_fix_claim_streak_logic.sql`**
  - **Change**: Fixed a bug in `claim_daily_points` where the first check-in or broken streaks were not calculating `current_streak` correctly. It now correctly handles `NULL` last check-in dates.

### New Features

- **`20251222234500_create_stack_shares.sql`**

  - **Feature**: "Share Your Stack".
  - **Change**: Creates `stack_shares` table and `submit_stack_share` RPC to allow users to earn points by sharing their tech stack.

- **`20251225100000_check_email_exists.sql`**
  - **Feature**: Password Reset Flow.
  - **Change**: Adds `check_email_exists` RPC function. This allows the frontend to verify if an email is registered before attempting to send a password reset link, improving UX.
