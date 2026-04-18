# Frontend (React + Vite)

This is the React frontend for Habit Circle.

## Tech

- React (Vite)
- React Router
- Axios (JWT interceptor)
- Mantine (UI + Notifications)
- Lucide icons
- Light/Dark theme via CSS variables (`src/styles/theme.css`)

## Running locally

From repo root:

```bash
cd frontend
npm install
npm run dev
```

### API URL

Default API base URL is:

- `http://localhost:5212/api`

To override, create `frontend/.env`:

```bash
VITE_API_URL=http://localhost:5212/api
```

## Useful scripts

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run preview` — preview build
- `npm run lint` — run ESLint

## Structure

- `src/pages/` — route pages (Login/Register/Dashboard/Circle/Settings)
- `src/components/`
  - `Navbar.jsx` — profile dropdown (Settings + Sign out)
  - `dashboard/` — dashboard panels + cards
  - `ui/` — small reusable UI components
- `src/context/` — auth + theme providers
- `src/hooks/` — `useAuth`, `useHabits`, `useCircles`, `useTheme`
- `src/api/axios.js` — Axios instance with auth header injection
- `src/utils/toast.js` — centralized toast helpers (loading → update pattern)

## Notes

- Auth session is stored in `localStorage` (`hc_token`, `hc_user`).
- If you see stale styles during dev, restart Vite (`Ctrl+C`, then `npm run dev`).
