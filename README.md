# Shree Raj & Co. Website

Pastel, responsive static website for Shree Raj & Co., designed to deploy on GitHub Pages. No local machine is needed for hosting.

## GitHub Pages Deployment

1. Push this repository to GitHub.
2. In the GitHub repo, open `Settings` -> `Pages`.
3. Set `Source` to `GitHub Actions`.
4. Push to the `main` branch.
5. Open the Actions tab and wait for `Deploy to GitHub Pages` to finish.

The workflow at `.github/workflows/pages.yml` publishes only:

```text
index.html
404.html
raju_mama.html
.nojekyll
assets/
CNAME, if present
```

The `server/` folder is intentionally not deployed to GitHub Pages because Pages can host only static files.

## Custom Domain

Create a root `CNAME` file containing only your domain:

```text
www.shreerajco.com
```

Then set the same custom domain in GitHub repo `Settings` -> `Pages`.

## Contact Form

GitHub Pages cannot run the Express backend. The form works on Pages in two modes:

- With no API URL set, it opens a prefilled email draft.
- With an API URL set, it posts to the deployed backend.

To connect a hosted API, update this line in `index.html`:

```html
<meta name="contact-api" content="https://your-api-domain.example">
```

Host the backend separately from the `server/` folder on a Node service such as Render, Railway, Fly.io, or a VPS.

## Optional Local Testing

Local testing is optional and only for previewing before pushing:

```bash
python -m http.server 5500
```

Then open `http://localhost:5500`.
