# Bafain Backend API (Mobile Integration)

## Base URL
- Local dev default: `http://localhost:8000`
- Replace with your deployed host (for example, `https://api.yourdomain.com`).
- All requests and responses are JSON.

## Auth & Headers
- Protected endpoints require `Authorization: Bearer <access_token>`.
- `access_token` is the Firebase ID token returned in `session.access_token` from `/auth/login` or `/auth/register`.
- `refresh_token` is returned as `session.refresh_token` and used with `/auth/refresh`.
- Content type: `Content-Type: application/json`.

## Error Shape
- Errors use FastAPI default shape:

```json
{ "detail": "Message" }
```

Common auth errors:
- `401` Missing/invalid token
- `401` Invalid or expired token
- `429` Rate limit exceeded (auth)

## Health
### GET `/health`
Response:
```json
{ "status": "ok" }
```

## Auth
### POST `/auth/register`
Request:
```json
{ "email": "user@example.com", "password": "strongpassword", "name": "Full Name", "phone": "+628123456789" }
```
Response:
```json
{ "message": "Registration successful.", "user": { "id": "uid", "email": "user@example.com" }, "session": { "access_token": "...", "refresh_token": "...", "expires_in": "3600", "token_type": "bearer" } }
```

### POST `/auth/login`
Request:
```json
{ "email": "user@example.com", "password": "strongpassword" }
```
Response:
```json
{ "user": { "id": "uid", "email": "user@example.com" }, "session": { "access_token": "...", "refresh_token": "...", "expires_in": "3600", "token_type": "bearer" } }
```

### POST `/auth/refresh`
Request:
```json
{ "refresh_token": "..." }
```
Response: same shape as `/auth/login`.

### POST `/auth/forgot-password`
Request:
```json
{ "email": "user@example.com" }
```
Response:
```json
{ "message": "If the email exists, a reset link has been sent." }
```

### POST `/auth/reset-password`
Request:
```json
{ "access_token": "<idToken or oobCode>", "refresh_token": "<refreshToken>", "new_password": "newstrongpassword" }
```
Notes:
- `access_token` can be a Firebase ID token (JWT) or a password reset OOB code from Firebase email.
- If the ID token is expired, the server attempts to refresh using `refresh_token`.

Response:
```json
{ "message": "Password updated successfully" }
```

## Profile
### GET `/api/v1/me`
Auth: Required.
Response:
```json
{ "user": { "id": "uid", "email": "user@example.com", "display_name": "Name" }, "profile": { "full_name": "Name", "email": "user@example.com", "phone": "+628...", "company": null, "address": null, "joined_date": "2026-02-01", "avatar_url": "..." } }
```

### PATCH `/api/v1/me`
Auth: Required.
Request:
```json
{ "full_name": "New Name", "email": "new@example.com", "phone": "+628...", "company": "Company", "address": "Address", "joined_date": "2026-02-01", "avatar_url": "https://...", "metadata": { "key": "value" } }
```
Response: same as GET `/api/v1/me`.

### POST `/api/v1/me/avatar`
Auth: Required.
Request:
```json
{ "avatar_url": "https://..." }
```
Response: same as GET `/api/v1/me`.

### GET `/api/v1/me/order-stats`
Auth: Required.
Response:
```json
{ "counts": { "in-queue": 0, "aktif": 0, "selesai": 0 } }
```

### GET `/api/v1/me/orders/recent?limit=5`
Auth: Required.
Response:
```json
{ "orders": [ { "id": "orderId", "status": "in-queue", "created_at": "2026-02-03T10:00:00Z" } ] }
```

## Addresses
Base path: `/api/v1/me/addresses`
Auth: Required.

### GET `/api/v1/me/addresses`
Response:
```json
{ "addresses": [ { "id": "addrId", "label": "Home", "is_default": true } ] }
```

### POST `/api/v1/me/addresses`
Request:
```json
{ "label": "Home", "recipient_name": "Name", "email": "user@example.com", "phone": "+628...", "address_line1": "Street", "address_line2": "", "city": "Jakarta", "province": "DKI", "postal_code": "12345", "country": "ID", "notes": "", "latitude": -6.2, "longitude": 106.8, "is_default": true, "metadata": { "key": "value" } }
```
Response:
```json
{ "address": { "id": "addrId", "label": "Home", "is_default": true } }
```

### PATCH `/api/v1/me/addresses/{address_id}`
Request: same fields as create (all optional).
Response:
```json
{ "address": { "id": "addrId", "label": "Home", "is_default": true } }
```

### DELETE `/api/v1/me/addresses/{address_id}`
Response:
```json
{ "message": "Address deleted", "address_id": "addrId", "deleted": true }
```

