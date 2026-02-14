import logging
import os
import threading
import time
from collections import defaultdict, deque
from typing import Any

import redis
from fastapi import HTTPException, Request, status

logger = logging.getLogger("bafain.auth_rate_limit")

DEFAULT_WINDOW_SECONDS = 60
DEFAULT_MAX_ATTEMPTS = 10
DEFAULT_BLOCK_SECONDS = 300
DEFAULT_PREFIX = "bafain:auth:rate_limit"


class _InMemoryRateLimiter:
  def __init__(self) -> None:
    self._attempts: dict[str, deque[float]] = defaultdict(deque)
    self._blocked_until: dict[str, float] = {}
    self._lock = threading.Lock()

  def consume(
    self,
    key: str,
    window_seconds: int,
    max_attempts: int,
    block_seconds: int,
  ) -> tuple[bool, int | None]:
    now = time.time()
    with self._lock:
      blocked_until = self._blocked_until.get(key)
      if blocked_until and blocked_until > now:
        return False, int(blocked_until - now)

      history = self._attempts[key]
      cutoff = now - window_seconds
      while history and history[0] < cutoff:
        history.popleft()

      history.append(now)
      if len(history) > max_attempts:
        until = now + block_seconds
        self._blocked_until[key] = until
        history.clear()
        return False, block_seconds

      return True, None


_in_memory_rate_limiter = _InMemoryRateLimiter()
_redis_client: redis.Redis | None = None
_redis_connect_failed = False
_warned_in_memory_fallback = False
_redis_lock = threading.Lock()


def _is_production() -> bool:
  app_env = (os.getenv("APP_ENV") or "").strip().lower()
  return app_env in {"prod", "production"}


def _env_int(name: str, default: int, minimum: int = 1) -> int:
  raw = os.getenv(name)
  if not raw:
    return default
  try:
    parsed = int(raw)
  except ValueError:
    logger.warning("Invalid integer for %s: %s. Using default %s", name, raw, default)
    return default
  return parsed if parsed >= minimum else default


def _client_ip(request: Request) -> str:
  forwarded_for = request.headers.get("x-forwarded-for", "")
  if forwarded_for.strip():
    return forwarded_for.split(",")[0].strip().lower()
  if request.client and request.client.host:
    return request.client.host.strip().lower()
  return "unknown"


async def _request_json(request: Request) -> dict[str, Any]:
  try:
    payload = await request.json()
  except Exception:
    return {}
  return payload if isinstance(payload, dict) else {}


def _identifier_from_payload(payload: dict[str, Any]) -> str | None:
  value = payload.get("email")
  if isinstance(value, str):
    normalized = value.strip().lower()
    if normalized:
      return normalized
  return None


def _build_rate_limit_key(request: Request, payload: dict[str, Any], prefix: str) -> str:
  route_key = request.url.path.strip("/").replace("/", ":").lower()
  identifier = _identifier_from_payload(payload) or _client_ip(request)
  return f"{prefix}:{route_key}:{identifier}"


def _get_redis_client() -> redis.Redis | None:
  global _redis_client, _redis_connect_failed
  with _redis_lock:
    if _redis_client is not None:
      return _redis_client
    if _redis_connect_failed:
      return None

    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    try:
      client = redis.from_url(redis_url, decode_responses=True)
      client.ping()
      _redis_client = client
      return _redis_client
    except Exception as exc:
      _redis_connect_failed = True
      logger.warning("Redis unavailable for auth rate limit: %s", str(exc))
      return None


def _consume_redis(
  client: redis.Redis,
  key: str,
  window_seconds: int,
  max_attempts: int,
  block_seconds: int,
) -> tuple[bool, int | None]:
  blocked_key = f"{key}:blocked"
  attempts_key = f"{key}:attempts"
  try:
    blocked_ttl = client.ttl(blocked_key)
    if blocked_ttl and blocked_ttl > 0:
      return False, blocked_ttl

    attempt_count = int(client.incr(attempts_key))
    if attempt_count == 1:
      client.expire(attempts_key, window_seconds)

    if attempt_count > max_attempts:
      client.set(blocked_key, "1", ex=block_seconds)
      client.delete(attempts_key)
      return False, block_seconds

    return True, None
  except redis.RedisError as exc:
    raise RuntimeError("Redis rate limit operation failed") from exc


def _too_many_attempts_error(retry_after: int | None = None) -> HTTPException:
  headers = {}
  if retry_after and retry_after > 0:
    headers["Retry-After"] = str(retry_after)
  return HTTPException(
    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
    detail="Too many attempts. Try again later.",
    headers=headers,
  )


async def enforce_auth_rate_limit(request: Request) -> None:
  global _warned_in_memory_fallback

  payload = await _request_json(request)
  window_seconds = _env_int(
    "AUTH_RATE_LIMIT_WINDOW_SECONDS",
    DEFAULT_WINDOW_SECONDS,
  )
  max_attempts = _env_int(
    "AUTH_RATE_LIMIT_MAX_ATTEMPTS",
    DEFAULT_MAX_ATTEMPTS,
  )
  block_seconds = _env_int(
    "AUTH_RATE_LIMIT_BLOCK_SECONDS",
    DEFAULT_BLOCK_SECONDS,
  )
  prefix = (os.getenv("AUTH_RATE_LIMIT_REDIS_PREFIX") or DEFAULT_PREFIX).strip()

  key = _build_rate_limit_key(request, payload, prefix)

  client = _get_redis_client()
  if client is not None:
    try:
      allowed, retry_after = _consume_redis(
        client,
        key,
        window_seconds,
        max_attempts,
        block_seconds,
      )
      if not allowed:
        raise _too_many_attempts_error(retry_after)
      return
    except RuntimeError as exc:
      if _is_production():
        logger.error("Auth rate limiter unavailable in production: %s", str(exc))
        raise HTTPException(
          status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
          detail="Rate limiter unavailable",
        ) from exc
      logger.warning("Falling back to in-memory auth limiter: %s", str(exc))

  if _is_production():
    raise HTTPException(
      status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
      detail="Rate limiter unavailable",
    )

  if not _warned_in_memory_fallback:
    logger.warning("Using in-memory auth rate limiter (non-production only).")
    _warned_in_memory_fallback = True

  allowed, retry_after = _in_memory_rate_limiter.consume(
    key,
    window_seconds,
    max_attempts,
    block_seconds,
  )
  if not allowed:
    raise _too_many_attempts_error(retry_after)
