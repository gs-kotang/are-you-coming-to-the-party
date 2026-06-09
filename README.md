# Are You Coming to the Party?

Upload a party invite, share a link, and see who RSVP'd yes — before the deadline.

## Quick start

### 1. Database

```bash
docker-compose up -d
```

Postgres runs on port **5434**, database `partyinvites`.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env: DATABASE_URL and Firebase credentials

npm run prisma:migrate
npm run dev
```

Backend: http://localhost:3002

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env: Firebase web app config (VITE_FIREBASE_*)

npm run dev
```

Frontend: http://localhost:5174

## Usage

1. Sign in with Google.
2. **Create new invite** — upload a photo, set RSVP deadline, copy the share link.
3. Share `/invite/<id>` with guests (no sign-in required).
4. **View past invites** — see counts; open any invite for the full RSVP list.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for design details and [DEPLOY.md](./DEPLOY.md) for production deployment.