### POST `/api/v1/me/addresses/{address_id}/set-default`
Response:
```json
{ "address": { "id": "addrId", "is_default": true }, "message": "Default address updated" }
```

## Products
Base path: `/products`
Auth: Not required.

### GET `/products`
Query params:
- `limit` default 50, max 200
- `offset` default 0
- `q` search title/description
- `min_price`, `max_price`
- `feature` filter in product_features
- `spec_key`, `spec_value` filter in product_specs

Response: array of products.

### GET `/products/{product_id}`
Response: product object with subcollections.

### POST `/products`
Request:
```json
{ "title": "Product", "price_idr": 150000, "price_unit": "unit", "description": "Desc", "image_url": "https://...", "images": [ { "image_url": "https://...", "sort_order": 0 } ], "features": [ { "feature": "Feature", "sort_order": 0 } ], "specs": [ { "spec_key": "Size", "spec_value": "M", "spec_qty": 1, "spec_unit": "pcs", "sort_order": 0 } ], "benefits": [ { "title": "Benefit", "description": "...", "sort_order": 0 } ], "gallery": [ { "title": "Gallery", "description": "...", "image_url": "https://...", "sort_order": 0 } ] }
```
Response: full product with subcollections.

### PUT `/products/{product_id}`
Request: same shape as create, all fields optional. Setting `images/features/specs/benefits/gallery` replaces subcollections.

### DELETE `/products/{product_id}`
Response:
```json
{ "message": "Product deleted" }
```

## Cart
Base path: `/cart`
Auth: Required.

### GET `/cart`
Response:
```json
{ "items": [ { "id": "itemId", "product_id": "prodId", "qty": 2 } ], "subtotal": 0, "currency": "IDR" }
```

### POST `/cart/items`
Request:
```json
{ "product_id": "prodId", "qty": 2 }
```
Response:
```json
{ "item": { "id": "itemId", "product_id": "prodId", "qty": 2 } }
```

### PATCH `/cart/items/{item_id}`
Request:
```json
{ "qty": 3 }
```
Response:
```json
{ "item": { "id": "itemId", "product_id": "prodId", "qty": 3 } }
```

### DELETE `/cart/items/{item_id}`
Response:
```json
{ "message": "Cart item deleted", "item_id": "itemId", "deleted": true }
```

## Checkout
Base path: `/checkout`
Auth: Required.

### POST `/checkout/summary`
Request:
```json
{ "address": { }, "shipping_option": { "id": "standar", "price": 50000 }, "subtotal": 250000 }
```
Response:
```json
{ "subtotal": 250000, "shipping_fee": 50000, "total": 300000, "currency": "IDR" }
```
Notes:
- `shipping_option` can include `price`, `price_value`, or `shipping_fee` to compute `shipping_fee`.

### POST `/checkout/select-shipping`
Request:
```json
{ "option_id": "standar" }
```
Response:
```json
{ "selected_option": { "id": "standar", "name": "Pengiriman Standar", "price": 50000, "eta_text": "3 - 5 hari kerja" }, "message": "Shipping selected" }
```

## Shipping
Base path: `/shipping`
Auth: Required.

### GET `/shipping/options`
Response:
```json
{ "options": [ { "id": "standar", "name": "Pengiriman Standar", "price": 50000, "eta_text": "3 - 5 hari kerja" } ], "currency": "IDR" }
```

### POST `/shipping/quote`
Request:
```json
{ "address": { }, "items": [ { "product_id": "prodId", "qty": 2 } ] }
```
Response: same as `/shipping/options`.

## CS Chat
Base path: `/cs`
Auth: Required.

### POST `/cs/chat`
Request:
```json
{
  "messages": [
    { "role": "user", "content": "Halo, status pesanan saya bagaimana?" }
  ]
}
```
Response:
```json
{
  "message": "Halo, mohon kirim nomor pesanan Anda agar bisa saya bantu cek.",
  "model": "moonshotai/kimi-k2-instruct",
  "usage": {
    "prompt_tokens": 120,
    "completion_tokens": 32,
    "total_tokens": 152
  }
}
```
Notes:
- Backend locks model to `moonshotai/kimi-k2-instruct`.
- API key must be configured in env var `GROQ`.
- Backend applies message-length limits and per-user rate limiting.

## Orders
Base path: `/orders`
Auth: Required.

### POST `/orders`
Request:
```json
{ "address": { }, "shipping_option": { }, "customer_note": "...", "items": [ { "product_id": "prodId", "qty": 2 } ], "subtotal": 250000, "shipping_fee": 50000, "total": 300000, "payment_method": { "id": "transfer" } }
```
Response:
```json
{ "order": { "id": "orderId", "status": "awaiting-payment", "payment_status": "pending", "subtotal": 250000, "shipping_fee": 50000, "total": 300000, "currency": "IDR" } }
```

