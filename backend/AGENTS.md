# Repository Guidelines

## Project Structure & Module Organization
- `main.py` is the FastAPI entrypoint and wires route modules.
- `routes/` defines API routers (e.g., `routes/auth.py`).
- `controllers/` holds request handlers and orchestration logic.
- `models/` contains Pydantic models and data shapes.
- `lib/` is shared helpers (e.g., Supabase client setup).
- `middleware/` is reserved for FastAPI middleware (currently minimal).
- `test/` contains standalone smoke scripts (e.g., `test/auth_smoke.py`).
- `.env.example` documents required environment variables.
- The backend is Supabase (project: Bafain always fetch supabase MCP when dealing with database).

## Build, Test, and Development Commands
- `python -m pip install -e .` installs dependencies from `pyproject.toml`.
- `python main.py` runs the API with auto-reload via Uvicorn.
- `uvicorn main:app --reload` starts the server directly (useful for tooling).
- `python test/auth_smoke.py` runs the auth smoke script against the running API.

## Coding Style & Naming Conventions
- Python 3.12+ with type hints (`str | None`, `dict[str, Any]`).
- Indentation is **2 spaces** to match existing files.
- Modules and functions use `snake_case`; classes use `PascalCase`.
- Keep route wiring in `main.py`; business logic lives in `controllers/`.

## Testing Guidelines
- No test framework is configured; tests are ad-hoc scripts in `test/`.
- The auth smoke script reads env vars like `API_BASE_URL`,
  `BASE_EMAIL`/`TEST_EMAIL_DOMAIN`, and optional `REGISTER_EMAIL`,
  `LOGIN_EMAIL`, `RUN_FORGOT_PASSWORD`.
- If you add a test runner, also add a `test` script and update this file.

## Commit & Pull Request Guidelines
- Git history is mixed (plain subjects and `feat:`/`chore:` prefixes).
  Prefer short, imperative, sentence-case subjects; use Conventional Commits
  if you want consistency.
- PRs should include: a concise summary, rationale, and screenshots for API
  changes that affect responses or behavior.

## Security & Configuration Tips
- Never commit real secrets; copy `.env.example` to `.env` locally.
- Supabase credentials are read from `SUPABASE_URL` and `SUPABASE_ANON_KEY`
  (or `NEXT_PUBLIC_*` equivalents). Avoid service-role keys in local envs.
- Redis is configured via `REDIS_URL` (defaults to `redis://localhost:6379/0`).
