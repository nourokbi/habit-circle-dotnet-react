# Backend (ASP.NET Core API)

This is the backend for Habit Circle.

## Tech

- ASP.NET Core Web API
- EF Core + PostgreSQL (Npgsql)
- JWT Bearer Authentication
- OpenAPI + Scalar (enabled in Development)

## Project Structure

- `HabitCircle.Api/Controllers` — HTTP endpoints
- `HabitCircle.Api/Services` — business logic
- `HabitCircle.Api/DTOs` — request/response models
- `HabitCircle.Api/Models` — EF Core entities
- `HabitCircle.Api/Data/AppDbContext.cs` — database context
- `HabitCircle.Api/Migrations` — EF migrations
- `HabitCircle.Api/Helpers` — utility helpers (invite code, streak calculation)

## Configuration

Key settings live in:

- `HabitCircle.Api/appsettings.json`
- `HabitCircle.Api/appsettings.Development.json`

### Database

`ConnectionStrings:DefaultConnection` must point to your PostgreSQL instance.

Example (development):

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=habit_circle;Username=postgres;Password=123"
  }
}
```

## Running the API

From repo root:

```bash
cd backend/HabitCircle.Api
dotnet run
```

Default dev URL: `http://localhost:5212`

### Migrations

On startup, the app runs `db.Database.Migrate()`.
So if your connection string is correct, the schema is created/updated automatically.

## Authentication

- JWT is used for protected endpoints.
- Most circle/habit routes require a valid token.

How the frontend sends the token:

- Stored in `localStorage` as `hc_token`
- Sent as header: `Authorization: Bearer <token>`

## Main Endpoints (high level)

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`

Circles:

- `POST /api/circle` (create)
- `POST /api/circle/join/{inviteCode}` (join)
- `GET /api/circle/my` (my circles)
- `GET /api/circle/{id}` (circle details, member-only)
- `GET /api/circle/{id}/page` (circle page aggregated response, member-only)
- `GET /api/circle/{id}/habits` (shared habits in circle, member-only)
- `DELETE /api/circle/{id}` (admin-only)

Habits:

- See `HabitController` for CRUD + logs endpoints.

## Notes

- Circle access is enforced server-side: non-members cannot load circle details.
- Circle delete is admin-only.
- EF Core uses `AsSplitQuery()` on heavy includes to avoid cartesian explosions.

## Deploying to Render (Docker)

Render can deploy this API using the Dockerfile at:

- `backend/HabitCircle.Api/Dockerfile`

### 1) Create a Render Web Service

- New → **Web Service** → connect your GitHub repo
- Environment: **Docker**
- Dockerfile path: `backend/HabitCircle.Api/Dockerfile`
- Docker build context: repo root
- Port: `8080`

### 2) Set environment variables on Render

Required:

- `ConnectionStrings__DefaultConnection` — hosted Postgres connection string
- `JwtSettings__Secret` — strong secret (rotate if you ever exposed one)

Recommended:

- `ASPNETCORE_ENVIRONMENT=Production`
- `CORS_ORIGINS=https://your-frontend-domain.com,http://localhost:5173`

Notes for hosted Postgres (Neon etc.):

- You may need SSL parameters in the connection string (depends on provider).

### 3) Point the frontend to the hosted API

Set your frontend build env var:

- `VITE_API_URL=https://your-render-service.onrender.com/api`

Then redeploy the frontend so Vite bakes the variable into the build.
