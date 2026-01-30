# Repository Guidelines

## Project Structure & Module Organization
- `src/` holds all app code.
  - `src/main.tsx` only bootstraps `<App />` (no routing logic here).
  - `src/App.tsx` owns all routing.
  - `src/pages/` contains page modules (one page per file).
  - `src/components/ui/` is for shadcn/ui components added via the CLI.
  - `src/lib/utils.ts` provides the `cn` helper for Tailwind class merging.
  - `src/index.css` contains Tailwind directives (avoid adding custom CSS rules).
- `public/` is for static files served as-is (e.g., icons).
- Config lives at the repo root: `vite.config.ts`, `tsconfig*.json`, `eslint.config.js`, `components.json`.

## Build, Test, and Development Commands
Run these from the repo root:
- `npm install` installs dependencies.
- `npm run dev` starts the Vite dev server.
- `npm run build` runs TypeScript build checks then creates a production build.
- `npm run preview` serves the production build locally.
- `npm run lint` runs ESLint across the codebase.

## Routing & Pages
- Routes are flat and match page names: `/start`, `/beranda`, `/teknologi`, `/produk`.
- The `Start` page contains login, register, and forgot-password UI states.
- Use `react-router-dom` for routing; keep route definitions inside `src/App.tsx`.

## Backend (Supabase)
- The backend is Supabase (project: Bafain). Use the public client only on the frontend.
- Configure env vars: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`.
- Never hardcode keys; do not use service-role keys in the Vite app.
- There is no schema yet; add queries only after tables are defined.

## Coding Style & Naming Conventions
- TypeScript + React (TSX) with ES modules (`"type": "module"`).
- Indentation: 2 spaces; no semicolons (match existing files).
- Tailwind utilities are used in JSX className strings; do not write vanilla CSS.
- Use shadcn/ui components (add via `npx shadcn@latest add <component>`).
- Path aliases: `@/` maps to `src/` (see `tsconfig.json`).
- Keep filenames in `src/` in PascalCase for components, pages in `src/pages/` (e.g., `Start.tsx`).

## Testing Guidelines
- No test framework is configured yet.
- If you add tests, also add a script (e.g., `test`) to `package.json` and document the runner here.

## Commit & Pull Request Guidelines
- Current history uses short, imperative, sentence-case subjects (e.g., "Refactor project structure").
- Keep commit messages concise and focused on one change.
- For PRs: include a short summary, the reason for the change, and screenshots for UI changes. Link related issues if applicable.

## Security & Configuration Tips
- Environment variables (if added) should go in `.env` files and never be committed.
- Keep `node_modules/` out of source control (already in `.gitignore`).
