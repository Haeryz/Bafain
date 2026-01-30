import os

from dotenv import load_dotenv
from fastapi import FastAPI
import redis

from lib.supabase_client import get_supabase_client
from routes.auth import router as auth_router
from routes.products import router as products_router
from routes.uploads import router as uploads_router

load_dotenv()

app = FastAPI(title="Bafain API")


def get_redis_client() -> redis.Redis:
  redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
  return redis.from_url(redis_url, decode_responses=True)


@app.get("/health")
def health():
  return {"status": "ok"}


app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(products_router, prefix="/products", tags=["products"])
app.include_router(uploads_router, prefix="/uploads", tags=["uploads"])


if __name__ == "__main__":
  import uvicorn

  host = os.getenv("HOST", "0.0.0.0")
  port = int(os.getenv("PORT", "8000"))
  uvicorn.run("main:app", host=host, port=port, reload=True)
