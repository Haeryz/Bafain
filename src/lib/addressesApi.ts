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

async function request<T>(
  path: string,
  options?: { method?: string; payload?: Record<string, unknown>; retried?: boolean }
) {
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

export type AddressPayload = {
  id?: string
  label?: string | null
  recipient_name?: string | null
  email?: string | null
  phone?: string | null
  address_line1?: string | null
  address_line2?: string | null
  city?: string | null
  province?: string | null
  postal_code?: string | null
  country?: string | null
  notes?: string | null
  latitude?: number | null
  longitude?: number | null
  is_default?: boolean | null
  metadata?: Record<string, unknown> | null
}

export type AddressListResponse = {
  addresses: AddressPayload[]
}

export type AddressResponse = {
  address: AddressPayload
}

export type AddressDeleteResponse = {
  message: string
  address_id: string
  deleted: boolean
}

export type AddressDefaultResponse = {
  address: AddressPayload
  message: string
}

export function listAddresses() {
  return request<AddressListResponse>("/api/v1/me/addresses")
}

export function createAddress(payload: AddressPayload) {
  return request<AddressResponse>("/api/v1/me/addresses", {
    method: "POST",
    payload,
  })
}

export function updateAddress(addressId: string, payload: AddressPayload) {
  return request<AddressResponse>(`/api/v1/me/addresses/${addressId}`, {
    method: "PATCH",
    payload,
  })
}

export function deleteAddress(addressId: string) {
  return request<AddressDeleteResponse>(`/api/v1/me/addresses/${addressId}`, {
    method: "DELETE",
  })
}

export function setDefaultAddress(addressId: string) {
  return request<AddressDefaultResponse>(
    `/api/v1/me/addresses/${addressId}/set-default`,
    { method: "POST" }
  )
}
