# Shree Raj & Co. — Contact Form Backend Setup

## What's included

```
shree-raj-co/
├── raju_mama.html          ← Updated frontend (drop into your repo)
└── server/
    ├── server.js           ← Express server (email + Firestore)
    ├── package.json
    └── .env.example        ← Copy this to .env and fill in
```

---

## STEP 1 — Set up Firebase (Free)

1. Go to https://console.firebase.google.com
2. Click **Add Project** → name it `shree-raj-co` → Create
3. In the left sidebar → **Firestore Database** → Create database → Start in **test mode**
4. Go to **Project Settings** (gear icon) → **Service accounts** tab
5. Click **Generate new private key** → download the JSON file
6. Open that JSON, copy the entire contents as a single line — you'll use it as `FIREBASE_SERVICE_ACCOUNT` in `.env`

---

## STEP 2 — Get Gmail App Password

> **Important**: Use a Gmail account, not Yahoo. Yahoo SMTP needs different setup.
> You can use a free Gmail account just for sending emails.

1. Go to https://myaccount.google.com/security
2. Enable **2-Step Verification** (required)
3. Go to https://myaccount.google.com/apppasswords
4. Select **Mail** → **Other (Custom)** → name it "Shree Raj Website"
5. Copy the 16-character password → use as `EMAIL_PASS` in `.env`

---

## STEP 3 — Create your .env file

```bash
cd server
cp .env.example .env
```

Edit `.env`:

```env
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop   # The 16-char app password
OWNER_EMAIL=shreerajco@yahoo.com  # Where you receive notifications
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"shree-raj-co",...}
ALLOWED_ORIGIN=https://yourusername.github.io
```

> Paste the entire Firebase JSON as one line for `FIREBASE_SERVICE_ACCOUNT`.

---

## STEP 4 — Run locally to test

```bash
cd server
npm install
npm run dev
```

Open a new terminal and test:

```bash
curl -X POST http://localhost:3000/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","message":"Hello from test","website":""}'
```

You should receive an email at `OWNER_EMAIL`. ✅

---

## STEP 5 — Deploy to Railway (Free tier, 5 mins)

1. Go to https://railway.app → Sign in with GitHub
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your `shree-raj-co` repo → set **Root Directory** to `server`
4. Click **Variables** → add all your `.env` values there
5. Railway auto-deploys. Copy your public URL (e.g. `https://shree-raj-co-production.up.railway.app`)

---

## STEP 6 — Update the frontend

In `raju_mama.html`, find this line near the bottom:

```js
const SERVER_URL = "http://localhost:3000";
```

Change it to your Railway URL:

```js
const SERVER_URL = "https://shree-raj-co-production.up.railway.app";
```

Commit & push `raju_mama.html` to your GitHub repo. Done! 🎉

---

## Features Summary

| Feature | How it's done |
|---------|--------------|
| ✅ Form validation | Client-side JS + server-side express-validator |
| ✅ Spam prevention | Honeypot field + rate limiting (5/hr per IP) |
| ✅ Email to owner | Nodemailer via Gmail SMTP, HTML email |
| ✅ Auto-reply to user | Confirmation email sent to submitter |
| ✅ Store submissions | Firebase Firestore (free, searchable) |
| ✅ Service dropdown | Added Income Tax, GST, Business Setup options |
| ✅ Loading state | Spinner + disabled button during submit |
| ✅ Success screen | Replaces form with thank you state |
| ✅ Error toast | User-friendly error messages |

---

## View submissions in Firebase

1. Go to https://console.firebase.google.com
2. Your project → Firestore Database
3. Look for the `contact_submissions` collection
4. Each document = one form submission with name, email, message, timestamp

---

## Troubleshooting

**Emails not sending?**
- Make sure you're using a Gmail App Password, not your regular password
- Yahoo SMTP needs different config — easier to use a Gmail account for sending

**CORS error in browser?**
- Make sure `ALLOWED_ORIGIN` in `.env` matches your GitHub Pages URL exactly

**Firebase error?**
- Paste the entire service account JSON as a single line in `.env`
- Make sure Firestore is created in the Firebase console first
