# Repository Guidelines

## Project Structure & Module Organization
- `main.py` is the FastAPI entrypoint and wires route modules.
- `routes/` defines API routers (e.g., `routes/auth.py`).
- `controllers/` contains request handlers and orchestration logic.
- `models/` contains Pydantic models and data shapes.
- `lib/` holds shared helpers (for example, Firebase admin setup).
- `middleware/` is reserved for FastAPI middleware.
- `test/` contains standalone smoke scripts (e.g., `test/auth_smoke.py`).
- `.env.example` documents required environment variables.

## Build, Test, and Development Commands
- `python -m pip install -e .` installs dependencies from `pyproject.toml`.
- `python main.py` runs the API with Uvicorn auto-reload.
- `uvicorn main:app --reload` starts the server directly for tooling.
- `python test/auth_smoke.py` runs the auth smoke script against a running API.

## Coding Style & Naming Conventions
- Python 3.12+ with type hints (for example, `str | None`).
- Indentation is 2 spaces to match existing files.
- Modules and functions use `snake_case`; classes use `PascalCase`.
- Keep route wiring in `main.py`; business logic lives in `controllers/`.

## Testing Guidelines
- No test framework is configured; tests are ad-hoc scripts in `test/`.
- The auth smoke script reads `API_BASE_URL`, `BASE_EMAIL` or
  `TEST_EMAIL_DOMAIN`, and optional `REGISTER_EMAIL`, `LOGIN_EMAIL`,
  `RUN_FORGOT_PASSWORD`.

## Commit & Pull Request Guidelines
- Git history is mixed (plain subjects and `feat:`/`chore:` prefixes).
  Prefer short, imperative, sentence-case subjects; use Conventional
  Commits if you want consistency.
- PRs should include a concise summary, rationale, and screenshots for
  API changes that affect responses or behavior.

## Security & Configuration Tips
- Never commit real secrets; copy `.env.example` to `.env` locally.
- Firebase admin credentials use `FIREBASE_CREDENTIALS_JSON` or
  `FIREBASE_CREDENTIALS_PATH`. Storage uses `FIREBASE_STORAGE_BUCKET`.
- Redis uses `REDIS_URL` (defaults to `redis://localhost:6379/0`).
