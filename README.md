# EduStream - E-Learning Video Course Platform

A full-stack e-learning platform: React (Vite + Tailwind) frontend, Node.js + Express + MongoDB backend,
JWT authentication, Cloudinary video hosting, and dual Stripe/Razorpay payment integration (test mode).

## Honest Status - Read This First

This is a **working MVP scaffold**, not a finished commercial product. Here's exactly what's real vs stubbed:

**Fully wired and functional:**
- JWT auth (register/login, role-based: student/instructor/admin)
- Course CRUD, categories, search + filters + pagination
- Cloudinary video/image upload (backend endpoints ready)
- Cart, wishlist, checkout with both Stripe Checkout and Razorpay Orders (test mode)
- Enrollment on successful payment (Stripe via webhook, Razorpay via signature verification)
- Video playback with progress tracking (90% watched = lesson complete)
- Certificate issuance once a course hits 100% progress, plus public verification endpoint
- Reviews/ratings from any logged-in user (not enrollment-gated by design choice - see tradeoff note)
- Admin panel: user ban/unban, course approval workflow, revenue/user stats
- Instructor panel: create courses, upload thumbnails
- Password reset via email (Nodemailer, works with Gmail app passwords or any SMTP provider)
- Google Sign-In (verifies real Google ID tokens server-side; links to existing email accounts automatically)
- Coupon codes: admin creates them, users apply them at checkout, server re-validates and never trusts client-side discount math
- Dark mode, responsive layout, SEO meta tags via react-helmet-async

**Stubbed / not yet built - you need to add these:**
- **Course curriculum builder UI**: the backend supports adding sections/lessons (`POST /api/courses/:id/sections`)
  and video upload, but there's no instructor-facing UI to build out a multi-lesson curriculum yet. Right now
  you'd call that endpoint directly (Postman/curl) after creating a course.
- **Contact form backend**: the Contact page UI works but doesn't send anywhere - no `/api/contact` route exists.
- **Email notifications**: only password reset emails are wired. Order confirmations, general marketing emails, etc. are not.
- **Refunds**: order model supports a `refunded` status but no refund logic/UI exists.
- **Certificate PDF generation**: certificates are just DB records with an ID - there's no PDF/image generation.
- **Automated tests**: none included.

Don't tell a client or stakeholder this is "100% done" - it's a real, running foundation, not the finish line.

**Design choice worth knowing:** reviews are open to any logged-in user, not just people who bought the course (no "Verified Purchase" restriction, unlike Amazon-style platforms). This was a deliberate change - it means reviews can't be trusted as proof of purchase, and makes fake/competitor reviews easier. Fine for a demo/MVP; reconsider before a real launch if review integrity matters to you.

## Project Structure

```
elearning/
├── backend/          # Node + Express + MongoDB API
└── frontend/          # React + Vite + Tailwind SPA
```

## Prerequisites

- Node.js 18+ and npm
- A MongoDB database (local install or MongoDB Atlas free tier)
- A Cloudinary account (free tier) for video/image storage
- Stripe account (test mode keys) and/or Razorpay account (test mode keys)

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env and fill in: MONGO_URI, JWT_SECRET, CLOUDINARY_*, STRIPE_*, RAZORPAY_*
npm run dev
```

Backend runs on `http://localhost:5000`. Health check: `GET /api/health`.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env: VITE_API_URL (defaults to http://localhost:5000/api), VITE_RAZORPAY_KEY_ID
npm run dev
```

Frontend runs on `http://localhost:5173`.

### 3. Create your first admin user

There is intentionally **no public "sign up as admin" option** - anyone could abuse that. Register normally
as a student, then manually flip the role in MongoDB:

```js
// in mongosh, connected to your database
db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
```

## Payment Testing

**Stripe test card:** `4242 4242 4242 4242`, any future expiry, any CVC, any ZIP.
For webhooks locally, use the Stripe CLI: `stripe listen --forward-to localhost:5000/api/payments/stripe/webhook`
and put the CLI's webhook signing secret into `STRIPE_WEBHOOK_SECRET`.

**Razorpay test mode:** use Razorpay's published test card/UPI credentials from their docs
(https://razorpay.com/docs/payments/payments/test-card-upi-details/) - don't use real payment details in test mode.

## Deployment

See `DEPLOYMENT.md`.

## Tech Stack

- **Frontend:** React 18, Vite, React Router 6, Tailwind CSS, Axios, react-helmet-async, react-hot-toast
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT, bcryptjs, Multer + Cloudinary, Stripe SDK, Razorpay SDK
