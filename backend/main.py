import os

from fastapi import FastAPI
from supabase import Client, create_client
import redis

app = FastAPI(title="Bafain API")


def get_supabase_client() -> Client:
  url = (
    os.getenv("SUPABASE_URL")
    or os.getenv("VITE_SUPABASE_URL")
    or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
  )
  key = (
    os.getenv("SUPABASE_ANON_KEY")
    or os.getenv("VITE_SUPABASE_ANON_KEY")
    or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    or os.getenv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY")
  )

  if not url or not key:
    raise RuntimeError(
      "Supabase env vars are missing. Set SUPABASE_URL and SUPABASE_ANON_KEY (or VITE_/NEXT_PUBLIC_ equivalents)."
    )

  return create_client(url, key)


def get_redis_client() -> redis.Redis:
  redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
  return redis.from_url(redis_url, decode_responses=True)


@app.get("/health")
def health():
  return {"status": "ok"}


if __name__ == "__main__":
  import uvicorn

  host = os.getenv("HOST", "0.0.0.0")
  port = int(os.getenv("PORT", "8000"))
  uvicorn.run("main:app", host=host, port=port, reload=True)
