# Shree Raj & Co. — Tax & Compliance Website

![Status](https://img.shields.io/badge/status-active-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-Proprietary-red)
![Made with](https://img.shields.io/badge/made%20with-HTML%20%7C%20CSS%20%7C%20JS-orange)
![Backend](https://img.shields.io/badge/backend-Node.js%20%2B%20Express-green)
![Hosted on](https://img.shields.io/badge/hosted%20on-GitHub%20Pages-black)
![PRs](https://img.shields.io/badge/PRs-welcome-blueviolet)

---

## Table of Contents

- [Live Site](#live-site)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Contact Form Setup](#contact-form-setup)
- [Environment Variables](#environment-variables)
- [Backend API Reference](#backend-api-reference)
- [Deployment](#deployment)
- [Custom Domain Setup](#custom-domain-setup)
- [Security & Best Practices](#security--best-practices)
- [Performance](#performance)
- [SEO & Accessibility](#seo--accessibility)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## Live Site

- **GitHub Pages:** `https://bitttu4.github.io/shree-raj-co/`
- **Custom Domain (recommended):** `https://shree-raj-co.com`

---

## Features

### Frontend

- Professional single-page website for tax and compliance services
- Sections: Hero, Services, About, Process, Testimonials, FAQ, Contact
- Responsive layout with pastel design language
- Smooth scroll navigation and mobile-friendly menu
- Contact form with dual mode support (email draft / API)
- Custom `404.html` redirect for GitHub Pages
- `.nojekyll` to bypass Jekyll processing
- Local visual assets for reliable rendering

### Backend (Optional)

- Express-based REST API for contact form submissions
- Email notifications via Nodemailer (Gmail or custom SMTP)
- Rate limiting per IP to prevent spam
- Input validation and sanitization via `express-validator`
- CORS protection with allowlist
- Security headers (`X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`)
- Optional Firebase Firestore storage
- Local JSONL fallback storage
- Environment-based configuration via `dotenv`

### Deployment

- GitHub Actions workflow for automatic GitHub Pages deployment
- Zero-config static hosting
- Optional backend deployable on Render, Railway, Fly.io, or VPS

---

## Tech Stack

**Frontend**

- HTML5
- CSS3 (custom, no framework)
- Vanilla JavaScript

**Backend (Optional)**

- Node.js
- Express
- Nodemailer
- express-validator
- express-rate-limit
- cors
- Firebase Admin (optional)
- dotenv

**Deployment & Tooling**

- GitHub Pages
- GitHub Actions
- npm

---

## Project Structure

```text
.
|-- .github/
|   `-- workflows/
|       `-- pages.yml              # GitHub Pages deployment workflow
|-- assets/
|   `-- consulting-workspace.png   # Local visual asset
|-- server/                        # Optional Express backend
|   |-- env.example                # Sample environment file
|   |-- package.json
|   `-- server.js
|-- .nojekyll                      # Bypass Jekyll on GitHub Pages
|-- 404.html                       # Custom 404 redirect
|-- index.html                     # Main website
|-- raju_mama.html                 # Optional extra page (remove if unused)
|-- README.md
`-- SETUP.md
```

---

## Getting Started

### Prerequisites

- A modern web browser
- [Node.js](https://nodejs.org/) v18+ (only if you want to run the backend)
- Git

### Clone the Repository

```bash
git clone https://github.com/Bitttu4/shree-raj-co.git
cd shree-raj-co
```

### Run the Static Site Locally

You can open `index.html` directly in your browser, or serve it locally:

```bash
# Using Python
python -m http.server 8080

# Or using Node.js
npx serve .
```

Then visit: `http://localhost:8080`

### Run the Optional Backend

```bash
cd server
npm install
cp env.example .env
# Edit .env with your credentials
npm start
```

The backend will start on the configured port, usually `3000` or as set in `.env`.

---

## Contact Form Setup

The contact form supports two modes:

### 1. Static Mode (Default)

If no API URL is configured, the form opens a prefilled email draft using the visitor's default email client. This works out of the box with **zero backend**.

### 2. API Mode

To send submissions to the backend:

1. Deploy the `server/` folder to a Node.js hosting provider (Render, Railway, Fly.io, VPS, etc.).
2. Update the contact API URL in `index.html` (see `SETUP.md` for exact steps).
3. Ensure the backend's `ALLOWED_ORIGINS` includes your website domain.

**Example meta tag update in `index.html`:**

```html
<meta name="contact-api-url" content="https://api.shree-raj-co.com/api/contact">
```

If this meta tag is present and valid, the form will POST to the API. Otherwise, it falls back to email draft mode.

---

## Environment Variables

Create a `.env` file inside `server/` based on `server/env.example`.

| Variable | Required | Description |
| ---------- | ---------- | ------------- |
| `PORT` | No | Port for the backend server (default: `3000`) |
| `EMAIL_USER` | Yes | SMTP email address |
| `EMAIL_PASS` | Yes | SMTP password or app password |
| `OWNER_EMAIL` | Yes | Email address that receives contact submissions |
| `ALLOWED_ORIGINS` | Yes | Comma-separated list of allowed frontend origins |
| `CONTACT_RATE_LIMIT_MAX` | No | Max contact form submissions per IP (default: `5`) |
| `CONTACT_RATE_LIMIT_WINDOW_MS` | No | Rate limit window in milliseconds (default: `3600000`) |
| `FIREBASE_SERVICE_ACCOUNT` | No | Optional Firebase service account JSON |
| `DATA_DIR` | No | Directory for local JSONL fallback storage |
| `DISABLE_FILE_STORAGE` | No | Set to `true` to disable local file storage |

**Example `.env`:**

```env
PORT=3000
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
OWNER_EMAIL=owner@shree-raj-co.com
ALLOWED_ORIGINS=https://shree-raj-co.com,https://bitttu4.github.io
CONTACT_RATE_LIMIT_MAX=5
CONTACT_RATE_LIMIT_WINDOW_MS=3600000
DATA_DIR=./data
DISABLE_FILE_STORAGE=false
```

> **Security note:** Never commit your `.env` file or expose email passwords in frontend code.

---

## Backend API Reference

### `POST /api/contact`

Submit a contact form.

**Request Body:**

```json
{
  "name": "Raj Patel",
  "email": "raj@example.com",
  "phone": "+91 98765 43210",
  "service": "GST Filing",
  "message": "I need help with GST filing for my business."
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Thank you for contacting us. We'll get back to you soon."
}
```

**Error Response (400 / 429 / 500):**

```json
{
  "success": false,
  "error": "Validation failed",
  "details": ["Email is required"]
}
```

**Rate Limit:** Max 5 submissions per IP per hour (configurable).

**CORS:** Only origins listed in `ALLOWED_ORIGINS` are accepted.

---

## Deployment

### GitHub Pages

1. Go to your repository **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Push changes to the `main` branch.
4. Wait for the **Deploy to GitHub Pages** workflow to complete under the **Actions** tab.

The following files/folders are published:

- `index.html`
- `404.html`
- `raju_mama.html` (if used)
- `.nojekyll`
- `assets/`

The `server/` folder is **not** published to GitHub Pages.

### Backend Deployment (Optional)

Deploy the `server/` folder to any Node.js hosting provider:

**Render / Railway / Fly.io:**

1. Create a new Web Service.
2. Point it to the `server/` directory.
3. Set environment variables from `.env`.
4. Set build command: `npm install`
5. Set start command: `npm start`

**VPS (Ubuntu example):**

```bash
cd /var/www/shree-raj-co/server
npm install
npm install -g pm2
pm2 start server.js --name shree-raj-api
pm2 save
pm2 startup
```

Then set up Nginx as a reverse proxy for the API.

---

## Custom Domain Setup

Recommended domain: `shree-raj-co.com`

1. Add a `CNAME` file with your domain, or configure it in GitHub Pages settings.
2. Set these DNS records:

**A records for `@`:**

```text
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

**CNAME record for `www`:**

```text
bitttu4.github.io
```

1. Enable **Enforce HTTPS** in GitHub Pages settings.
2. Wait for DNS propagation (up to 24 hours).

---

## Security & Best Practices

- Keep email credentials only in backend environment variables.
- Use Gmail App Passwords or a dedicated SMTP provider (SendGrid, Mailgun, Resend, etc.).
- Restrict CORS to your production domain via `ALLOWED_ORIGINS`.
- Keep rate limiting enabled to prevent spam.
- Validate and sanitize all form inputs.
- Do not commit `.env`, service account JSON, or any secrets.
- Regularly update backend dependencies (`npm audit`, `npm update`).
- Use HTTPS only.
- Set security headers on the backend (already included).
- Consider adding a CAPTCHA (hCaptcha / reCAPTCHA) if spam increases.
- Back up Firestore or local JSONL storage regularly.

---

## Performance

- Fully static frontend — loads fast on any host
- No frontend framework overhead
- Local assets for reliable rendering
- Backend only invoked when contact form is submitted
- Rate limiting prevents abuse

---

## SEO & Accessibility

- Semantic HTML5 structure
- Responsive viewport meta tag
- Descriptive page title and meta description
- Alt text on images
- Keyboard-friendly navigation
- Sufficient color contrast in pastel theme
- Mobile-first design

To improve further:

- Add Open Graph and Twitter Card meta tags
- Add `sitemap.xml` and `robots.txt`
- Add structured data (JSON-LD) for local business
- Run Lighthouse audit and fix issues

---

## Troubleshooting

### Contact form opens email client instead of sending to backend

- Check that the meta tag `contact-api-url` is present in `index.html`.
- Verify the API URL is correct and reachable.
- Check browser console for CORS errors.

### Backend returns CORS error

- Ensure `ALLOWED_ORIGINS` includes your exact domain (with `https://`).
- Restart the backend after changing `.env`.

### Emails not being sent

- Verify `EMAIL_USER` and `EMAIL_PASS` are correct.
- For Gmail, use an **App Password**, not your main password.
- Check spam folder.
- Check backend logs for Nodemailer errors.

### Firebase not storing submissions

- Verify `FIREBASE_SERVICE_ACCOUNT` JSON is valid.
- If invalid, backend falls back to local JSONL storage.
- Check file permissions on `DATA_DIR`.

### GitHub Pages not updating

- Check the **Actions** tab for workflow errors.
- Ensure `Source` is set to **GitHub Actions**, not a branch.
- Clear browser cache.

---

## Roadmap

- [ ] Add blog / knowledge base section
- [ ] Add multi-language support (English / Hindi / Gujarati)
- [ ] Add client portal for document uploads
- [ ] Add CAPTCHA to contact form
- [ ] Add analytics (privacy-friendly, e.g., Plausible)
- [ ] Add automated tests for backend
- [ ] Add CI checks for HTML/CSS linting
- [ ] Add PWA support (offline access)

---

## Contributing

This is a private project for Shree Raj & Co. If you are authorized to contribute:

1. Create a new branch: `git checkout -b feature/your-feature`
2. Make your changes.
3. Test locally.
4. Commit with clear messages.
5. Push and open a pull request.

Please follow existing code style and keep changes focused.

---

## License

This project is proprietary and confidential.  
© Shree Raj & Co. All rights reserved.

Unauthorized copying, distribution, or use of this code, via any medium, is strictly prohibited without written permission from the owner.

---

## Contact

**Shree Raj & Co.**  
Vadodara, Gujarat, India  
Phone: `+91 94265 36855`

For website or technical issues, contact the repository owner.

---

## Acknowledgements

- Design inspiration: modern consulting firm websites
- Icons and badges: [shields.io](https://shields.io/)
- Hosting: [GitHub Pages](https://pages.github.com/)
