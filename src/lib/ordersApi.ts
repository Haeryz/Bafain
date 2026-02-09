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
  method?: "GET" | "POST"
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

export type OrderPayload = {
  id: string
  status?: string | null
  payment_status?: string | null
  created_at?: string | null
  expires_at?: string | null
  address?: Record<string, unknown> | null
  shipping_option?: Record<string, unknown> | null
  customer_note?: string | null
  items?: Record<string, unknown>[] | null
  subtotal?: number | null
  shipping_fee?: number | null
  tax_amount?: number | null
  total?: number | null
  currency?: string | null
  payment_method?: Record<string, unknown> | null
}

export type OrderResponse = {
  order: OrderPayload
}

export type OrderListResponse = {
  orders: OrderPayload[]
  page: number
  limit: number
  total: number
}

export type OrderActionResponse = {
  order_id: string
  status: string
  message: string
}

export type InvoiceResponse = {
  order_id: string
  download_url: string
  expires_in: number
}

export function createOrder(payload: {
  address: Record<string, unknown>
  shipping_option: Record<string, unknown>
  customer_note?: string | null
  items?: Record<string, unknown>[]
  subtotal?: number
  shipping_fee?: number
  tax_amount?: number
  total?: number
  payment_method?: Record<string, unknown>
}) {
  return request<OrderResponse>("/orders", {
    method: "POST",
    payload,
  })
}

export function getOrder(orderId: string) {
  return request<OrderResponse>(`/orders/${orderId}`)
}

export function listOrders(params?: {
  status?: string
  q?: string
  page?: number
  limit?: number
}) {
  const searchParams = new URLSearchParams()
  if (params?.status) searchParams.set("status", params.status)
  if (params?.q) searchParams.set("q", params.q)
  if (params?.page) searchParams.set("page", String(params.page))
  if (params?.limit) searchParams.set("limit", String(params.limit))
  const qs = searchParams.toString()
  const path = qs ? `/orders?${qs}` : "/orders"
  return request<OrderListResponse>(path)
}

export function checkPayment(orderId: string) {
  return request<OrderActionResponse>(`/orders/${orderId}/check-payment`, {
    method: "POST",
  })
}

export function getInvoice(orderId: string) {
  return request<InvoiceResponse>(`/orders/${orderId}/invoice`)
}
