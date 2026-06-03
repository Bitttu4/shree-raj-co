# Shree Raj & Co. Website

Pastel, responsive website for Shree Raj & Co., a tax consulting firm in Vadodara. The frontend is static and deploys to GitHub Pages. The contact form can connect to the included Express API or fall back to a prefilled email draft when the API URL is not configured.

## Features

- Clean responsive UI with local visual asset
- Services, about, process, testimonials, FAQ, and contact sections
- Accessible form validation and mobile navigation
- Express contact API with rate limiting, CORS controls, validation, email notifications, and storage fallback
- GitHub Pages workflow for static deployment

## Project Structure

```text
.
├── index.html
├── raju_mama.html
├── assets/
│   └── consulting-workspace.png
├── server/
│   ├── server.js
│   ├── package.json
│   └── env.example
├── .github/workflows/pages.yml
├── .nojekyll
├── SETUP.md
└── README.md
```

## Local Frontend

Open `index.html` directly, or run a small static server from the repo root:

```bash
python -m http.server 5500
```

Then visit `http://localhost:5500`.

## Local Backend

```bash
cd server
copy env.example .env
npm install
npm run dev
```

The API runs at `http://localhost:3000`. Local frontend pages automatically try that URL.

## Deploy

Push to `main`. The GitHub Actions workflow publishes `index.html`, `raju_mama.html`, `.nojekyll`, and `assets/` to GitHub Pages.

For a custom domain, create a root `CNAME` file containing only the domain, for example:

```text
www.shreerajco.com
```

Then configure the same domain in GitHub repository settings under Pages.

## Backend Hosting

Deploy the `server/` folder to any Node host such as Render, Railway, Fly.io, or a VPS.

Use:

```text
Build command: npm install
Start command: npm start
```

After the API is live, set the frontend API URL in `index.html`:

```html
<meta name="contact-api" content="https://your-api-domain.example">
```

Keep email and Firebase credentials only in backend environment variables.
