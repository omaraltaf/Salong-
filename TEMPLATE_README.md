# Salon Website Template

A production-ready hair salon website and booking system built with Next.js 14, Supabase, and Resend. Demoed for Blue Point AS (Skedsmokorset, Norway).

## What's Included

- **Public website**: Hero, About, Services, Pricing, Booking flow, Testimonials, Contact, Footer
- **Booking system**: Multi-step online booking with email confirmations
- **Admin panel**: Full CMS — bookings, timeslots, services, pricing, content, gallery, testimonials, opening hours, social links, messages
- **Email notifications**: Customer confirmations + admin alerts via Resend
- **White-label ready**: Swap salon via config + SQL seed

## Tech Stack

- Next.js 14 (App Router, Server Components, Server Actions)
- Supabase (Postgres, Auth, Storage, RLS)
- Resend (transactional email)
- Tailwind CSS + custom theme
- Framer Motion animations
- React Hook Form + Zod validation
- date-fns (Norwegian locale)

## Quick Deploy (New Client)

### Step 1 — Clone the repository
```bash
git clone <repo-url> my-salon
cd my-salon
npm install
```

### Step 2 — Create a Supabase project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your **Project URL** and **anon key** from Settings > API
3. Also note the **service role key** (keep this secret)

### Step 3 — Run the database migration
1. In your Supabase dashboard, go to **SQL Editor**
2. Paste the contents of `supabase/migrations/001_initial_schema.sql`
3. Click **Run** — this creates all tables, policies, and seeds initial content

### Step 4 — Configure the salon
Edit `config/salon.config.ts` with the client's details:
```ts
export const salonConfig = {
  name: "My Salon Name",
  locale: "nb-NO",       // or "en-GB" for English
  currency: "NOK",       // or "GBP", "EUR", etc.
  timezone: "Europe/Oslo",
  bookingWindowDays: 14, // how many days ahead customers can book
  address: "Street Address, City",
  phone: "+47 XX XX XX XX",
  email: "salon@example.com",
  theme: {
    primary: "#C4A882",   // main brand colour (buttons, highlights)
    secondary: "#2C2C2C", // dark colour (nav, footer)
    accent: "#E8D5C4",    // light tint
    background: "#FAFAF8",
    foreground: "#1A1A1A",
    muted: "#F5F0EB",
    fonts: {
      heading: "Playfair Display", // any Google Font
      body: "Inter"
    }
  }
}
```

### Step 5 — Set environment variables
Copy `.env.local.example` to `.env.local` and fill in:
```bash
cp .env.local.example .env.local
```

Then edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
RESEND_API_KEY=re_...
NEXT_PUBLIC_SITE_URL=https://mysalon.no
ADMIN_EMAIL=owner@mysalon.no
```

### Step 6 — Run locally
```bash
npm run dev
```

Visit http://localhost:3000 to see the public site.

### Step 7 — Create admin account
1. In Supabase dashboard, go to **Authentication > Users**
2. Click **Add user**
3. Enter the salon owner's email and a secure password
4. Click **Create user**

### Step 8 — Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Set all environment variables in the Vercel dashboard under **Settings > Environment Variables**.

### Step 9 — Log in to admin and customise
1. Visit `/admin/login` on your deployed site
2. Log in with the credentials from Step 7
3. Go to **Innhold** to edit headlines and about text
4. Go to **Tjenester** to update services
5. Go to **Åpningstider** to set opening hours
6. Go to **Timeslots** to add bookable time slots
7. The public site updates instantly

**Done! Total setup time: ~20 minutes**

---

## Customising for a New Client

### Change the colour scheme
In `config/salon.config.ts`, update the `theme` object. All 6 CSS variables cascade through the entire site automatically.

### Change the fonts
Update `fonts.heading` and `fonts.body` in `salonConfig.theme`. Any Google Font name works — the root layout loads them via `next/font/google`.

### Change the language
For a non-Norwegian salon:
1. Update `salonConfig.locale`
2. Replace Norwegian strings in `lib/validations.ts` (Zod error messages)
3. Update seed content in `supabase/migrations/001_initial_schema.sql`

### Add a new admin panel page
1. Create `app/admin/mypage/page.tsx` (Server Component)
2. Add a nav item in `components/admin/AdminSidebar.tsx`
3. Add server actions in `app/actions/admin.ts`

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key (keep secret!) |
| `RESEND_API_KEY` | ✅ | Resend API key for transactional emails |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Your deployed site URL (no trailing slash) |
| `ADMIN_EMAIL` | ✅ | Email address to receive admin notifications |

---

## Project Structure

```
├── app/
│   ├── (public)/page.tsx     # Landing page (Server Component)
│   ├── admin/                # Admin panel pages
│   └── actions/              # Server Actions (booking, contact, admin)
├── components/
│   ├── sections/             # Public page sections (Hero, About, etc.)
│   ├── admin/                # Admin components
│   └── ui/                   # Base UI components (Button, Input, etc.)
├── config/
│   └── salon.config.ts       # ← Only file that needs editing per deployment
├── emails/                   # React Email templates
├── lib/
│   ├── supabase/             # Supabase clients (browser, server, middleware)
│   ├── email.ts              # Resend client
│   ├── utils.ts              # Utilities (cn, formatCurrency, etc.)
│   └── validations.ts        # Zod schemas
├── supabase/migrations/      # Database schema + seed data
└── types/database.ts         # TypeScript types (Supabase tables)
```

---

## Admin Panel Features

| Section | What you can manage |
|---------|---------------------|
| Dashboard | Overview of bookings and messages |
| Bestillinger | Confirm/cancel customer bookings, send emails |
| Timeslots | Add/delete available booking slots (single or bulk) |
| Tjenester | Services list — name, duration, price, category |
| Priser | Pricing tiers per service |
| Innhold | All text content (headlines, about text, etc.) |
| Åpningstider | Opening hours per day |
| Omtaler | Customer testimonials — add, publish, order |
| Galleri | Photos — upload or link, assign to sections |
| Sosiale medier | Social media links |
| Meldinger | Contact form submissions |

---

## License

White-label template. Each deployment requires its own Supabase project and Resend account.

Built by Kvikai.
