import { create } from "zustand"
import {
  checkoutSummary,
  selectShipping,
  type CheckoutSummaryResponse,
} from "@/lib/checkoutApi"
import { createOrder, getOrder, checkPayment } from "@/lib/ordersApi"
import { getShippingOptions, type ShippingOption } from "@/lib/shippingApi"
import { useCartStore } from "@/stores/cart/useCartStore"
import { getAccessToken } from "@/stores/auth/authStorage"

type CustomerInfo = {
  full_name: string
  phone: string
  email: string
  address: string
  city: string
  postal_code: string
  province: string
}

type PaymentMethod = {
  id: string
  label: string
}

type UiShippingOption = {
  id: string
  title: string
  detail: string
  price_value: number
  price_label: string
}

type CheckoutStoreState = {
  customer: CustomerInfo
  paymentMethod: PaymentMethod
  shippingOptions: UiShippingOption[]
  selectedShippingId: string
  summary: CheckoutSummaryResponse | null
  orderId: string | null
  orderStatus: string | null
  paymentStatus: string | null
  isLoading: boolean
  error: string | null
  updateCustomerField: (field: keyof CustomerInfo, value: string) => void
  setPaymentMethod: (method: PaymentMethod) => void
  setShippingOption: (optionId: string) => Promise<void>
  loadShippingOptions: () => Promise<void>
  calculateSummary: () => Promise<void>
  placeOrder: () => Promise<string | null>
  loadOrder: (orderId: string) => Promise<void>
  checkPaymentStatus: () => Promise<boolean>
  clearError: () => void
}

const fallbackShippingOptions: UiShippingOption[] = [
  {
    id: "standar",
    title: "Pengiriman Standar",
    detail: "3 - 5 hari kerja",
    price_value: 50000,
    price_label: "Rp 50.000",
  },
  {
    id: "ekspres",
    title: "Pengiriman Ekspres",
    detail: "1 - 2 hari kerja",
    price_value: 150000,
    price_label: "Rp 150.000",
  },
  {
    id: "premium",
    title: "Pengiriman Premium",
    detail: "Pengiriman hari berikutnya",
    price_value: 150000,
    price_label: "Rp 150.000",
  },
]

const getStoredValue = (key: string, fallback: string) => {
  if (typeof window === "undefined") return fallback
  return window.localStorage.getItem(key) || fallback
}

const getStoredSummary = () => {
  if (typeof window === "undefined") return null
  const raw = window.localStorage.getItem("bafain:checkoutSummary")
  if (!raw) return null
  try {
    return JSON.parse(raw) as CheckoutSummaryResponse
  } catch {
    return null
  }
}

const formatIdr = (value: number) =>
  `Rp ${value.toLocaleString("id-ID")}`

const mapShippingOption = (option: ShippingOption): UiShippingOption => ({
  id: option.id,
  title: option.name,
  detail: option.eta_text,
  price_value: option.price,
  price_label: formatIdr(option.price),
})

const buildAddressPayload = (customer: CustomerInfo) => ({
  full_name: customer.full_name,
  phone: customer.phone,
  email: customer.email,
  address_line1: customer.address,
  city: customer.city,
  postal_code: customer.postal_code,
  province: customer.province,
})

