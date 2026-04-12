# Course Registration System

Course Registration System is a CMSC 495 Group Delta project for managing users, courses, prerequisites, semesters, sections, and enrollments. The repository contains the backend API, the Vite/React frontend client, database schema and seed data, automated API and GUI test runners, and a published OpenAPI contract.

## API Documentation

[API Documentation](https://avraham-adi.github.io/cmsc495registrationsystem/#/) hosted on GitHub Pages.

## Notes

- The backend was updated to use server-side sessions instead of JWT to strengthen security.
- `docs/OpenAPI.yaml` is the canonical API contract and the file used by the GitHub Pages Swagger UI.

## Repository Layout

- `backend/`: Express backend and session-based authentication
- `frontend/`: Vite/React frontend
- `database/`: schema and seed SQL
- `scripts/`: setup, schema, seed, reset, and test helpers
- `docs/`: static Swagger UI site for GitHub Pages
- `docs/OpenAPI.yaml`: source-of-truth API contract

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

```bash
npm run dev
```

Default frontend URL:

```text
http://127.0.0.1:5173
```

The frontend includes:

- student dashboard, schedule, profile, password-change, and registration workflows
- professor profile, password-change, teaching-section, and access-code management workflows
- routed admin workflows for users, courses, prerequisites, semesters, and sections
- the admin UI mounted under `/console/admin` to avoid collisions with backend `/admin` API routes
- developer-only student transcript/completion controls hidden behind `Ctrl+Shift+D` on the dashboard

Seeded demo logins after `npm run db:reset`:

- Student: `kuros_ichi001@guru.edu` / `Ichigo Kurosakikuros_ichi001@guru.edu`
- Professor: `butch_bill301@guru.edu` / `Billy Butcherbutch_bill301@guru.edu`
- Admin: `horne_chri201@guru.edu` / `Christian Hornerhorne_chri201@guru.edu`

## API Test Suite

This project includes a contract-aligned automated API test suite that exercises the backend end to end against the live HTTP server and supplements that with focused service/domain unit-style checks.

Running `npm test` resets the database, starts the server, executes all suites, and generates a Markdown report at `Test Report.md`.

Suite Coverage:
- session-based authentication, session rotation, logout invalidation, and stale-session rejection
- first-login password-change gating across protected route families
- positive and negative validation for admin, course, prerequisite, semester, section, and enrollment workflows
- role-based authorization and ownership restrictions
- enrollment lifecycle behavior including waitlisting, promotion, drops, deletes, prerequisite enforcement, and access-code handling
- concurrency-sensitive behavior such as simultaneous enrollments, profile updates, role changes, and access-code operations
- regression checks for error response shape, service-layer guards, domain normalization, and transactional role updates

## GUI Test Suite

This project also includes a Vitest + React Testing Library GUI test runner for the frontend.

Running `npm run test:gui` executes component and routed workflow tests and generates a Markdown report at `GUI Test Report.md`.

GUI coverage includes:

- auth and shell rendering behavior
- student login flow handling
- student enrollment, schedule, and catalog helper behavior
- admin navigation and routed administration views
- admin create/update flows for users, courses, semesters, and sections
- professor section and access-code workflows
- failure-state rendering for duplicate, validation, and dependency-blocked backend responses

## Useful Commands

```bash
npm run db:schema
npm run db:seed
npm run db:reset
npm run test
npm run test:api
npm run test:gui
npm run test:all
npm run lint
npm run build
npm run dev
```

## Helper SQL Scripts

The `database/` folder also contains reusable demo and testing helpers such as waitlist-fill and student-history SQL scripts. These are optional utilities for manual validation and demos; they are not required for the main setup flow.

## Final QA Checklist

- Student: first login, password change, schedule view, catalog filtering, register, waitlist, drop
- Professor: first login, profile update, section grouping, access-code generation, access-code revocation
- Admin: first login, routed admin tools, user/course/prerequisite/semester/section CRUD
- Database: `npm run db:reset` completes successfully against a live MySQL instance and recreates the seeded demo users
- Docs: `README.md` and `docs/OpenAPI.yaml` remain aligned before publishing GitHub Pages
