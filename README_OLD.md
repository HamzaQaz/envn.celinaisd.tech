# envn.celinaisd.tech

[![Repo language](https://img.shields.io/github/languages/top/HamzaQaz/envn.celinaisd.tech?style=flat-square)](https://github.com/HamzaQaz/envn.celinaisd.tech)
[![Stars](https://img.shields.io/github/stars/HamzaQaz/envn.celinaisd.tech?style=flat-square)](https://github.com/HamzaQaz/envn.celinaisd.tech/stargazers)
[![Forks](https://img.shields.io/github/forks/HamzaQaz/envn.celinaisd.tech?style=flat-square)](https://github.com/HamzaQaz/envn.celinaisd.tech/network/members)
[![Open Issues](https://img.shields.io/github/issues/HamzaQaz/envn.celinaisd.tech?style=flat-square)](https://github.com/HamzaQaz/envn.celinaisd.tech/issues)
[![Code Review](https://img.shields.io/badge/Code%20Review-draft-yellow?style=flat-square)](https://github.com/HamzaQaz/envn.celinaisd.tech/pulls)
[![License](https://img.shields.io/github/license/HamzaQaz/envn.celinaisd.tech?style=flat-square)](https://github.com/HamzaQaz/envn.celinaisd.tech/blob/main/LICENSE)
[![Last commit](https://img.shields.io/github/last-commit/HamzaQaz/envn.celinaisd.tech/main?style=flat-square)](https://github.com/HamzaQaz/envn.celinaisd.tech/commits/main)

A small project currently "Getting Reworked in React + Typescript".

---

## Current status (issue tracking)
This repository is being migrated from an Express + EJS frontend to a modern React + TypeScript stack. See the active planning issue for the full migration scope:

- Issue: Revise entire project to React app (React + TS + Vite + Next.js + Redux + Tailwind + shadcn ui)  
  https://github.com/HamzaQaz/envn.celinaisd.tech/issues/10

That issue tracks the full rewrite of the frontend and the backend refactor to serve the new React app.

---

## What this project is
envn.celinaisd.tech is a web project that (historically) used server-rendered EJS templates served by Express. The project is being reworked into a modern React application with a dedicated API backend. The migration aims to improve developer experience, enable component-driven UI, and adopt modern tooling and design systems.

Planned front-end stack:
- React (function components + hooks)
- TypeScript
- Vite (dev tooling, bundling)
- Next.js (for routing and SSR/SSG options; can be combined with Vite tooling patterns during planning)
- Redux for global state management
- Tailwind CSS for styling
- shadcn/ui for composable UI components

Planned backend changes:
- Refactor existing Express routes into API endpoints (REST or GraphQL as decided)
- Socket logic (if used) migrated to work with the new frontend
- Authentication/session flows reworked to suit client-side app (JWT/session cookies, whichever fits)

---

## What will happen (high-level migration plan)
1. Inventory
   - Audit existing EJS views, routes, client JS, and sockets (files listed in the migration issue).
2. Scaffolding
   - Create a new React + TypeScript app (Vite or Next.js starter depending on final SSR choice).
   - Integrate Tailwind and shadcn/ui.
   - Configure Redux and high-level folder structure.
3. Componentization
   - Convert EJS templates to React pages/components one-by-one.
   - Port client-side JS behaviors (e.g., sockets) into React hooks/services.
4. API Layer
   - Refactor server code into a clear API (routes/api.js → REST endpoints).
   - Ensure session/auth compatibility with the front-end.
5. QA & Testing
   - Add unit/integration tests for critical flows.
   - Manual QA of migrated pages.
6. Deployment
   - Decide deployment strategy (single repo with api & frontend, or split).
   - Rollout: feature branches, canary, or full swap depending on risk.

Acceptance criteria (from the issue):
- All features/pages available in the React app
- Backend APIs connected and functional
- No EJS usage remains
- Styling/UI migrated to Tailwind + shadcn/ui
- Codebase migrated and documented

---

## Quick start (current repository state)
Note: this is a general guide. Adjust paths/commands to the repo specifics.

1. Install
```bash
npm install
```

2. Run (development)
- If the repo is currently an Express app:
```bash
npm start
```
- After migration, run the frontend and backend per each project's README (will be added during migration).

---

## Contributing & Code Review
- Work happens via branches and pull requests.
- Please open small, focused PRs for each page/component migration.
- Use the Code Review badge above to see open PRs; label PRs with the target area (e.g., "frontend/migration", "backend/api").
- Add screenshots and migration notes to PR descriptions for visual changes.

Suggested PR checklist:
- [ ] TypeScript types added where applicable
- [ ] Tailwind classes used for styling
- [ ] State interactions use Redux or defined hooks
- [ ] Socket/real-time code moved to a service/hook
- [ ] Tests added or updated for migrated logic
- [ ] Documentation (README / CHANGELOG) updated

---

## Files to look at first (migration candidates)
- views/*.ejs (all current EJS templates)
- views/partials/*.ejs
- server.js
- routes/index.js
- routes/api.js
- public/js/socket-client.js

These are already referenced in the migration issue and will be the first candidates to port to React components and API endpoints.
