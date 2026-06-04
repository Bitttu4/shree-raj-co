# Shree Raj & Co. Website

Professional static website for **Shree Raj & Co.**, a tax consulting firm in Vadodara. The site is designed for GitHub Pages hosting with a clean pastel interface, responsive layout, service details, contact options, and a deploy-ready static workflow.

## Live Hosting Model

This project is configured for **GitHub Pages**. GitHub Pages hosts only static files, so the frontend is deployed from the repository while the optional Express backend must be hosted separately if direct form submission is required.

The GitHub Pages workflow publishes:

```text
index.html
404.html
raju_mama.html
.nojekyll
assets/
CNAME, if present
```

The `server/` directory is not published to GitHub Pages.

## Features

- Responsive pastel UI for desktop, tablet, and mobile
- Services, about, process, testimonials, FAQ, and contact sections
- GitHub Pages deployment through GitHub Actions
- Custom-domain-ready configuration
- Contact form with static-hosting fallback
- Optional Express backend for API-based contact submissions
- Local visual asset for reliable page rendering
- Custom `404.html` redirect for GitHub Pages path handling

## Project Structure

```text
.
|-- .github/workflows/pages.yml
|-- assets/
|   `-- consulting-workspace.png
|-- server/
|   |-- env.example
|   |-- package.json
|   `-- server.js
|-- .nojekyll
|-- 404.html
|-- index.html
|-- raju_mama.html
|-- README.md
`-- SETUP.md
```

## Deploy to GitHub Pages

1. Push the repository to GitHub.
2. Open the repository on GitHub.
3. Go to `Settings` -> `Pages`.
4. Under `Build and deployment`, set `Source` to `GitHub Actions`.
5. Push changes to the `main` branch.
6. Open the `Actions` tab and wait for `Deploy to GitHub Pages` to complete.

After the workflow succeeds, GitHub will show the published Pages URL in `Settings` -> `Pages`.

## Custom Domain

Recommended custom domain:

```text
shree-raj-co.com
```

In GitHub:

1. Go to `Settings` -> `Pages`.
2. Under `Custom domain`, enter:

    ```text
    shree-raj-co.com
    ```

3. Save the setting.
4. Enable `Enforce HTTPS` after GitHub finishes checking DNS.

## DNS Records

DNS records are added at the domain provider, not inside GitHub. Use the DNS dashboard where the domain was purchased.

For the root domain `shree-raj-co.com`, add these `A` records:

```text
Type: A
Host/Name: @
Value: 185.199.108.153
```

```text
Type: A
Host/Name: @
Value: 185.199.109.153
```

```text
Type: A
Host/Name: @
Value: 185.199.110.153
```

```text
Type: A
Host/Name: @
Value: 185.199.111.153
```

For `www.shree-raj-co.com`, add this `CNAME` record:

```text
Type: CNAME
Host/Name: www
Value: bitttu4.github.io
```

Set TTL to `Automatic` or the provider default.

Remove old/default `A`, `AAAA`, forwarding, parking, or `CNAME` records for `@` and `www` if they conflict with the records above.

DNS changes can take from a few minutes up to 24 hours to propagate.

## Contact Form Behavior

Because GitHub Pages cannot run backend code, the contact form supports two modes:

- **Static mode:** if no API URL is configured, the form opens a prefilled email draft.
- **API mode:** if a backend API URL is configured, the form posts to that API.

To connect a deployed API, update this meta tag in `index.html`:

```html
<meta name="contact-api" content="https://your-api-domain.example">
```

Keep email passwords, SMTP credentials, and Firebase credentials out of the frontend. They belong only in backend environment variables.

## Optional Backend Hosting

The Express backend is located in `server/`. Host it on a Node-compatible service such as Render, Railway, Fly.io, or a VPS.

Suggested hosting settings:

```text
Root directory: server
Build command: npm install
Start command: npm start
```

Copy `server/env.example` to the hosting provider's environment variables and set:

```text
EMAIL_USER
EMAIL_PASS
OWNER_EMAIL
ALLOWED_ORIGINS
```

For GitHub Pages and the custom domain, `ALLOWED_ORIGINS` should include:

```env
ALLOWED_ORIGINS=https://bitttu4.github.io,https://bitttu4.github.io/shree-raj-co,https://shree-raj-co.com,https://www.shree-raj-co.com
```

## Optional Local Preview

Local preview is only for development. It is not required for hosting.

```bash
python -m http.server 5500
```

Open:

```text
http://localhost:5500
```

## Deployment Checklist

- `index.html` exists at the repository root
- GitHub Pages source is set to `GitHub Actions`
- The latest Pages workflow run is successful
- Custom domain is saved in GitHub Pages settings
- DNS `A` records point to GitHub Pages
- DNS `www` CNAME points to `bitttu4.github.io`
- HTTPS is enabled after DNS validation completes

## Maintainer

Developed and maintained for **Shree Raj & Co.**
