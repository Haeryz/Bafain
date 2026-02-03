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
  method?: "GET" | "POST" | "PUT" | "DELETE"
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
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value))
      }
    }
    const qs = searchParams.toString()
    if (qs) url += `?${qs}`
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

export type ProductImage = {
  id: string
  product_id: string
  image_url: string
  sort_order: number
}

export type ProductFeature = {
  id: string
  product_id: string
  feature: string
  sort_order: number
}

export type ProductSpec = {
  id: string
  product_id: string
  spec_key: string
  spec_value?: string | null
  spec_qty?: number | null
  spec_unit?: string | null
  sort_order: number
}

export type ProductBenefit = {
  id: string
  product_id: string
  title: string
  description?: string | null
  sort_order: number
}

export type ProductGallery = {
  id: string
  product_id: string
  title: string
  description?: string | null
  image_url: string
  sort_order: number
}

export type Product = {
  id: string
  title: string
  price_idr: number
  price_unit?: string | null
  description?: string | null
  image_url?: string | null
  created_at?: string | null
  product_images: ProductImage[]
  product_features: ProductFeature[]
  product_specs: ProductSpec[]
  product_benefits: ProductBenefit[]
  product_gallery: ProductGallery[]
}

export type ListProductsParams = {
  limit?: number
  offset?: number
  q?: string
  min_price?: number
  max_price?: number
  feature?: string
  spec_key?: string
  spec_value?: string
}

export function listProducts(params?: ListProductsParams) {
  return request<Product[]>("/products", { params })
}

export function getProduct(productId: string) {
  return request<Product>(`/products/${productId}`)
}
