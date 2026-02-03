import { create } from "zustand"
import {
  getProduct,
  listProducts,
  type ListProductsParams,
  type Product,
} from "@/lib/productsApi"

type ProductsStoreState = {
  products: Product[]
  currentProduct: Product | null
  isLoading: boolean
  error: string | null
  loadProducts: (params?: ListProductsParams) => Promise<void>
  loadProduct: (productId: string) => Promise<void>
  clearError: () => void
}

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message) {
    return error.message
  }
  return "Terjadi kesalahan, silakan coba lagi."
}

export const useProductsStore = create<ProductsStoreState>((set) => ({
  products: [],
  currentProduct: null,
  isLoading: false,
  error: null,

  loadProducts: async (params) => {
    set({ isLoading: true, error: null })
    try {
      const products = await listProducts(params)
      set({ products, isLoading: false })
    } catch (err) {
      set({ error: getErrorMessage(err), isLoading: false })
    }
  },
  loadProduct: async (productId) => {
    set({ isLoading: true, error: null })
    try {
      const product = await getProduct(productId)
      set({ currentProduct: product, isLoading: false })
    } catch (err) {
      set({ error: getErrorMessage(err), isLoading: false })
    }
  },

  clearError: () => set({ error: null }),
}))
