# Aeterna Geneve — Vercel Deployment

The React/Vite storefront and Express API are deployed together on Vercel. MongoDB Atlas stores application data and Cloudinary stores/delivers media. Cloudinary is not an application server, so the Express API runs as the Vercel function at `api/index.js`.

## Required Vercel environment variables

Configure these for Production, Preview, and Development in the Vercel project settings:

- `MONGO_URI` — MongoDB Atlas connection string with a production database name.
- `JWT_SECRET` — a long, randomly generated signing secret.
- `CLOUDINARY_CLOUD_NAME` — Cloudinary cloud name.
- `CLOUDINARY_API_KEY` — Cloudinary API key.
- `CLOUDINARY_API_SECRET` — Cloudinary API secret.
- `REMOVEBG_API_KEY` — optional; only required for background removal.
- `ALLOWED_ORIGINS` — optional comma-separated custom domains.
- `VITE_SITE_URL` — canonical public origin, without a trailing slash. Defaults to `https://aeterna-geneve-ten.vercel.app`.

Do not add `PORT` on Vercel. Vercel invokes the exported Express app directly.

## Deployment settings

- Framework preset: Vite
- Root directory: repository root
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

After deployment, verify:

1. `GET /api/health` returns `status: "ok"`.
2. `GET /api/homepage` returns the homepage configuration.
3. An authenticated admin image upload returns a Cloudinary HTTPS URL.
4. `/robots.txt` and `/sitemap.xml` return their real files rather than the SPA shell.
5. Direct navigation to `/watches`, `/collections`, and `/blog` loads correctly.

## Custom domain

When a custom domain is connected, set `VITE_SITE_URL` to that origin and update the URLs in `public/robots.txt` and `public/sitemap.xml` before rebuilding. Configure the Vercel domain redirect so only one HTTPS hostname is canonical.

## Security notice

Never commit MongoDB, Cloudinary, JWT, or remove.bg credentials. If a credential has ever appeared in a committed file or shared deployment guide, rotate it in the provider dashboard and update the Vercel environment variable.
