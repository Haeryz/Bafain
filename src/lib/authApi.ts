import { getAccessToken } from "@/stores/auth/authStorage"

const DEFAULT_API_BASE_URL = "http://localhost:8000"

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
).replace(/\/+$/, "")

type ApiErrorShape = {
  detail?: string
  message?: string
}

async function request<T>(
  path: string,
  payload?: Record<string, unknown>,
  options?: { auth?: boolean }
) {
  const token = options?.auth === false ? null : getAccessToken()
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: payload ? JSON.stringify(payload) : undefined,
  })

  const text = await response.text()
  let data: ApiErrorShape | T | null = null

  if (text) {
    try {
      data = JSON.parse(text) as ApiErrorShape | T
    } catch {
      data = null
    }
  }

  if (!response.ok) {
    const message =
      (data as ApiErrorShape | null)?.detail ||
      (data as ApiErrorShape | null)?.message ||
      response.statusText ||
      "Request failed"
    throw new Error(message)
  }

  return data as T
}

export type AuthSession = {
  user?: Record<string, unknown> | null
  session?: Record<string, unknown> | null
}

export type AuthRegisterResponse = AuthSession & {
  message: string
}

export type MessageResponse = {
  message: string
}

export function loginUser(payload: { email: string; password: string }) {
  return request<AuthSession>("/auth/login", payload)
}

export type AuthRegisterPayload = {
  email: string
  password: string
  name?: string
  phone?: string
}

export function registerUser(payload: AuthRegisterPayload) {
  return request<AuthRegisterResponse>("/auth/register", payload)
}

export function forgotPassword(payload: { email: string }) {
  return request<MessageResponse>("/auth/forgot-password", payload)
}

export function resetPassword(payload: {
  access_token: string
  refresh_token: string
  new_password: string
}) {
  return request<MessageResponse>("/auth/reset-password", payload, {
    auth: false,
  })
}

export function refreshSession(payload: { refresh_token: string }) {
  return request<AuthSession>("/auth/refresh", payload, { auth: false })
}