export const useCheckoutStore = create<CheckoutStoreState>((set, get) => ({
  customer: {
    full_name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    postal_code: "",
    province: "",
  },
  paymentMethod: {
    id: getStoredValue("bafain:paymentMethod", "bca"),
    label: getStoredValue("bafain:paymentLabel", "BCA Virtual Account"),
  },
  shippingOptions: fallbackShippingOptions,
  selectedShippingId: getStoredValue("bafain:shippingMethod", "standar"),
  summary: getStoredSummary(),
  orderId: getStoredValue("bafain:orderId", "") || null,
  orderStatus: null,
  paymentStatus: null,
  isLoading: false,
  error: null,

  updateCustomerField: (field, value) =>
    set((state) => ({
      customer: {
        ...state.customer,
        [field]: value,
      },
    })),

  setPaymentMethod: (method) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("bafain:paymentMethod", method.id)
      window.localStorage.setItem("bafain:paymentLabel", method.label)
    }
    set({ paymentMethod: method })
  },

  setShippingOption: async (optionId) => {
    const selected =
      get().shippingOptions.find((option) => option.id === optionId) ||
      fallbackShippingOptions[0]
    if (typeof window !== "undefined") {
      window.localStorage.setItem("bafain:shippingMethod", optionId)
      window.localStorage.setItem("bafain:shippingLabel", selected.title)
      window.localStorage.setItem("bafain:shippingDetail", selected.detail)
      window.localStorage.setItem(
        "bafain:shippingPrice",
        String(selected.price_value)
      )
    }
    set({ selectedShippingId: optionId })
    const token = getAccessToken()
    if (token) {
      try {
        await selectShipping({ option_id: optionId })
      } catch {
        // ignore selection failure and keep UI responsive
      }
    }
  },

  loadShippingOptions: async () => {
    set({ isLoading: true, error: null })
    const token = getAccessToken()
    if (!token) {
      set({ shippingOptions: fallbackShippingOptions, isLoading: false })
      return
    }
    try {
      const response = await getShippingOptions()
      const options =
        response.options?.map(mapShippingOption) || fallbackShippingOptions
      const selected =
        options.find((option) => option.id === get().selectedShippingId) ||
        options[0]
      if (typeof window !== "undefined" && selected) {
        window.localStorage.setItem("bafain:shippingLabel", selected.title)
        window.localStorage.setItem("bafain:shippingDetail", selected.detail)
        window.localStorage.setItem(
          "bafain:shippingPrice",
          String(selected.price_value)
        )
      }
      set({
        shippingOptions: options,
        isLoading: false,
      })
    } catch (err) {
      set({
        shippingOptions: fallbackShippingOptions,
        error:
          err instanceof Error && err.message
            ? err.message
            : "Gagal memuat opsi pengiriman.",
        isLoading: false,
      })
    }
  },

  calculateSummary: async () => {
    set({ isLoading: true, error: null })
    const token = getAccessToken()
    const { subtotal } = useCartStore.getState()
    const selected =
      get().shippingOptions.find(
        (option) => option.id === get().selectedShippingId
      ) || fallbackShippingOptions[0]
    const shippingFee = selected.price_value
    const localTotal = subtotal + shippingFee

    if (!token) {
      set({
        summary: {
          subtotal,
          shipping_fee: shippingFee,
          total: localTotal,
          currency: "IDR",
        },
        isLoading: false,
      })
      return
    }

    try {
      const response = await checkoutSummary({
        address: buildAddressPayload(get().customer),
        shipping_option: {
          id: selected.id,
          name: selected.title,
          price: selected.price_value,
          eta_text: selected.detail,
        },
        subtotal,
      })
      const summary =
        response.total === 0 && subtotal > 0
          ? {
              subtotal,
              shipping_fee: shippingFee,
              total: localTotal,
              currency: response.currency || "IDR",
            }
          : response
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          "bafain:checkoutSummary",
          JSON.stringify(summary)
        )
      }
      set({ summary, isLoading: false })
    } catch (err) {
      set({
        summary: {
          subtotal,
          shipping_fee: shippingFee,
          total: localTotal,
          currency: "IDR",
        },
        error:
          err instanceof Error && err.message
            ? err.message
            : "Gagal menghitung ringkasan.",
        isLoading: false,
      })
    }
  },

  placeOrder: async () => {
    set({ isLoading: true, error: null })
    const token = getAccessToken()
    if (!token) {
      set({
        error: "Silakan login untuk melanjutkan pemesanan.",
        isLoading: false,
      })
      return null
    }
    const cartState = useCartStore.getState()
    const selected =
      get().shippingOptions.find(
        (option) => option.id === get().selectedShippingId
      ) || fallbackShippingOptions[0]
    const summary = get().summary || {
      subtotal: cartState.subtotal,
      shipping_fee: selected.price_value,
      total: cartState.subtotal + selected.price_value,
      currency: "IDR",
    }
    try {
      const response = await createOrder({
        address: buildAddressPayload(get().customer),
        shipping_option: {
          id: selected.id,
          name: selected.title,
          price: selected.price_value,
          eta_text: selected.detail,
        },
        items: cartState.items.map((item) => ({
          product_id: item.product_id,
          qty: item.qty,
        })),
        subtotal: summary.subtotal,
        shipping_fee: summary.shipping_fee,
        total: summary.total,
        payment_method: get().paymentMethod,
      })
      const orderId = response.order?.id || null
      if (orderId && typeof window !== "undefined") {
        window.localStorage.setItem("bafain:orderId", orderId)
      }
      set({
        orderId,
        orderStatus: response.order?.status ?? null,
        paymentStatus: response.order?.payment_status ?? null,
        isLoading: false,
      })
      return orderId
    } catch (err) {
      set({
        error:
          err instanceof Error && err.message
            ? err.message
            : "Gagal membuat pesanan.",
        isLoading: false,
      })
      return null
    }
  },

  loadOrder: async (orderId) => {
    if (!orderId) return
    set({ isLoading: true, error: null })
    const token = getAccessToken()
    if (!token) {
      set({ isLoading: false })
      return
    }
    try {
      const response = await getOrder(orderId)
      set({
        orderId: response.order?.id || orderId,
        orderStatus: response.order?.status ?? null,
        paymentStatus: response.order?.payment_status ?? null,
        isLoading: false,
      })
    } catch (err) {
      set({
        error:
          err instanceof Error && err.message
            ? err.message
            : "Gagal memuat pesanan.",
        isLoading: false,
      })
    }
  },

  checkPaymentStatus: async () => {
    const orderId = get().orderId
    if (!orderId) {
      set({ error: "Pesanan belum tersedia." })
      return false
    }
    set({ isLoading: true, error: null })
    const token = getAccessToken()
    if (!token) {
      set({
        error: "Silakan login untuk cek pembayaran.",
        isLoading: false,
      })
      return false
    }
    try {
      const response = await checkPayment(orderId)
      set({
        orderStatus: response.status,
        paymentStatus: "paid",
        isLoading: false,
      })
      return true
    } catch (err) {
      set({
        error:
          err instanceof Error && err.message
            ? err.message
            : "Gagal mengecek pembayaran.",
        isLoading: false,
      })
      return false
    }
  },

  clearError: () => set({ error: null }),
}))
