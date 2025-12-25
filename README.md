# Flowva Rewards Hub

A comprehensive rewards and gamification platform built with Next.js 16, Supabase, and Tailwind CSS. Users can earn points through daily check-ins, referrals, and social sharing, which can be redeemed for real-world rewards.

## 🚀 Features

- **Authentication System**

  - Secure Email/Password login & signup
  - Google OAuth integration
  - Password reset flow (Forgot/Reset Password)
  - Protected routes and session management

- **Gamification & Rewards**

  - **Daily Streak**: 7-day calendar view with daily point claims. Tracks streaks and awards points based on local time.
  - **Referral System**: Unique referral codes for users. Earn points when referred users complete signup.
  - **Stack Share**: Earn points by sharing your tech stack on social media platforms.
  - **Point System**: Real-time point balance tracking and transaction history.

- **User Interface**
  - **Responsive Design**: Mobile-first approach with a responsive sidebar and sticky top navigation.
  - **Modern UI**: Clean aesthetics using Tailwind CSS, custom fonts (Roboto, Blinker), and Lucide icons.
  - **Interactive Elements**: Toast notifications (Sonner), loading states, and smooth transitions.

## 🛠️ Tech Stack

- **Frontend**: [Next.js 16](https://nextjs.org/) (App Router), [React](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Edge Functions)
- **State Management**: [TanStack Query](https://tanstack.com/query/latest)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)

## 📂 Project Structure

```
flowva-rewards/
├── app/                    # Next.js App Router pages and layouts
│   ├── login/              # Login route 
│   ├── signup/             # Signup route
│   ├── auth/               # Auth callback handlers
│   ├── forgot-password/    # Password reset request page
│   ├── reset-password/     # Password reset confirmation page
│   ├── globals.css         # Global styles and Tailwind theme
│   └── layout.tsx          # Root layout with font configuration
│   └── page.tsx            # Main rewards page
├── components/             # Reusable UI components
│   ├── rewards/            # Reward-specific components (DailyStreak, RewardCard, etc.)
│   ├── ClientLayout.tsx    # Layout wrapper for Sidebar/TopNav logic
│   ├── Sidebar.tsx         # Responsive sidebar navigation
│   └── TopNav.tsx          # Sticky top navigation bar
├── hooks/                  # Custom React hooks
│   ├── useRewards.tsx      # Hooks for fetching rewards, points, and streaks
│   └── useUser.tsx         # User session hooks
├── lib/                    # Utilities and libraries
│   └── supabase/           # Supabase client configuration
├── supabase/               # Database configurations
│   └── migrations/         # SQL migrations for schema and functions
└── public/                 # Static assets
```

## ⚡ Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A Supabase project

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/flowva-rewards.git
    cd flowva-rewards
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env.local` file in the root directory and add your Supabase credentials:

    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Database Setup:**
    Apply the migrations found in `supabase/migrations` to your Supabase project. You can use the Supabase CLI or copy the SQL into the Supabase SQL Editor.

    Key tables include:

    - `profiles`: User profiles linked to Auth.
    - `user_points`: Tracks user point balances.
    - `daily_checkins`: Records daily activity.
    - `rewards`: Available rewards catalog.
    - `transactions`: Audit log of point changes.

5.  **Run the development server:**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🔄 Database Functions & RPCs

The project relies on several PostgreSQL functions (RPCs) for logic:

- `handle_new_user()`: Trigger to initialize profile and points on signup.
- `claim_daily_points()`: Logic for awarding daily points and updating streaks (timezone aware).
- `check_email_exists()`: Verifies if an email exists before sending reset links.
- `submit_stack_share()`: Awards points for sharing content.

## 🤝 Contributing

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request
