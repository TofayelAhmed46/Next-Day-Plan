# Nextday — Daily Planner & Progress Reports

A responsive React + Vite frontend for planning the next day, checking off tasks, and viewing weekly/monthly progress reports. It is prepared for a future Laravel API backend.

## Current features

- Plan tasks for any date, including tomorrow.
- Add a task title, category, and time.
- Mark tasks complete/incomplete and delete tasks.
- Daily completion percentage and remaining-task count.
- Weekly report: rolling last 7 days.
- Monthly report: current calendar month.
- Responsive layout for desktop, tablet, and mobile.
- Saves data in browser `localStorage` so refreshes do not erase the demo data.

## Requirements

- Node.js 18 or newer (Node 20 LTS recommended)
- npm

## Run locally

1. Extract the ZIP.
2. Open a terminal inside the extracted `nextday-planner` folder.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Start development server:

   ```bash
   npm run dev
   ```

5. Open the URL printed in the terminal, usually `http://localhost:5173`.

## Build for production

```bash
npm run build
npm run preview
```

The production website is generated in the `dist/` folder.

## Deploy live (frontend)

### Vercel
1. Push this folder to a GitHub repository.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Framework preset: **Vite**.
4. Build command: `npm run build`
5. Output directory: `dist`
6. Deploy.

### Netlify
1. Push the project to GitHub and import it into Netlify.
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Deploy.

**Important:** This version uses browser localStorage. Data is stored only in the browser/device where it was entered. It is not yet shared across users/devices and there is no login or cloud backup. Connect the Laravel API before using it as a multi-user production system.

## Laravel backend integration plan

The frontend currently uses a small local persistence layer in `src/App.jsx`. When the Laravel API is ready, replace that layer with API calls and add authentication.

Suggested API contract:

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/login` | Sign in |
| GET | `/api/tasks?date=YYYY-MM-DD` | List tasks for a date |
| POST | `/api/tasks` | Create a task |
| PATCH | `/api/tasks/{id}` | Update title, category, time, or completion |
| DELETE | `/api/tasks/{id}` | Delete a task |
| GET | `/api/reports/weekly?start=YYYY-MM-DD` | Weekly totals and daily breakdown |
| GET | `/api/reports/monthly?month=YYYY-MM` | Monthly totals and daily breakdown |

Suggested task fields:
- `id`
- `title`
- `category` (`Work`, `Personal`, `Learning`, `Health`, `Other`)
- `planned_date` (`YYYY-MM-DD`)
- `planned_time` (`HH:mm`)
- `is_completed` (boolean)
- `completed_at` (nullable timestamp)

Suggested Laravel structure:
- `Task` model and migration
- `TaskController` for CRUD
- `ReportController` for weekly/monthly aggregates
- Laravel Sanctum for authentication
- Validate every request and scope tasks to the authenticated user

For production, configure CORS, HTTPS, authentication, database backups, and authorization before exposing private user plans.

## Project structure

```text
nextday-planner/
├── index.html
├── package.json
├── .env.example
├── README.md
└── src/
    ├── main.jsx
    ├── App.jsx
    └── styles.css
```
