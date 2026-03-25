# GreenPot — Golf Charity Subscription Platform

> Play golf. Win prizes. Fund the causes you care about.

GreenPot is a full-stack subscription web app built as a portfolio project. Users subscribe, log their Stableford golf scores, enter monthly prize draws, and automatically contribute to a charity of their choice. An admin panel provides full control over draws, charities, users, and winner payouts.

---

## Live Demo

| Account | How to create                                                 |
| ------- | ------------------------------------------------------------- |
| User    | Register at `/register`                                       |
| Admin   | Register, then set `is_admin = true` in Supabase Table Editor |

---

## Tech Stack

| Layer      | Tech                                             |
| ---------- | ------------------------------------------------ |
| Frontend   | React 18, React Router v6                        |
| Styling    | Tailwind CSS                                     |
| Backend    | Supabase (PostgreSQL + Auth)                     |
| Security   | Row Level Security (RLS) policies on every table |
| State      | React Context + custom hooks                     |
| UI         | Lucide React, react-hot-toast                    |
| Deployment | Vercel (frontend) + Supabase (backend)           |

---

## Features

### For users

- Sign up and sign in via Supabase Auth
- Choose a monthly (£19.99) or yearly (£199.99) subscription plan
- Log up to 5 Stableford scores (1–45 points) — your scores become your monthly draw numbers
- Rolling 5-score limit enforced by a Postgres trigger at the database level
- Select a charity from the directory and set your contribution percentage (minimum 10%)
- View your draw history and see how many numbers you matched each month

### Draw system

- Each user's 5 scores are their 5 draw numbers for that month
- Match 3 numbers → 25% of prize pool
- Match 4 numbers → 35% of prize pool
- Match all 5 → 40% jackpot (rolls over to next month if unclaimed)
- Admin can choose between random draw or algorithmic draw (weighted by score frequency across all users)

### Admin panel

- **Overview** — live stats: active subscribers, total revenue, draws run, charity partners
- **Users** — view all accounts, toggle admin status, cancel subscriptions
- **Draws** — configure draw type, run a simulation, preview numbers, save as draft or publish live
- **Charities** — add, edit, toggle active/featured status, delete
- **Winners** — view all prize entries with match counts, mark payouts as completed

---

## Project Structure

```
golf-charity-platform/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── CharitySelector.jsx   # Charity picker + contribution % slider
│   │   │   └── ScoreEntry.jsx        # Add / edit / delete scores
│   │   └── layout/
│   │       ├── Footer.jsx
│   │       └── Navbar.jsx
│   ├── context/
│   │   └── AuthContext.js            # Auth state, profile, signIn/signUp/signOut
│   ├── hooks/
│   │   ├── useCharities.js           # Fetch charities from Supabase
│   │   ├── useDraws.js               # Fetch draws (public + admin variants)
│   │   └── useScores.js              # Score CRUD with optimistic refresh
│   ├── lib/
│   │   ├── supabase.js               # Supabase client initialisation
│   │   └── utils.js                  # Draw algorithms, prize calculations, formatters
│   ├── pages/
│   │   ├── AdminPage.jsx             # Tabbed admin dashboard
│   │   ├── CharityDirectoryPage.jsx  # Public charity listing with search + filter
│   │   ├── DashboardPage.jsx         # User dashboard
│   │   ├── DrawPage.jsx              # Public draw results + archive
│   │   ├── LandingPage.jsx           # Marketing homepage
│   │   ├── LoginPage.jsx
│   │   ├── NotFoundPage.jsx
│   │   ├── RegisterPage.jsx
│   │   └── SubscribePage.jsx         # Plan selection + activation
│   ├── App.js                        # Router + protected routes
│   ├── index.css                     # Tailwind directives + global styles
│   └── index.js
└── supabase/
    ├── schema.sql                    # Full DB schema — run this to set up
    └── reset.sql                     # Dev only — drops everything cleanly
```

---

## Local Setup

### Prerequisites

- Node.js 16+
- A free [Supabase](https://supabase.com) account

### 1. Clone and install

```bash
git clone https://github.com/FarhanZizz/golf-charity-platform.git
cd golf-charity-platform
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once it's ready, open the **SQL Editor**
3. Paste and run the full contents of `supabase/schema.sql`
4. This creates all tables, RLS policies, triggers, functions, and seeds 8 charities

### 3. Add environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your credentials from **Supabase → Project Settings → API**:

```
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Start the dev server

```bash
npm start
```

App runs at `http://localhost:3000`.

---

## Becoming an admin

1. Register an account via `/register`
2. In Supabase → **Table Editor** → `profiles`
3. Find your row and set `is_admin` to `true`
4. Hard refresh the app — **Admin Panel** will appear in your account dropdown

---

## Resetting the database (dev only)

Run these two files in the Supabase SQL Editor in order:

1. `supabase/reset.sql` — drops all tables, functions, triggers
2. `supabase/schema.sql` — rebuilds everything from scratch

---

## Payment Integration Note

The subscription flow currently **simulates** payment by writing directly to the database — no real money is taken. This is intentional for portfolio / demo purposes.

To go production-ready, replace the `handleSubscribe` function in `src/pages/SubscribePage.jsx` with a Stripe Checkout session redirect, then use a Supabase Edge Function or Stripe webhook to update `profiles.plan_status` after successful payment confirmation.

---

## Schema Notes

Three important design decisions in `supabase/schema.sql`:

**1. `is_admin()` helper function**
All admin RLS policies call a `SECURITY DEFINER` function instead of a subquery on `profiles`. This prevents Postgres from infinitely recursing when evaluating the policy.

**2. `profiles_charity_id_fkey` named constraint**
The foreign key from `profiles.charity_id` to `charities.id` is named explicitly. This lets PostgREST resolve the join unambiguously and avoids a PGRST200 error when fetching a user's profile with their selected charity.

**3. Rolling score trigger**
The `after_score_insert` trigger calls `enforce_score_limit()` after every insert, deleting any scores beyond the 5 most recent. Data integrity is guaranteed at the database level regardless of what the frontend does.
