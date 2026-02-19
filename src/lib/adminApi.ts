import { refreshSession } from "@/lib/authApi"
import type { Product } from "@/lib/productsApi"
import {
  getAccessToken,
  getRefreshToken,
} from "@/stores/auth/authStorage"
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
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  payload?: Record<string, unknown>
  params?: Record<string, string | number | undefined>
  retried?: boolean
}

async function request<T>(path: string, options?: RequestOptions) {
  const token = getAccessToken()
  const refreshToken = getRefreshToken()

  let url = `${API_BASE_URL}${path}`
  if (options?.params) {
    const searchParams = new URLSearchParams()
    for (const [key, value] of Object.entries(options.params)) {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value))
      }
    }
    const qs = searchParams.toString()
    if (qs) {
      url += `?${qs}`
    }
  }

  const response = await fetch(url, {
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

export type AdminIdentity = {
  uid: string
  role: "viewer" | "operator" | "admin" | "super_admin"
  email: string
  display_name: string
}

export type AdminSessionResponse = {
  admin: AdminIdentity
}

export type AdminDashboardSummary = {
  total_orders: number
  paid_orders: number
  pending_orders: number
  products_count: number
  total_revenue: number
}

export type AdminStatusCount = {
  status: string
  count: number
}

export type AdminRecentOrder = {
  id: string
  status?: string | null
  payment_status?: string | null
  total?: number | null
  user_id?: string | null
  customer_note?: string | null
  created_at?: string | null
}

export type AdminDashboardResponse = {
  summary: AdminDashboardSummary
  orders_by_status: AdminStatusCount[]
  recent_orders: AdminRecentOrder[]
}

export type AdminOrder = {
  id: string
  status?: string | null
  payment_status?: string | null
  total?: number | null
  customer_note?: string | null
  user_id?: string | null
  created_at?: string | null
  shipment?: {
    carrier?: string | null
    nomor_resi?: string | null
    eta?: string | null
  } | null
}

export type AdminOrderListResponse = {
  orders: AdminOrder[]
  page: number
  limit: number
  total: number
}

export type AdminOrderUpdateResponse = {
  order_id: string
  status: string
  message: string
}

export type AdminShipmentUpdateResponse = {
  order_id: string
  shipment: {
    carrier: string
    nomor_resi: string
    eta?: string | null
  }
  message: string
}

export type ProductImageInput = {
  image_url: string
  sort_order: number
}

export type ProductFeatureInput = {
  feature: string
  sort_order: number
}

export type ProductSpecInput = {
  spec_key: string
  spec_value?: string | null
  spec_qty?: number | null
  spec_unit?: string | null
  sort_order: number
}

export type ProductBenefitInput = {
  title: string
  description?: string | null
  sort_order: number
}

export type ProductGalleryInput = {
  title: string
  description?: string | null
  image_url: string
  sort_order: number
}

export type AdminProductCreatePayload = {
  title: string
  price_idr: number
  price_unit?: string | null
  description?: string | null
  image_url?: string | null
  images?: ProductImageInput[]
  features?: ProductFeatureInput[]
  specs?: ProductSpecInput[]
  benefits?: ProductBenefitInput[]
  gallery?: ProductGalleryInput[]
}

export type AdminProductUpdatePayload = {
  title?: string
  price_idr?: number
  price_unit?: string | null
  description?: string | null
  image_url?: string | null
  images?: ProductImageInput[]
  features?: ProductFeatureInput[]
  specs?: ProductSpecInput[]
  benefits?: ProductBenefitInput[]
  gallery?: ProductGalleryInput[]
}

export function getAdminSession() {
  return request<AdminSessionResponse>("/api/v1/admin/session")
}

export function getAdminDashboard() {
  return request<AdminDashboardResponse>("/api/v1/admin/dashboard")
}

export function listAdminOrders(params?: {
  status?: string
  q?: string
  page?: number
  limit?: number
}) {
  return request<AdminOrderListResponse>("/api/v1/admin/orders", {
    params,
  })
}

export function updateAdminOrder(
  orderId: string,
  payload: { status?: string; notes?: string }
) {
  return request<AdminOrderUpdateResponse>(`/api/v1/admin/orders/${orderId}`, {
    method: "PATCH",
    payload,
  })
}

export function updateAdminShipment(
  orderId: string,
  payload: { carrier: string; nomor_resi: string; eta?: string }
) {
  return request<AdminShipmentUpdateResponse>(
    `/api/v1/admin/orders/${orderId}/shipment`,
    {
      method: "PATCH",
      payload,
    }
  )
}

export function listAdminProducts(params?: {
  limit?: number
  offset?: number
  q?: string
  min_price?: number
  max_price?: number
  feature?: string
  spec_key?: string
  spec_value?: string
}) {
  return request<Product[]>("/api/v1/admin/products", {
    params,
  })
}

export function createAdminProduct(payload: AdminProductCreatePayload) {
  return request<Product>("/api/v1/admin/products", {
    method: "POST",
    payload: payload as Record<string, unknown>,
  })
}

export function updateAdminProduct(
  productId: string,
  payload: AdminProductUpdatePayload
) {
  return request<Product>(`/api/v1/admin/products/${productId}`, {
    method: "PUT",
    payload: payload as Record<string, unknown>,
  })
}

export function deleteAdminProduct(productId: string) {
  return request<{ message: string }>(`/api/v1/admin/products/${productId}`, {
    method: "DELETE",
  })
}
