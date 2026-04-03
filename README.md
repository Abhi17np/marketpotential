# Infopace — React + Supabase Edition

> AI-powered market intelligence assessment platform.
> Built with React + Vite + Tailwind CSS + Gemini AI + Supabase.

---

## What This App Does

1. **Onboarding Form** — Collects user details (name, email, phone, organization, role, website, LinkedIn, team size, sector, geography, problem statement, stage)
2. **AI Assessment** — Generates 8 tailored question groups using Gemini AI, with a live market score panel updating as you answer
3. **Results Dashboard** — Full market intelligence dashboard with:
   - Score donut + dimension bars + capability radar
   - Revenue projection chart (conservative / base / optimistic)
   - TAM / SAM / SOM estimates
   - Competitor analysis
   - Key AI-generated insights
   - 90-day action plan
   - Full printable report view
   - Raw JSON data view
4. **Supabase Storage** — Every submission (user details + all answers + full analysis) is saved to your Supabase database

---

## Prerequisites

- Node.js 18+
- A free [Gemini API key](https://aistudio.google.com) (already in `server.js`)
- A free [Supabase](https://supabase.com) project

---

## Quick Start

### Step 1 — Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and paste + run the contents of `supabase_setup.sql`
3. Go to **Settings → API** and copy:
   - **Project URL** (looks like `https://xxxx.supabase.co`)
   - **anon / public key** (long JWT string)

### Step 2 — Configure environment

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_PUBLIC_KEY
```

### Step 3 — Install dependencies

```bash
npm install
```

### Step 4 — Run the app (two terminals)

**Terminal 1** — Start the Gemini proxy server (port 4000):
```bash
node server.js
```

**Terminal 2** — Start the React dev server (port 3000):
```bash
npm run dev
```

Open **http://localhost:3000**

The Vite dev server automatically proxies `/api` requests to `server.js` on port 4000.

---

## Project Structure

```
infopace-react/
├── server.js                    ← Gemini AI proxy (Node.js, port 4000)
├── supabase_setup.sql           ← Run once in Supabase SQL Editor
├── .env.example                 ← Copy to .env and fill in keys
│
├── index.html                   ← Vite entry HTML
├── vite.config.js               ← Dev server + /api proxy config
├── tailwind.config.js
├── postcss.config.js
├── package.json
│
└── src/
    ├── main.jsx                 ← React entry point
    ├── App.jsx                  ← Screen router (onboarding → assessment → results)
    ├── index.css                ← Tailwind + IBM Plex fonts
    │
    ├── pages/
    │   ├── OnboardingForm.jsx   ← Step 1: User & venture details
    │   ├── AssessmentShell.jsx  ← Step 2: AI questions + live scoring
    │   └── ResultsDashboard.jsx ← Step 3: Full dashboard + report
    │
    └── lib/
        ├── supabase.js          ← Supabase client init
        ├── gemini.js            ← Gemini API helpers (questions + analysis)
        └── db.js                ← Save / load submissions
```

---

## Data Saved to Supabase

Every completed assessment saves one row to the `submissions` table:

| Column | Type | Description |
|---|---|---|
| `id` | uuid | Auto-generated primary key |
| `name` | text | Full name |
| `email` | text | Email address |
| `phone` | text | Phone number |
| `organization` | text | Company name |
| `role` | text | Job role |
| `website` | text | Website URL |
| `linkedin` | text | LinkedIn URL |
| `team_size` | text | Team size bracket |
| `sector` | text | e.g. "HealthTech", "B2B SaaS" |
| `geography` | text | e.g. "PI" (Pan India), "GL" (Global) |
| `problem` | text | Problem statement |
| `stage` | text | Business stage (1–5) |
| `answers` | jsonb | All question answers keyed by question ID |
| `overall_score` | integer | Final market score (0–100) |
| `grade` | text | e.g. "A", "B+", "C" |
| `dimensions` | jsonb | Six dimension scores |
| `analysis_json` | jsonb | Complete AI analysis (TAM/SAM/SOM, competitors, insights, action plan, projections) |
| `created_at` | timestamptz | Submission timestamp |

---

## Production Deployment

### Build the React app

```bash
npm run build
```

This creates a `dist/` folder.

### Serve with server.js

Update `server.js` to serve the `dist/` folder as static files. Replace the static file section at the bottom of `server.js` with:

```javascript
// Serve React build
let fp = req.url === '/' ? '/index.html' : req.url.split('?')[0];

// For React Router — serve index.html for unknown routes
const fullPath = path.join(process.cwd(), 'dist', fp);
fs.readFile(fullPath, (err, data) => {
  if (err) {
    // Fallback to index.html for client-side routing
    fs.readFile(path.join(process.cwd(), 'dist', 'index.html'), (e2, d2) => {
      if (e2) { res.writeHead(404); res.end('Not found'); return; }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(d2);
    });
    return;
  }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(fullPath)] || 'text/plain' });
  res.end(data);
});
```

Then run just `node server.js` — it serves both the API and the React app on port 4000.

### Deploy options

- **Railway / Render / Fly.io** — push repo, set env vars, run `node server.js`
- **Vercel** — deploy React app, add serverless function wrapping Gemini calls
- **VPS** — clone repo, `npm run build`, run with `pm2 start server.js`

---

## Customisation

### Change sectors / geographies
Edit the `SECTORS` and `GEO` arrays at the top of `src/pages/OnboardingForm.jsx`.

### Change AI models
Edit `MODEL_FAST` and `MODEL_SMART` constants in `server.js`.

### Change question count
Edit the prompt in `src/lib/gemini.js` → `generateQuestions()`.

### Add email notifications
After `saveSubmission()` in `AssessmentShell.jsx`, call a Supabase Edge Function or a service like Resend/SendGrid.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `/api` returns 500 | Check Gemini API key on line 8 of `server.js` |
| Supabase save fails | Verify `.env` values and that `supabase_setup.sql` was run |
| Questions don't load | Gemini API key may be rate-limited; fallback questions will show |
| Blank dashboard | Open browser console — look for JSON parse errors in analysis response |

---

## License

Infopace Management Pvt Ltd — Internal Use
