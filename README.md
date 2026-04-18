# Habit Circle — .NET + React

**Live demo:** <YOUR_LIVE_DEMO_URL_HERE>

A learning-focused full-stack app for building habits and sharing progress inside circles.

## Screenshots

Add screenshots to a `screenshots/` folder in the repo root, then update the links below.

- `screenshots/dashboard.png`
- `screenshots/circle-page.png`
- `screenshots/login.png`

Example markdown:

```md
![Dashboard](./screenshots/dashboard.png)
![Circle page](./screenshots/circle-page.png)
![Login](./screenshots/login.png)
```

## Features

- Auth (JWT) with persisted session (token + user in `localStorage`)
- Circles: create, join by invite code, list “my circles”, delete (admin-only)
- Habits: create/update/delete, logs, streak calculation
- Circle page: member cards + each member’s shared habits + stats
- Dashboard search with debounce + clear UX
- Global toasts/notifications (loading → success/error updates)
- Responsive UI + light/dark theme using CSS variables

## Tech Stack

**Backend**

- ASP.NET Core Web API (.NET)
- Entity Framework Core + PostgreSQL (Npgsql)
- JWT Bearer Authentication
- OpenAPI + Scalar (development)

**Frontend**

- React (Vite)
- React Router
- Axios (JWT interceptor)
- Mantine (core + notifications)
- Lucide icons
- CSS variables theming (light/dark)

## Concepts & Techniques Used

- Layering: Controllers → Services → DTO mapping
- Authorization rules enforced server-side (circle membership checks, admin-only delete)
- EF Core performance technique: `AsSplitQuery()` for multiple includes
- Debounced search + multi-term matching in dashboard panels
- Component maintainability: extracted reusable modals
- Toast UX pattern: show loading immediately, then update toast on success/error
- Responsive layouts via CSS grid + media queries

## AI Assistance

This project was built with help from AI coding assistants (Claude and **GPT-5.2**) for ideation, refactoring, and debugging support.

## Run Locally

### Prerequisites

- .NET SDK (matching the backend target framework)
- Node.js + npm
- PostgreSQL

### 1) Backend

From the repo root:

```bash
cd backend/HabitCircle.Api
# Update the connection string in appsettings.Development.json if needed
# Then run:
dotnet run
```

Default dev URL (from launch settings): `http://localhost:5212`

### 2) Frontend

From the repo root:

```bash
cd frontend
npm install
npm run dev
```

By default, the frontend expects the API at `http://localhost:5212/api`.
To override, create `frontend/.env`:

```bash
VITE_API_URL=http://localhost:5212/api
```

## Repo Structure

- `backend/` — ASP.NET Core API + EF Core + Postgres
- `frontend/` — React app (Vite)

## Next Improvements (ideas)

- Settings page: update profile info + change password
- Better circle moderation: promote admin, remove member, leave circle
- Stronger validation + rate limiting for auth endpoints
- Production config: real secrets management + hosted Postgres (Neon)