### GET `/orders?page=1&limit=10&status=...&q=...`
Response:
```json
{ "orders": [ { "id": "orderId", "status": "in-queue" } ], "page": 1, "limit": 10, "total": 1 }
```

### GET `/orders/{order_id}`
Response:
```json
{ "order": { "id": "orderId", "status": "in-queue" } }
```

### POST `/orders/{order_id}/cancel`
Response:
```json
{ "order_id": "orderId", "status": "cancelled", "message": "Order cancelled" }
```

### POST `/orders/{order_id}/confirm-received`
Response:
```json
{ "order_id": "orderId", "status": "selesai", "message": "Order marked as received" }
```

### POST `/orders/{order_id}/check-payment`
Response:
```json
{ "order_id": "orderId", "status": "in-queue", "message": "Payment verified" }
```

### POST `/orders/{order_id}/notes`
Request:
```json
{ "note": "Customer note" }
```
Response:
```json
{ "order_id": "orderId", "notes": [ { "id": "noteId", "note": "Customer note", "created_at": "2026-02-03T10:00:00" } ] }
```

### GET `/orders/{order_id}/notes`
Response: same as POST notes.

## Invoice
### GET `/orders/{order_id}/invoice`
Auth: Required.
Response:
```json
{ "order_id": "orderId", "download_url": "https://example.com/invoices/orderId.pdf?token=...", "expires_in": 3600 }
```
Note:
- This currently returns a placeholder URL.

## Shipment & Tracking
Base path: `/api/v1`

### GET `/api/v1/orders/{order_id}/shipment`
Auth: Required.
Response:
```json
{ "shipment": { "order_id": "orderId", "carrier": "JNE", "tracking_number": "RESI123456789", "nomor_resi": "RESI123456789", "shipped_at": "2026-02-03T10:00:00Z", "eta": "2-3 hari" } }
```

### GET `/api/v1/orders/{order_id}/tracking-events`
Auth: Required.
Response:
```json
{ "order_id": "orderId", "events": [ { "order_id": "orderId", "status": "Order dibuat", "description": "Pesanan diterima", "timestamp": "2026-02-03T10:00:00Z" } ] }
```

### GET `/api/v1/track?orderNumber=...&emailOrPhone=...`
Auth: Not required.
Response:
```json
{ "order_number": "ORD-123", "shipment": { "order_id": "ORD-123", "carrier": "JNE", "tracking_number": "RESI123456789", "nomor_resi": "RESI123456789", "shipped_at": "2026-02-03T10:00:00Z", "eta": "2-3 hari" }, "events": [ { "order_id": "ORD-123", "status": "Order dibuat", "description": "Pesanan diterima", "timestamp": "2026-02-03T10:00:00Z" } ] }
```

## Uploads
Base path: `/uploads`
Auth: Not required.

### POST `/uploads/sign`
Request:
```json
{ "filename": "photo.jpg", "folder": "products", "product_id": "prodId", "upsert": false }
```
Response:
```json
{ "bucket": "bucket-name", "path": "products/prodId/uuid_photo.jpg", "signed_url": "https://...", "token": null, "public_url": "https://..." }
```
Notes:
- Use `signed_url` to `PUT` the file bytes directly to storage.
- If `upsert` is false and the file exists, API returns `409`.

## Admin Orders
Base path: `/api/v1/admin/orders`
Auth: Required (token validation only, no role enforcement yet).

### GET `/api/v1/admin/orders?page=1&limit=10&status=...&q=...`
Response:
```json
{ "orders": [ { "id": "orderId", "status": "diproses" } ], "page": 1, "limit": 10, "total": 1 }
```

### PATCH `/api/v1/admin/orders/{order_id}`
Request:
```json
{ "status": "diproses", "notes": "..." }
```
Response:
```json
{ "order_id": "orderId", "status": "diproses", "message": "Order updated" }
```

### PATCH `/api/v1/admin/orders/{order_id}/shipment`
Request:
```json
{ "carrier": "JNE", "nomor_resi": "RESI123", "eta": "2-3 hari" }
```
Response:
```json
{ "order_id": "orderId", "shipment": { "carrier": "JNE", "nomor_resi": "RESI123", "eta": "2-3 hari" }, "message": "Shipment updated" }
```

## Notes and Caveats
- Timestamps are stored as UTC and typically serialized to ISO 8601 strings in responses.
- Some endpoints return placeholder data today (shipping options, shipment tracking, invoice URL). Mobile clients should be tolerant of these defaults.
- Product create/update replaces subcollections when arrays are provided.
- Admin endpoints currently only validate token presence; there is no admin role check.
