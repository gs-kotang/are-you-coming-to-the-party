# Deployment guide

Same stack as People Journal:

- **Frontend:** Cloudflare Pages
- **Backend:** Render (or Railway)
- **Database:** Neon (Postgres)
- **Images:** Cloudflare R2

---

## 1. Backend (Render)

1. [render.com](https://render.com) → **New → Web Service** → connect repo.
2. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
3. Environment variables (see below).
4. Deploy and note the URL (e.g. `https://party-invites.onrender.com`).

---

## 2. Environment variables

### Backend (Render)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon connection string |
| `CORS_ORIGIN` | `https://your-site.pages.dev,http://localhost:5174` |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | Service account email |
| `FIREBASE_PRIVATE_KEY` | Private key with `\n` for line breaks |
| `R2_BUCKET` | R2 bucket name |
| `R2_ACCESS_KEY_ID` | R2 API token |
| `R2_SECRET_ACCESS_KEY` | R2 secret |
| `R2_PUBLIC_URL` | Public bucket URL (e.g. `https://pub-xxx.r2.dev`) |

Optional: `R2_ENDPOINT`, `R2_REGION` (default `auto`).

### Frontend (Cloudflare Pages)

| Variable | Value |
|----------|--------|
| `VITE_API_URL` | Backend URL, no trailing slash |
| `VITE_FIREBASE_*` | Firebase web app config |

Redeploy frontend after setting env vars.

---

## 3. Database migrations

Run once against Neon:

```bash
cd backend
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

---

## 4. Cloudflare Pages SPA routing

The repo includes `frontend/public/_redirects` so routes like `/invite/:id` work on refresh.

Build settings:

- **Root directory:** `frontend`
- **Build command:** `npm install && npm run build`
- **Output directory:** `dist`

---

## 5. Checklist

- [ ] Neon database + `prisma migrate deploy`
- [ ] R2 bucket with public access + API token
- [ ] Backend on Render with all env vars; `CORS_ORIGIN` includes Pages URL
- [ ] Frontend on Cloudflare Pages with `VITE_API_URL` + Firebase vars
- [ ] Test: sign in → create invite with photo → open share link in incognito → RSVP → see name on past invites

---

## 6. Local development

- Backend `.env`: local `DATABASE_URL` (port 5434). Omit `R2_*` for local disk uploads.
- Frontend: omit `VITE_API_URL` so Vite proxies to `localhost:3002`.
