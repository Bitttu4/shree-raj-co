# GitHub Pages Setup

This project is configured for GitHub Pages. The website is static, so GitHub Pages can host it directly from the workflow artifact.

## Required GitHub Settings

1. Open the repository on GitHub.
2. Go to `Settings` -> `Pages`.
3. Under `Build and deployment`, set `Source` to `GitHub Actions`.
4. Push to the `main` branch.
5. Go to the `Actions` tab.
6. Open `Deploy to GitHub Pages`.
7. Wait for the deploy job to complete.

Do not choose a local-machine or branch build process for this project. The workflow handles the Pages artifact.

## What the Workflow Publishes

The workflow file is:

```text
.github/workflows/pages.yml
```

It publishes:

```text
index.html
404.html
raju_mama.html
.nojekyll
assets/
CNAME, if present
```

It does not publish:

```text
server/
node_modules/
desktop-check.png
mobile-check.png
```

## If GitHub Pages Shows a Hosting Error

Check these items first:

1. `Settings` -> `Pages` -> `Source` must be `GitHub Actions`.
2. The latest workflow run must be green in the `Actions` tab.
3. The branch pushed must be `main`.
4. `index.html` must be at the repository root.
5. The repository must allow GitHub Actions under `Settings` -> `Actions` -> `General`.
6. If using a custom domain, the `CNAME` file and Pages custom-domain setting must match exactly.

The included `404.html` redirects unknown GitHub Pages paths back to the site homepage.

## Custom Domain

Create a root `CNAME` file with only your domain:

```text
www.shreerajco.com
```

Then configure the same value in GitHub `Settings` -> `Pages`.

DNS examples:

- `www` subdomain: create a CNAME record pointing to `yourusername.github.io`.
- Root domain: use GitHub Pages A records from the GitHub Pages settings screen.

## Contact Form on GitHub Pages

GitHub Pages does not run Node or Express. That means the `server/` folder cannot run on Pages.

Current Pages behavior:

- If `<meta name="contact-api" content="">` is empty, the form opens a prefilled email draft.
- If you deploy the API elsewhere and set the API URL, the form submits to that API.

To connect a hosted backend, edit `index.html`:

```html
<meta name="contact-api" content="https://your-api-domain.example">
```

Then deploy the `server/` folder separately to a Node host.

## Optional Backend Hosting

Use a Node host such as Render, Railway, Fly.io, or a VPS.

Backend settings:

```text
Root directory: server
Build command: npm install
Start command: npm start
```

Set environment variables from:

```text
server/env.example
```

Set `ALLOWED_ORIGINS` to your GitHub Pages URL and custom domain:

```env
ALLOWED_ORIGINS=https://yourusername.github.io,https://yourusername.github.io/shree-raj-co,https://www.shreerajco.com
```

## Optional Local Preview

Local preview is not required for hosting. Use it only if you want to check the page before pushing:

```bash
python -m http.server 5500
```

Open:

```text
http://localhost:5500
```
