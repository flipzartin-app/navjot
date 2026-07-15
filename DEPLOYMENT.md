# Deployment Guide

## Recommended free/cheap setup for testing

| Component | Service |
|---|---|
| Backend API | Render.com or Railway.app (free/low-cost Node hosting) |
| Frontend | Vercel or Netlify |
| Database | MongoDB Atlas (free M0 cluster) |
| Video/image storage | Cloudinary (free tier, ~25GB) |
| Payments | Stripe + Razorpay (both have free test mode, live mode needs business verification) |

## Backend (Render example)

1. Push `backend/` to a GitHub repo.
2. On Render: New Web Service → connect repo → root directory `backend`.
3. Build command: `npm install`. Start command: `npm start`.
4. Add all variables from `.env.example` in Render's Environment tab. Use your real MongoDB Atlas URI.
5. Set `CLIENT_URL` to your deployed frontend URL (needed for CORS and Stripe redirect URLs).
6. After deploy, your API is at `https://your-app.onrender.com/api`.

## Frontend (Vercel example)

1. Push `frontend/` to a GitHub repo (or same repo, different root).
2. On Vercel: New Project → root directory `frontend` → framework preset "Vite".
3. Environment variables: `VITE_API_URL=https://your-app.onrender.com/api`, `VITE_RAZORPAY_KEY_ID=...`
4. Deploy.

## Stripe webhook in production

Add a webhook endpoint in the Stripe Dashboard pointing to:
`https://your-app.onrender.com/api/payments/stripe/webhook`
Select event: `checkout.session.completed`. Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.

## Things to fix before going live with real money

- Switch Stripe/Razorpay keys from test to live mode.
- Add HTTPS-only cookies or keep JWT in memory instead of localStorage if you want to harden XSS exposure
  (current setup stores JWT in localStorage, which is simple but readable by any injected script).
- Add rate limiting (e.g. `express-rate-limit`) on `/api/auth/login` and `/api/auth/register` to slow down
  brute-force/credential-stuffing attempts - this is not in the current scaffold.
- Add server-side file-type/virus scanning on video uploads if you allow public instructor signup.
- Set up proper logging/monitoring (e.g. Sentry) - none included currently.
- Review Cloudinary bandwidth/storage costs at scale - video hosting gets expensive fast; consider a
  dedicated video CDN (Mux, Cloudflare Stream) once you have real traffic.
