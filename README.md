# Habit Circle

A habit tracker where you can share your habits with small groups of friends, called circles. You track your own habits, log them each day, and choose which ones members of a circle can see.

Built with an ASP.NET Core Web API, PostgreSQL and a React frontend.

## Features

- Register and log in with email and password, or sign in with Google
- Create habits with a frequency (daily, weekly, monthly or yearly), edit them, delete them, and log or undo today's entry
- Streak calculation from your habit logs
- Create a circle and invite people with a short invite code
- Share a habit into one or more circles. Members only see habits that were shared with that circle
- Circle page with member cards, each member's shared habits and their stats
- Only a circle's admin (the person who created it) can delete it
- Dashboard search, light and dark theme, and a responsive layout

## Tech stack

| Layer | Tools |
|---|---|
| Backend | ASP.NET Core Web API (.NET 10), Entity Framework Core, Npgsql |
| Database | PostgreSQL (Neon in production) |
| Auth | JWT bearer tokens, BCrypt password hashing, Google sign-in (Google.Apis.Auth) |
| API docs | OpenAPI with Scalar (development only) |
| Frontend | React (Vite), React Router, Axios, Mantine, HeroUI, Tailwind CSS, lucide-react |

## How it works

The API is split into controllers, services and DTOs. Controllers handle HTTP, services hold the business rules, and DTOs keep the database models out of the responses.

Permissions are checked on the server, not just hidden in the UI. Before returning a circle or its habits, the service checks that the user is a member, and deleting a circle requires the admin role.

If someone signs in with Google using an email that already has an account, they're signed into that same account, so they don't end up with two.

Queries that load several related collections use EF Core's `AsSplitQuery()` to avoid one large joined query.

### Data model

- **User**: has many habits and many circle memberships
- **Habit**: belongs to one user, has many logs, and can be shared into many circles
- **HabitLog**: one check-in for a habit, with an optional note
- **Circle**: has an invite code, members and shared habits
- **CircleMember**: joins users and circles, with a role (`admin` or `member`)
- **CircleHabit**: joins habits and circles, and records when the habit was shared

## API

Every endpoint except the auth ones needs an `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Log in and get a JWT |
| POST | `/api/auth/google` | Sign in with a Google token |
| GET | `/api/habit` | List my habits |
| POST | `/api/habit` | Create a habit |
| GET | `/api/habit/{id}` | Get one habit |
| PUT | `/api/habit/{id}` | Update a habit |
| DELETE | `/api/habit/{id}` | Delete a habit |
| POST | `/api/habit/{id}/log` | Log the habit |
| DELETE | `/api/habit/{id}/log/today` | Undo today's log |
| GET | `/api/habit/{id}/logs` | Get a habit's logs |
| GET | `/api/habit/frequency-types` | List frequency options |
| POST | `/api/circle` | Create a circle |
| GET | `/api/circle/my` | List my circles |
| GET | `/api/circle/{id}` | Get a circle |
| GET | `/api/circle/{id}/page` | Circle page data: members, shared habits, stats |
| POST | `/api/circle/join/{inviteCode}` | Join a circle |
| POST | `/api/circle/{id}/habits` | Share a habit into a circle |
| GET | `/api/circle/{id}/habits` | List habits shared in a circle |
| DELETE | `/api/circle/{id}` | Delete a circle (admin only) |

When the API runs in development, the interactive docs are at `/scalar`.

## Run locally

### Requirements

- .NET 10 SDK
- Node.js 20+
- PostgreSQL, running locally or on Neon

### 1. Backend

Keep secrets out of `appsettings` files. Store them with .NET user secrets:

```bash
cd backend/HabitCircle.Api
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=habit_circle;Username=postgres;Password=<your-password>"
dotnet user-secrets set "JwtSettings:Secret" "<a long random string, 32+ characters>"
dotnet user-secrets set "GoogleAuth:ClientId" "<your Google OAuth client id>"
dotnet run
```

Migrations run automatically on startup. The API listens on `http://localhost:5212`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs on `http://localhost:5173` and calls the API at `http://localhost:5212/api` by default. To change that, create `frontend/.env`:

```bash
VITE_API_URL=http://localhost:5212/api
```

### Environment variables for deployment

| Variable | Purpose |
|---|---|
| `ConnectionStrings__DefaultConnection` | PostgreSQL connection string |
| `JwtSettings__Secret` | Key used to sign JWTs |
| `GoogleAuth__ClientId` | Google OAuth client id |
| `CORS_ORIGINS` | Comma-separated list of allowed frontend URLs |

A `Dockerfile` for the API is in `backend/HabitCircle.Api`.

## Project structure

```
backend/HabitCircle.Api/
  Controllers/   Auth, Circle and Habit endpoints
  Services/      Business rules and permission checks
  DTOs/          Request and response shapes
  Models/        EF Core entities
  Data/          AppDbContext
  Helpers/       Streak calculation and mapping helpers
  Migrations/    EF Core migrations
frontend/src/
  pages/         Dashboard, Circle page, Login, Register, Settings
  components/    Dashboard panels, modals, route guards, UI states
  context/       Auth and theme providers
  hooks/         useAuth, useCircles, useHabits, useTheme
  api/           Axios instance that adds the JWT to each request
```

## What I'd add next

- Settings: update profile and change password
- Circle management: promote admins, remove members, leave a circle
- Rate limiting on the auth endpoints
- Tests for the services
