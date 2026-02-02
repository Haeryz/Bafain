import {
  getAccessToken,
  getRefreshToken,
} from "@/stores/auth/authStorage"
import { refreshSession } from "@/lib/authApi"
import { useAuthStore } from "@/stores/auth/useAuthStore"

const DEFAULT_API_BASE_URL = "http://localhost:8000"

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
).replace(/\/+$/, "")

type ApiErrorShape = {
  detail?: string
  message?: string
}

type RequestOptions = {
  method?: "GET" | "PATCH"
  payload?: Record<string, unknown>
  retried?: boolean
}

async function request<T>(path: string, options?: RequestOptions) {
  const token = getAccessToken()
  const refreshToken = getRefreshToken()
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options?.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(refreshToken ? { "X-Refresh-Token": refreshToken } : {}),
    },
    body: options?.payload ? JSON.stringify(options.payload) : undefined,
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
    if (!options?.retried && response.status === 401 && refreshToken) {
      try {
        const refreshed = await refreshSession({
          refresh_token: refreshToken,
        })
        const authState = useAuthStore.getState()
        authState.setSession(refreshed.session ?? null)
        if (refreshed.user) {
          authState.setUser(refreshed.user)
        }
        return request<T>(path, { ...options, retried: true })
      } catch {
        // fall through to error
      }
    }
    const message =
      (data as ApiErrorShape | null)?.detail ||
      (data as ApiErrorShape | null)?.message ||
      response.statusText ||
      "Request failed"
    throw new Error(message)
  }

  return data as T
}

export type ProfilePayload = {
  full_name?: string | null
  email?: string | null
  phone?: string | null
  company?: string | null
  address?: string | null
  joined_date?: string | null
  avatar_url?: string | null
}

export type ProfileResponse = {
  user?: Record<string, unknown> | null
  profile?: ProfilePayload | null
}

export function getProfile() {
  return request<ProfileResponse>("/api/v1/me")
}

export function updateProfile(payload: ProfilePayload) {
  return request<ProfileResponse>("/api/v1/me", {
    method: "PATCH",
    payload,
  })
}
