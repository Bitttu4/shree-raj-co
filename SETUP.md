# Setup and Deployment

This project has two deployable parts:

- Static website: `index.html`, `assets/`, and `raju_mama.html`, hosted on GitHub Pages or a custom domain.
- Contact API: `server/`, hosted on a Node-compatible service.

GitHub Pages cannot run an Express backend, so the API must be deployed separately if you want direct form submission without opening an email draft.

## 1. Run the Website Locally

From the repository root:

```bash
python -m http.server 5500
```

Open:

```text
http://localhost:5500
```

The frontend automatically uses `http://localhost:3000` as the API while running locally.

## 2. Run the API Locally

```bash
cd server
copy env.example .env
npm install
npm run dev
```

Open the health check:

```text
http://localhost:3000/api/health
```

## 3. Configure API Environment

Edit `server/.env`.

Required for email notifications:

```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-16-character-app-password
OWNER_EMAIL=shreerajco@yahoo.com
```

Allowed origins:

```env
ALLOWED_ORIGINS=http://localhost:5500,https://yourusername.github.io,https://www.yourdomain.com
```

Optional Firestore storage:

```env
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"..."}
```

If Firebase is not configured, the API writes submissions to `server/data/contact-submissions.jsonl`.

## 4. Test the API

```bash
curl -X POST http://localhost:3000/api/contact ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test Client\",\"email\":\"test@example.com\",\"phone\":\"9876543210\",\"service\":\"Income Tax / ITR Filing\",\"message\":\"I need help filing my return.\",\"website\":\"\"}"
```

Expected result:

```json
{
  "success": true,
  "message": "Enquiry received."
}
```

## 5. Deploy the Static Site to GitHub Pages

1. Push the repository to GitHub.
2. Go to repository settings.
3. Open Pages.
4. Set the Pages source to GitHub Actions.
5. Push to the `main` branch.

The workflow at `.github/workflows/pages.yml` publishes only the static website files.

## 6. Deploy the API

Deploy the `server/` directory to a Node host.

Use these commands:

```text
Build command: npm install
Start command: npm start
```

Set all environment variables from `server/env.example` in the hosting dashboard.

After deployment, confirm:

```text
https://your-api-domain.example/api/health
```

## 7. Connect the Website to the API

In `index.html`, update:

```html
<meta name="contact-api" content="">
```

to:

```html
<meta name="contact-api" content="https://your-api-domain.example">
```

Commit and push the change. The next GitHub Pages deployment will use the live API.

## 8. Use a Custom Domain

Create a root `CNAME` file with only the domain:

```text
www.shreerajco.com
```

Commit and push it. The workflow automatically includes `CNAME` when it exists.

In GitHub Pages settings, add the same custom domain. Then configure DNS with your domain provider:

- For `www`, create a CNAME record pointing to `yourusername.github.io`.
- For an apex/root domain, use GitHub Pages A records in your DNS provider.

Keep backend secrets out of GitHub. Only the API URL belongs in `index.html`.
