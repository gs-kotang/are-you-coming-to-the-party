# Architecture — Are You Coming to the Party?

## What we're building

A simple invite-and-RSVP app:

1. **Creators** sign in with Google (Firebase), upload an invite image, set an RSVP deadline, and get a shareable link.
2. **Guests** open the link (no sign-in), see the image, enter their name, and tap **Yes!** to RSVP.
3. **Creators** view past invites and see who RSVP'd, with counts and timestamps.
4. After the **expiry deadline**, the public page stops accepting RSVPs (buttons hidden; message shown).

## High-level architecture

Same deployment pattern as [People Journal](../peopleJournal):

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Vite → **Cloudflare Pages** |
| Backend | Node.js + Express + TypeScript → **Render** |
| Database | PostgreSQL (Docker locally, **Neon** in production) |
| Auth | Firebase Google sign-in (creators only) |
| Images | Local disk (dev) / **Cloudflare R2** (production) |

```
┌─────────────┐     Firebase ID token      ┌─────────────┐
│   Browser   │ ─────────────────────────► │   Render    │
│ (CF Pages)  │ ◄───────────────────────── │  (Express)  │
└──────┬──────┘         JSON + images       └──────┬──────┘
       │                                           │
       │  /invite/:id (public, no auth)            │ Prisma
       └──────────────────────────────────────────►│ Neon Postgres
                                                   └ R2 (images)
```

### Authenticated vs public routes

| Route | Auth | Purpose |
|-------|------|---------|
| `/` | Yes | Home — two buttons |
| `/create` | Yes | Upload photo + set expiry |
| `/invites` | Yes | List creator's invites |
| `/invites/:id` | Yes | Detail + RSVP list |
| `/invite/:id` | **No** | Guest RSVP page |

## Data model

```text
User
- id          String   (Firebase UID)
- email       String
- name        String?
- photoURL    String?

Invite
- id          UUID     (used in share URL)
- userId      String   → User
- imagePath   String   (local filename or R2 key)
- expiresAt   DateTime (RSVP deadline)
- createdAt   DateTime

Rsvp
- id          UUID
- inviteId    UUID     → Invite
- name        String   (guest's name, trimmed)
- createdAt   DateTime

Unique: (inviteId, name) — prevents duplicate names on the same invite
```

## API surface

### Authenticated (`Authorization: Bearer <firebase-token>`)

```text
POST   /api/invites
  multipart: photo, expiresAt (ISO datetime)
  → { id, imageUrl, expiresAt, shareUrl, createdAt }

GET    /api/invites
  → [{ id, imageUrl, expiresAt, isExpired, rsvpCount, createdAt }, ...]

GET    /api/invites/:id
  → { ...summary, shareUrl, rsvps: [{ id, name, createdAt }] }
```

### Public (no auth)

```text
GET    /api/public/invites/:id
  → { id, imageUrl, expiresAt, isExpired }

POST   /api/public/invites/:id/rsvp
  body: { name }
  → 201 on success
  → 410 if expired
  → 409 if name already RSVP'd on this invite
```

## Expiry behavior

- `expiresAt` is set when the invite is created.
- Public page: if `now >= expiresAt`, show “RSVPs are closed” — no name field, no button.
- Backend rejects new RSVPs with **410 Gone** after expiry (defense in depth).

## How creators see who RSVP'd (design choices)

We implemented a **creator dashboard** approach:

### Past invites list (`/invites`)
- Thumbnail of the invite image
- RSVP count badge (“12 coming”)
- Open / Closed status from expiry
- Tap a card → detail view

### Invite detail (`/invites/:id`)
- Full image + stats (count, open/closed)
- **Who's coming** list: name + timestamp (newest first)
- **Copy share link** — re-share anytime
- **Copy names** — comma-separated list for texting or spreadsheets

### Why this works well
- **At-a-glance**: count on the list page answers “how many?” without opening each invite.
- **Detail when needed**: full name list with times for “who exactly?”
- **Copy names**: zero-friction export for group chats or headcount planning.
- **No guest auth**: keeps the RSVP flow frictionless; creators get the audit trail.

### Possible future enhancements (not built yet)
- **Auto-refresh** on detail page (poll every 30s) for live party planning
- **“No” option** if you want declines counted separately
- **Email/SMS reminders** before expiry
- **QR code** on the create-success screen for in-person sharing
- **Case-insensitive duplicate names** (currently exact match after trim)

## Image storage

Mirrors People Journal:

- **Dev**: files in `backend/uploads/`, served at `/uploads/*`
- **Prod**: upload to R2; public URLs via `R2_PUBLIC_URL`

## Security notes

- Only invite **owners** can list/view their invites (checked via `userId`).
- Public endpoints expose only image + expiry — not the full RSVP list (guests can't see who else is coming unless you add that intentionally).
- Share links use unguessable UUIDs (`/invite/<uuid>`).

## Local development

```bash
docker-compose up -d          # Postgres on port 5434
cd backend && npm install && cp .env.example .env
npm run prisma:migrate && npm run dev   # :3002

cd frontend && npm install && npm run dev   # :5174
```

Set Firebase env vars in `backend/.env` and `frontend/.env` (see `.env.example` files). You can reuse the same Firebase project as People Journal or create a new one.

## Production deployment

See [DEPLOY.md](./DEPLOY.md) — same stack as People Journal (Neon, R2, Render, Cloudflare Pages).
