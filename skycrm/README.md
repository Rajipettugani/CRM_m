# SkyCRM (Node/Express + MongoDB + React + Vite + Tailwind)

A minimal, role-based CRM to manage marketing-sourced leads with four roles:
**Admin, Sales Head, Sales Team Lead, Sales Representative**.

## Tech

- Backend: Node.js (Express), MongoDB (Mongoose), JWT, bcrypt, dotenv, CORS, morgan, multer
- Frontend: React + Vite, React Router, Axios, React Query, Tailwind CSS
- Postman: `SkyCRM.postman_collection.json` with `baseUrl` and `token` variables

## Setup

### Backend
```bash
cd backend
cp .env.example .env  # edit if needed
npm install
npm run seed          # seeds roles, users, statuses, sample team/leads
npm run dev           # runs on http://localhost:8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev           # runs on http://localhost:5173
```

### Login (Seeded)
- Admin — `admin@test.com` / `password@123`
- Sales Head — `manager@test.com` / `manager@123`
- Team Lead — `lead@test.com` / `lead@123`
- Sales Rep — `rep@test.com` / `rep@123`

## Project Structure

```
backend/
  src/
    config/db.js
    server.js
    app.js
    seed.js
    models/*.js
    middleware/*.js
    controllers/*.js
    routes/*.js
  uploads/
  package.json
  .env.example

frontend/
  src/
    components/
    pages/
      dashboards/
    services/
    utils/
  public/
  index.html
  package.json
  tailwind.config.js
  postcss.config.js
  vite.config.js

SkyCRM.postman_collection.json
README.md
```

## Notes

- JWT payload: `{ userId, email, name, roleId, roleName }`
- Frontend stores token in `localStorage` and uses `roleName` for routing to `/admin`, `/manager`, `/teamlead`, `/rep`.
- All API routes under `/api` with Bearer auth; see Postman for examples.
- File uploads are stored under `backend/uploads/` and served at `/uploads/...`.

This is a compact, ready-to-run baseline meeting your acceptance criteria. Extend UI charts and management forms as needed.
