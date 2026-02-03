import { create } from "zustand"
import {
  addCartItem,
  deleteCartItem,
  getCart,
  updateCartItem,
  type CartItemPayload,
} from "@/lib/cartApi"
import { getProduct, type Product } from "@/lib/productsApi"
import { getAccessToken } from "@/stores/auth/authStorage"

type CartLine = {
  id: string
  product_id: string
  qty: number
  product: Product | null
}

type CartStoreState = {
  items: CartLine[]
  subtotal: number
  currency: string
  isLoading: boolean
  error: string | null
  loadCart: () => Promise<void>
  addItem: (productId: string, qty?: number) => Promise<void>
  updateItem: (itemId: string, qty: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  clearError: () => void
}

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message) {
    return error.message
  }
  return "Terjadi kesalahan, silakan coba lagi."
}

const enrichCartItems = async (items: CartItemPayload[]) => {
  const results = await Promise.all(
    items.map(async (item) => {
      let product: Product | null = null
      if (item.product_id) {
        try {
          product = await getProduct(item.product_id)
        } catch {
          product = null
        }
      }
      return {
        id: item.id,
        product_id: item.product_id ?? "",
        qty: item.qty,
        product,
      } as CartLine
    })
  )
  return results
}

const calculateSubtotal = (items: CartLine[]) =>
  items.reduce((total, item) => {
    const price = item.product?.price_idr ?? 0
    return total + price * item.qty
  }, 0)

export const useCartStore = create<CartStoreState>((set, get) => ({
  items: [],
  subtotal: 0,
  currency: "IDR",
  isLoading: false,
  error: null,

  loadCart: async () => {
    set({ isLoading: true, error: null })
    try {
      const token = getAccessToken()
      if (!token) {
        set({ items: [], subtotal: 0, currency: "IDR", isLoading: false })
        return
      }
      const response = await getCart()
      const items = await enrichCartItems(response.items || [])
      const subtotal = calculateSubtotal(items) || response.subtotal || 0
      set({
        items,
        subtotal,
        currency: response.currency || "IDR",
        isLoading: false,
      })
    } catch (err) {
      set({ error: getErrorMessage(err), isLoading: false })
    }
  },

  addItem: async (productId, qty = 1) => {
    set({ isLoading: true, error: null })
    try {
      const token = getAccessToken()
      if (!token) {
        set({
          error: "Silakan login untuk menambahkan produk.",
          isLoading: false,
        })
        return
      }
      const existing = get().items.find(
        (item) => item.product_id === productId
      )
      if (existing) {
        await updateCartItem(existing.id, { qty: existing.qty + qty })
        const updatedItems = get().items.map((item) =>
          item.id === existing.id
            ? { ...item, qty: item.qty + qty }
            : item
        )
        set({
          items: updatedItems,
          subtotal: calculateSubtotal(updatedItems),
          isLoading: false,
        })
        return
      }

      const response = await addCartItem({ product_id: productId, qty })
      const payload = response.item
      const itemProductId = payload.product_id ?? productId
      let product: Product | null = null
      try {
        product = await getProduct(itemProductId)
      } catch {
        product = null
      }
      const newItem: CartLine = {
        id: payload.id,
        product_id: itemProductId,
        qty: payload.qty,
        product,
      }
      const nextItems = [...get().items, newItem]
      set({
        items: nextItems,
        subtotal: calculateSubtotal(nextItems),
        isLoading: false,
      })
    } catch (err) {
      set({ error: getErrorMessage(err), isLoading: false })
    }
  },

  updateItem: async (itemId, qty) => {
    set({ isLoading: true, error: null })
    try {
      const token = getAccessToken()
      if (!token) {
        set({
          error: "Silakan login untuk memperbarui keranjang.",
          isLoading: false,
        })
        return
      }
      await updateCartItem(itemId, { qty })
      const nextItems = get().items.map((item) =>
        item.id === itemId ? { ...item, qty } : item
      )
      set({
        items: nextItems,
        subtotal: calculateSubtotal(nextItems),
        isLoading: false,
      })
    } catch (err) {
      set({ error: getErrorMessage(err), isLoading: false })
    }
  },

  removeItem: async (itemId) => {
    set({ isLoading: true, error: null })
    try {
      const token = getAccessToken()
      if (!token) {
        set({
          error: "Silakan login untuk menghapus produk.",
          isLoading: false,
        })
        return
      }
      const response = await deleteCartItem(itemId)
      if (response.deleted) {
        const nextItems = get().items.filter((item) => item.id !== itemId)
        set({
          items: nextItems,
          subtotal: calculateSubtotal(nextItems),
          isLoading: false,
        })
        return
      }
      set({ isLoading: false })
    } catch (err) {
      set({ error: getErrorMessage(err), isLoading: false })
    }
  },

  clearError: () => set({ error: null }),
}))
