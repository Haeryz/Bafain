import os

from dotenv import load_dotenv
from fastapi import FastAPI
import redis

from lib.supabase_client import get_supabase_client
from routes.auth import router as auth_router
from routes.addresses import router as addresses_router
from routes.admin_orders import router as admin_orders_router
from routes.cart import router as cart_router
from routes.checkout import router as checkout_router
from routes.invoice import router as invoice_router
from routes.orders import router as orders_router
from routes.profile import router as profile_router
from routes.products import router as products_router
from routes.shipment import router as shipment_router
from routes.shipping import router as shipping_router
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
app.include_router(addresses_router, tags=["addresses"])
app.include_router(admin_orders_router, tags=["admin"])
app.include_router(cart_router, tags=["cart"])
app.include_router(checkout_router, tags=["checkout"])
app.include_router(invoice_router, tags=["invoice"])
app.include_router(orders_router, tags=["orders"])
app.include_router(profile_router, tags=["profile"])
app.include_router(products_router, prefix="/products", tags=["products"])
app.include_router(shipment_router, tags=["shipment"])
app.include_router(shipping_router, tags=["shipping"])
app.include_router(uploads_router, prefix="/uploads", tags=["uploads"])


if __name__ == "__main__":
  import uvicorn

  host = os.getenv("HOST", "0.0.0.0")
  port = int(os.getenv("PORT", "8000"))
  uvicorn.run("main:app", host=host, port=port, reload=True)
