# Course Registration System

Course Registration System is a CMSC 495 Group Delta project for managing users, courses, prerequisites, semesters, sections, and enrollments. The repository contains the backend API, the frontend client, database schema/seed data, and a published OpenAPI contract.

This README is intentionally focused on local setup and environment. API documentation should live on the separate GitHub Pages docs site.

## Repository Layout

- `backend/`: Express backend and session-based authentication
- `frontend/`: Vite/React frontend
- `database/`: schema and seed SQL
- `scripts/`: setup, schema, seed, reset, and test helpers
- `docs/`: static Swagger UI site for GitHub Pages
- `OpenAPI.yaml`: source-of-truth API contract

## Prerequisites

- Node.js 18+
- npm
- MySQL 8+

## Environment

Create a local `.env` file in the repository root.

Required values:

- `MYSQL_HOST`
- `MYSQL_PORT`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `MYSQL_DATABASE`
- `SESSION_SECRET`
- `SESSION_COOKIE_NAME=sid`
- `NODE_ENV=development`

If you need a starting point, copy `.env.example` and update it to match the current session-based setup.

## Install

```bash
npm install
```

## Database Setup

Create the schema and seed the database:

```bash
npm run db:reset
```

This uses:

- [database/schema.sql](/Users/adiavraham/Documents/UMGC/CMSC495/cmsc495registrationsystem/cmsc495registrationsystem/database/schema.sql)
- [database/seeding_data.sql](/Users/adiavraham/Documents/UMGC/CMSC495/cmsc495registrationsystem/cmsc495registrationsystem/database/seeding_data.sql)

You can also run the setup helper:

```bash
npm run setup
```

## Run The Backend

```bash
npm start
```

Default backend URL:

```text
http://127.0.0.1:3000
```

Health check:

```text
GET /api/health
```

## Run The Frontend

Not yet implemented. Check back later!

## Useful Commands

```bash
npm run db:schema
npm run db:seed
npm run db:reset
npm run test
npm run lint
npm run build
```

## API Documentation

Interactive API documentation is not maintained in this README.

Use this instead:

- [API Documentation](https://avraham-adi.github.io/cmsc495registrationsystem/#/) hosted on GitHub Pages.

## Notes

- The backend uses server-side sessions, not JWT bearer auth.
- The [OpenAPI contract](https://avraham-adi.github.io/cmsc495registrationsystem/#/) is the API source of truth.
- The `docs/` folder is intended for static publishing through GitHub Pages.
