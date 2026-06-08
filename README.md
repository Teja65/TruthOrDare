# TruthOrDare

A full-stack **Truth or Dare** party game. Players sign in with Firebase, create or join rooms with a code, pick categories, take turns on truth/dare prompts, and track scores.

| Layer    | Stack                                              |
| -------- | -------------------------------------------------- |
| Frontend | React 19, Vite, TypeScript, Redux, React Router    |
| Backend  | Express, TypeScript, Mongoose, Firebase Admin, JWT |
| Database | MongoDB Atlas                                      |
| Auth     | Firebase (email/password + Google)                 |

**Recommended hosting:** [Vercel](https://vercel.com) (client) + [Render](https://render.com) (server)

---

## Project structure

```
TruthOrDare/
├── client/          # React frontend (deploy to Vercel)
│   ├── src/
│   └── .env.example
└── server/          # Express API (deploy to Render)
    ├── src/
    └── .env.example
```

---

## Run locally

### Prerequisites

- Node.js 18+
- MongoDB Atlas cluster (or local MongoDB)
- Firebase project with **Authentication** enabled (Email/Password + Google)

### 1. Server

```bash
cd server
cp .env.example .env
# Edit .env with your real values (see Environment variables below)
npm install
npm run dev
```

Server runs at **http://localhost:4000**

### 2. Client

```bash
cd client
cp .env.example .env
# Set VITE_API_BASE_URL=http://localhost:4000/api
npm install
npm run dev
```

Client runs at **http://localhost:5173**

### 3. Firebase setup (required for login)

1. [Firebase Console](https://console.firebase.google.com) → your project → **Authentication** → enable Email/Password and Google.
2. **Authentication → Settings → Authorized domains** → add `localhost` and your Vercel domain (e.g. `your-app.vercel.app`).
3. **Project settings → Service accounts** → **Generate new private key** → use values in server `FIREBASE_*` env vars.

---

## Environment variables

### Render (backend)

Create a **Web Service** pointing at the `server` folder.

| Variable               | Required | Description |
| ---------------------- | -------- | ----------- |
| `MONGO_URI`            | Yes      | MongoDB Atlas connection string |
| `JWT_SECRET`           | Yes      | Long random string for signing API JWTs |
| `FIREBASE_PROJECT_ID`  | Yes      | Firebase project ID |
| `FIREBASE_CLIENT_EMAIL`| Yes      | Service account email from Firebase JSON key |
| `FIREBASE_PRIVATE_KEY` | Yes      | Private key from JSON key. Paste with `\n` for newlines, or wrap in quotes as in `.env.example` |
| `PORT`                 | No       | Render sets this automatically |

**Render build & start commands:**

| Setting            | Value              |
| ------------------ | ------------------ |
| Root directory     | `server`           |
| Build command      | `npm install && npm run build` |
| Start command      | `npm start`        |
| Instance type      | Free or paid       |

After deploy, note your API URL, e.g. `https://truth-or-dare-api.onrender.com`

Health check: open `https://YOUR-RENDER-URL/api/rooms` (should return JSON).

---

### Vercel (frontend)

Import the repo and set **Root Directory** to `client`.

| Variable              | Required | Description |
| --------------------- | -------- | ----------- |
| `VITE_API_BASE_URL`   | Yes      | Render API base URL with `/api`, e.g. `https://truth-or-dare-api.onrender.com/api` |

**Vercel build settings:**

| Setting        | Value           |
| -------------- | --------------- |
| Root directory | `client`        |
| Framework      | Vite            |
| Build command  | `npm run build` |
| Output directory | `dist`        |

`client/vercel.json` is included for React Router SPA routing.

---

## Deployment process

### Step 1 — MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. **Database Access** → create a database user.
3. **Network Access** → allow `0.0.0.0/0` (or Render’s IPs) for cloud hosting.
4. **Connect** → copy connection string → set `MONGO_URI` on Render (database name: `Truth_or_Dare` or your choice).

### Step 2 — Deploy API on Render

1. [dashboard.render.com](https://dashboard.render.com) → **New +** → **Web Service**.
2. Connect your GitHub repo.
3. Set **Root directory** to `server`.
4. Add all **Render environment variables** from the table above.
5. Deploy and copy the service URL.

### Step 3 — Deploy client on Vercel

1. [vercel.com/new](https://vercel.com/new) → import the same repo.
2. Set **Root directory** to `client`.
3. Add `VITE_API_BASE_URL` = `https://YOUR-RENDER-SERVICE.onrender.com/api`.
4. Deploy.

### Step 4 — Link Firebase to production

1. Firebase → **Authentication → Settings → Authorized domains** → add your Vercel domain.
2. Redeploy Vercel if you change env vars (required for `VITE_*` at build time).

### Step 5 — Verify

1. Open the Vercel URL → sign in.
2. Create a room and play a round.
3. If API calls fail, check Render logs and confirm `VITE_API_BASE_URL` matches your Render URL.

---

## Production notes

- **CORS:** The server allows all origins (`cors({ origin: true })`), so the Vercel app can call the Render API.
- **Render free tier:** The service sleeps after inactivity; the first request may take 30–60 seconds.
- **Custom questions:** Saved to `en.json` on the server filesystem. On Render, those writes are **ephemeral** (lost on redeploy). For permanent custom questions in production, use MongoDB or object storage later.
- **Secrets:** Never commit `.env`. Use placeholders in `.env.example` only.

---

## API overview

| Prefix           | Purpose                          |
| ---------------- | -------------------------------- |
| `/api/auth`      | Firebase token → JWT             |
| `/api/rooms`     | Create, join, list rooms         |
| `/api/games`     | Game flow, scores, end game      |
| `/api/players`   | Update player names              |
| `/api/questions` | Question pool from `en.json`     |

---

## Scripts reference

### Client (`client/`)

| Command         | Description        |
| --------------- | ------------------ |
| `npm run dev`   | Dev server (Vite)  |
| `npm run build` | Production build   |
| `npm run preview` | Preview production build |

### Server (`server/`)

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Dev server with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start`     | Run production server    |

---

## License

MIT
