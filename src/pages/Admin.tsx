import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react"
import { Link } from "react-router-dom"
import CIcon from "@coreui/icons-react"
import {
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CContainer,
  CForm,
  CFormCheck,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CHeader,
  CHeaderBrand,
  CHeaderNav,
  CNavItem,
  CNavLink,
  CModal,
  CModalBody,
  CModalHeader,
  CModalTitle,
  COffcanvas,
  COffcanvasBody,
  COffcanvasHeader,
  COffcanvasTitle,
  CRow,
  CSidebar,
  CSidebarBrand,
  CSidebarHeader,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CWidgetStatsA,
} from "@coreui/react"
import {
  cilBasket,
  cilChevronLeft,
  cilChevronRight,
  cilCog,
  cilListRich,
  cilReload,
  cilShieldAlt,
  cilSpeedometer,
  cilTruck,
} from "@coreui/icons"
import { CChartBar, CChartLine } from "@coreui/react-chartjs"
import "chart.js/auto"
import coreuiCssHref from "@coreui/coreui/dist/css/coreui.min.css?url"
import simplebarCssHref from "simplebar-react/dist/simplebar.min.css?url"
import { loginUser } from "@/lib/authApi"
import {
  createAdminProduct,
  deleteAdminProduct,
  getAdminDashboard,
  getAdminSession,
  listAdminOrders,
  listAdminProducts,
  updateAdminOrder,
  updateAdminProduct,
  updateAdminShipment,
  type AdminDashboardResponse,
  type AdminIdentity,
  type AdminOrder,
} from "@/lib/adminApi"
import type { Product } from "@/lib/productsApi"
import { useAuthStore } from "@/stores/auth/useAuthStore"

type AdminPanel = "dashboard" | "orders" | "products"

type ProductFormState = {
  id: string | null
  title: string
  price_idr: string
  stock: string
  price_unit: string
  description: string
  image_url: string
}

type ShipmentFormState = {
  carrier: string
  nomor_resi: string
  eta: string
}

type Feedback = {
  color: "success" | "danger" | "warning" | "info"
  message: string
}

const ORDER_STATUS_OPTIONS = [
  "awaiting-payment",
  "in-queue",
  "diproses",
  "aktif",
  "selesai",
  "cancelled",
  "expired",
]
const SIDEBAR_WIDTH = 270
const SIDEBAR_COLLAPSED_WIDTH = 92

const ADMIN_THEME = {
  loadingBackground: "linear-gradient(140deg, #1b2434, #27344a)",
  loginBackground:
    "radial-gradient(1200px 680px at 50% -12%, rgba(148, 163, 184, 0.2), transparent 58%), linear-gradient(145deg, #111827, #1f2937)",
  loginCardBackground: "rgba(19, 30, 46, 0.9)",
  loginCardBorder: "1px solid rgba(148, 163, 184, 0.24)",
  darkTextPrimary: "#e5edf8",
  darkTextMuted: "#a8b8d0",
  darkLink: "#9eb6dd",
  darkLinkAccent: "#d2b48c",
  loginInputBg: "#f8fafc",
  loginInputBorder: "#cbd5e1",
  appBackground: "#eef2f7",
  sidebarBackground: "linear-gradient(180deg, #1a2436, #1f2d44 42%, #18263a)",
  sidebarText: "#d9e2f0",
  sidebarActiveBorder: "1px solid rgba(129, 140, 248, 0.34)",
  sidebarActiveBackground:
    "linear-gradient(135deg, rgba(99, 102, 241, 0.28), rgba(59, 130, 246, 0.16))",
  sidebarIdleBorder: "1px solid rgba(148, 163, 184, 0.18)",
  sidebarIdleBackground: "rgba(255, 255, 255, 0.03)",
  sidebarInsetBorder: "1px solid rgba(148, 163, 184, 0.2)",
  sidebarInsetBackground: "rgba(255, 255, 255, 0.04)",
  headerBackground: "#f8fafc",
  headerBorder: "#e2e8f0",
  chartBar: "#6d7fdd",
  chartLine: "#5f77cf",
  chartPointBorder: "#e2e8f0",
}

const getSidebarNavItemStyle = (
  active: boolean,
  collapsed: boolean
): CSSProperties => ({
  borderRadius: 14,
  padding: collapsed ? "0.75rem 0.7rem" : "0.75rem 0.9rem",
  border: active
    ? ADMIN_THEME.sidebarActiveBorder
    : ADMIN_THEME.sidebarIdleBorder,
  background: active
    ? ADMIN_THEME.sidebarActiveBackground
    : ADMIN_THEME.sidebarIdleBackground,
  color: ADMIN_THEME.sidebarText,
  fontWeight: 600,
  justifyContent: collapsed ? "center" : "flex-start",
})

const defaultProductForm: ProductFormState = {
  id: null,
  title: "",
  price_idr: "",
  stock: "0",
  price_unit: "",
  description: "",
  image_url: "",
}

const defaultShipmentForm: ShipmentFormState = {
  carrier: "",
  nomor_resi: "",
  eta: "",
}

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message) {
    return error.message
  }
  return "Terjadi kesalahan, silakan coba lagi."
}

const formatIdr = (value: number | null | undefined) =>
  `Rp ${(value || 0).toLocaleString("id-ID")}`

const formatDate = (value: string | null | undefined) => {
  if (!value) return "-"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "-"
  return parsed.toLocaleString("id-ID", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const badgeColorByStatus = (status: string | null | undefined) => {
  if (!status) return "secondary"
  if (status === "selesai") return "success"
  if (status === "aktif" || status === "diproses") return "info"
  if (status === "awaiting-payment" || status === "in-queue") return "warning"
  if (status === "cancelled" || status === "expired") return "danger"
  return "secondary"
}

const badgeColorByPayment = (status: string | null | undefined) => {
  if (status === "paid") return "success"
  if (status === "pending") return "warning"
  if (status === "expired") return "danger"
  return "secondary"
}

function useScopedStylesheets(hrefs: string[]) {
  useEffect(() => {
    const links = hrefs.map((href) => {
      const link = document.createElement("link")
      link.rel = "stylesheet"
      link.href = href
      link.dataset.adminStylesheet = "true"
      document.head.appendChild(link)
      return link
    })

    return () => {
      links.forEach((link) => link.remove())
    }
  }, [hrefs])
}

export function Admin() {
  const adminStylesheets = useMemo(
    () => [coreuiCssHref, simplebarCssHref],
    []
  )
  useScopedStylesheets(adminStylesheets)

  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
  const setSession = useAuthStore((state) => state.setSession)
  const setUser = useAuthStore((state) => state.setUser)
  const logout = useAuthStore((state) => state.logout)

  const [activePanel, setActivePanel] = useState<AdminPanel>("dashboard")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const [admin, setAdmin] = useState<AdminIdentity | null>(null)
  const [authChecking, setAuthChecking] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginSubmitting, setLoginSubmitting] = useState(false)

  const [dashboard, setDashboard] = useState<AdminDashboardResponse | null>(null)
  const [dashboardLoading, setDashboardLoading] = useState(false)
  const [dashboardError, setDashboardError] = useState<string | null>(null)
  const [selectedSalesYear, setSelectedSalesYear] = useState<number | null>(null)

  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersError, setOrdersError] = useState<string | null>(null)
  const [orderQuery, setOrderQuery] = useState("")
  const [orderStatusFilter, setOrderStatusFilter] = useState("")
  const [orderStatusDrafts, setOrderStatusDrafts] = useState<
    Record<string, string>
  >({})
  const [savingStatusByOrder, setSavingStatusByOrder] = useState<
    Record<string, boolean>
  >({})
  const [shipmentOrderId, setShipmentOrderId] = useState<string | null>(null)
  const [shipmentForm, setShipmentForm] = useState<ShipmentFormState>(
    defaultShipmentForm
  )
  const [savingShipment, setSavingShipment] = useState(false)

  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [productsError, setProductsError] = useState<string | null>(null)
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])
  const [productFormOpen, setProductFormOpen] = useState(false)
  const [productForm, setProductForm] = useState<ProductFormState>(
    defaultProductForm
  )
  const [productSubmitting, setProductSubmitting] = useState(false)
  const [deletingSelectedProducts, setDeletingSelectedProducts] = useState(false)

  const canManageOrders = useMemo(
    () =>
      admin?.role === "operator" ||
      admin?.role === "admin" ||
      admin?.role === "super_admin",
    [admin?.role]
  )
  const canManageProducts = useMemo(
    () => admin?.role === "admin" || admin?.role === "super_admin",
    [admin?.role]
  )
  const isAllProductsSelected = useMemo(() => {
    if (products.length === 0) return false
    const selectedSet = new Set(selectedProductIds)
    return products.every((product) => selectedSet.has(product.id))
  }, [products, selectedProductIds])

  const loadDashboard = useCallback(async () => {
    setDashboardLoading(true)
    setDashboardError(null)
    try {
      const response = await getAdminDashboard()
      setDashboard(response)
    } catch (error) {
      setDashboardError(getErrorMessage(error))
    } finally {
      setDashboardLoading(false)
    }
  }, [])

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true)
    setOrdersError(null)
    try {
      const response = await listAdminOrders({
        page: 1,
        limit: 20,
        q: orderQuery || undefined,
        status: orderStatusFilter || undefined,
      })
      setOrders(response.orders)
      setOrderStatusDrafts((prev) => {
        const next = { ...prev }
        response.orders.forEach((order) => {
          if (!next[order.id]) {
            next[order.id] = order.status || "diproses"
          }
        })
        return next
      })
    } catch (error) {
      setOrdersError(getErrorMessage(error))
    } finally {
      setOrdersLoading(false)
    }
  }, [orderQuery, orderStatusFilter])

  const loadProducts = useCallback(async () => {
    setProductsLoading(true)
    setProductsError(null)
    try {
      const response = await listAdminProducts({
        limit: 100,
        offset: 0,
      })
      setProducts(response)
    } catch (error) {
      setProductsError(getErrorMessage(error))
    } finally {
      setProductsLoading(false)
    }
  }, [])

  const loadAllData = useCallback(async () => {
    setRefreshing(true)
    await Promise.all([loadDashboard(), loadOrders(), loadProducts()])
    setRefreshing(false)
  }, [loadDashboard, loadOrders, loadProducts])

  const verifyAdminSession = useCallback(async () => {
    setAuthChecking(true)
    setAuthError(null)
    try {
      const session = await getAdminSession()
      setAdmin(session.admin)
      setAuthError(null)
    } catch (error) {
      setAdmin(null)
      setAuthError(getErrorMessage(error))
    } finally {
      setAuthChecking(false)
    }
  }, [])

  useEffect(() => {
    if (!isLoggedIn) {
      setAdmin(null)
      setAuthChecking(false)
      return
    }
    void verifyAdminSession()
  }, [isLoggedIn, verifyAdminSession])

  useEffect(() => {
    if (!admin) return
    void loadAllData()
  }, [admin, loadAllData])

  useEffect(() => {
    setSelectedProductIds((prev) => {
      const availableIds = new Set(products.map((product) => product.id))
      const next = prev.filter((id) => availableIds.has(id))
      return next.length === prev.length ? prev : next
    })
  }, [products])

  useEffect(() => {
    if (!feedback) return
    if (feedback.color !== "success") return
    if (!feedback.message.toLowerCase().includes("produk berhasil dihapus")) return

    const timeoutId = window.setTimeout(() => {
      setFeedback((current) => {
        if (!current) return current
        if (current.message !== feedback.message) return current
        return null
      })
    }, 3500)

    return () => window.clearTimeout(timeoutId)
  }, [feedback])

  const handleAdminLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoginSubmitting(true)
    setAuthError(null)
    setFeedback(null)

    try {
      const result = await loginUser({
        email: loginEmail.trim(),
        password: loginPassword,
      })
      setSession(result.session ?? null)
      setUser(result.user ?? null)
      const session = await getAdminSession()
      setAdmin(session.admin)
      setLoginEmail("")
      setLoginPassword("")
      await loadAllData()
      setFeedback({ color: "success", message: "Login admin berhasil." })
    } catch (error) {
      logout()
      setAdmin(null)
      setAuthError(getErrorMessage(error))
    } finally {
      setLoginSubmitting(false)
      setAuthChecking(false)
    }
  }

  const handleSaveOrderStatus = async (orderId: string) => {
    const nextStatus = orderStatusDrafts[orderId]
    if (!nextStatus) return
    setFeedback(null)
    setSavingStatusByOrder((prev) => ({ ...prev, [orderId]: true }))

    try {
      await updateAdminOrder(orderId, { status: nextStatus })
      setFeedback({
        color: "success",
        message: `Status order ${orderId} berhasil diperbarui.`,
      })
      await Promise.all([loadOrders(), loadDashboard()])
    } catch (error) {
      setFeedback({ color: "danger", message: getErrorMessage(error) })
    } finally {
      setSavingStatusByOrder((prev) => ({ ...prev, [orderId]: false }))
    }
  }

  const openShipmentEditor = (order: AdminOrder) => {
    setShipmentOrderId(order.id)
    setShipmentForm({
      carrier: order.shipment?.carrier || "",
      nomor_resi: order.shipment?.nomor_resi || "",
      eta: order.shipment?.eta || "",
    })
  }

  const handleSaveShipment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!shipmentOrderId) return
    if (!shipmentForm.carrier.trim() || !shipmentForm.nomor_resi.trim()) {
      setFeedback({
        color: "warning",
        message: "Carrier dan nomor resi wajib diisi.",
      })
      return
    }

    setSavingShipment(true)
    setFeedback(null)
    try {
      await updateAdminShipment(shipmentOrderId, {
        carrier: shipmentForm.carrier.trim(),
        nomor_resi: shipmentForm.nomor_resi.trim(),
        ...(shipmentForm.eta.trim() ? { eta: shipmentForm.eta.trim() } : {}),
      })
      setFeedback({
        color: "success",
        message: `Shipment order ${shipmentOrderId} berhasil diperbarui.`,
      })
      setShipmentOrderId(null)
      await loadOrders()
    } catch (error) {
      setFeedback({ color: "danger", message: getErrorMessage(error) })
    } finally {
      setSavingShipment(false)
    }
  }

  const handleEditProduct = (product: Product) => {
    setProductForm({
      id: product.id,
      title: product.title || "",
      price_idr: String(product.price_idr || 0),
      stock:
        typeof product.stock === "number" && Number.isFinite(product.stock)
          ? String(product.stock)
          : "20",
      price_unit: product.price_unit || "",
      description: product.description || "",
      image_url: product.image_url || "",
    })
    setProductFormOpen(true)
    setActivePanel("products")
  }

  const handleSubmitProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canManageProducts) return

    const title = productForm.title.trim()
    const priceValue = Number(productForm.price_idr)
    const stockValue = Number(productForm.stock)
    if (!title) {
      setFeedback({ color: "warning", message: "Nama produk wajib diisi." })
      return
    }
    if (!Number.isFinite(priceValue) || priceValue < 0) {
      setFeedback({ color: "warning", message: "Harga produk tidak valid." })
      return
    }
    if (!Number.isFinite(stockValue) || stockValue < 0) {
      setFeedback({ color: "warning", message: "Stock produk tidak valid." })
      return
    }
    if (!Number.isInteger(stockValue)) {
      setFeedback({
        color: "warning",
        message: "Stock harus berupa bilangan bulat.",
      })
      return
    }

    setProductSubmitting(true)
    setFeedback(null)
    try {
      const payload = {
        title,
        price_idr: Math.round(priceValue),
        stock: stockValue,
        ...(productForm.price_unit.trim()
          ? { price_unit: productForm.price_unit.trim() }
          : {}),
        ...(productForm.description.trim()
          ? { description: productForm.description.trim() }
          : {}),
        ...(productForm.image_url.trim()
          ? { image_url: productForm.image_url.trim() }
          : {}),
      }

      if (productForm.id) {
        await updateAdminProduct(productForm.id, payload)
        setFeedback({ color: "success", message: "Produk berhasil diperbarui." })
      } else {
        await createAdminProduct({
          ...payload,
          images: [],
          features: [],
          specs: [],
          benefits: [],
          gallery: [],
        })
        setFeedback({ color: "success", message: "Produk berhasil ditambahkan." })
      }

      setProductForm(defaultProductForm)
      setProductFormOpen(false)
      await Promise.all([loadProducts(), loadDashboard()])
    } catch (error) {
      setFeedback({ color: "danger", message: getErrorMessage(error) })
    } finally {
      setProductSubmitting(false)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!canManageProducts) return
    const ok = window.confirm("Hapus produk ini? Aksi ini tidak bisa dibatalkan.")
    if (!ok) return

    setFeedback(null)
    try {
      await deleteAdminProduct(productId)
      setFeedback({ color: "success", message: "Produk berhasil dihapus." })
      await Promise.all([loadProducts(), loadDashboard()])
    } catch (error) {
      setFeedback({ color: "danger", message: getErrorMessage(error) })
    }
  }

  const handleDeleteSelectedProducts = async () => {
    if (!canManageProducts) return
    if (selectedProductIds.length === 0) {
      setFeedback({ color: "warning", message: "Belum ada produk yang dicentang." })
      return
    }

    const ok = window.confirm(
      `Hapus ${selectedProductIds.length} produk yang dicentang? Aksi ini tidak bisa dibatalkan.`
    )
    if (!ok) return

    setDeletingSelectedProducts(true)
    setFeedback(null)
    try {
      const results = await Promise.allSettled(
        selectedProductIds.map((productId) => deleteAdminProduct(productId))
      )
      const successCount = results.filter((result) => result.status === "fulfilled").length
      const failedCount = results.length - successCount

      if (successCount > 0) {
        await Promise.all([loadProducts(), loadDashboard()])
      }

      if (failedCount === 0) {
        setSelectedProductIds([])
        setFeedback({
          color: "success",
          message: `${successCount} produk berhasil dihapus.`,
        })
        return
      }

      setFeedback({
        color: "warning",
        message: `${successCount} produk berhasil dihapus, ${failedCount} gagal dihapus.`,
      })
    } catch (error) {
      setFeedback({ color: "danger", message: getErrorMessage(error) })
    } finally {
      setDeletingSelectedProducts(false)
    }
  }

  const openCreateProductForm = () => {
    if (!canManageProducts) return
    setProductForm(defaultProductForm)
    setProductFormOpen(true)
  }

  const closeProductForm = () => {
    setProductFormOpen(false)
    setProductForm(defaultProductForm)
  }

  const toggleProductSelection = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    )
  }

  const toggleSelectAllProducts = () => {
    setSelectedProductIds((prev) => {
      if (products.length === 0) return []
      const allIds = products.map((product) => product.id)
      const allSelected = allIds.every((id) => prev.includes(id))
      return allSelected ? [] : allIds
    })
  }

  const statusChartLabels = dashboard?.orders_by_status.map((x) => x.status) || []
  const statusChartData = dashboard?.orders_by_status.map((x) => x.count) || []
  const monthlySalesData = dashboard?.monthly_sales || []
  const availableSalesYears = monthlySalesData.map((entry) => entry.year)
  const effectiveSalesYear =
    selectedSalesYear && availableSalesYears.includes(selectedSalesYear)
      ? selectedSalesYear
      : availableSalesYears[0] || null
  const selectedYearSales = monthlySalesData.find(
    (entry) => entry.year === effectiveSalesYear
  )
  const monthlySalesLabels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ]
  const monthlySalesTotals = selectedYearSales?.monthly_totals || Array(12).fill(0)
  const selectedYearSalesTotal = monthlySalesTotals.reduce(
    (acc, value) => acc + value,
    0
  )
  const loginInputStyle: CSSProperties = {
    backgroundColor: ADMIN_THEME.loginInputBg,
    borderColor: ADMIN_THEME.loginInputBorder,
    color: "#1f2937",
  }
  const sidebarWidth = sidebarCollapsed
    ? SIDEBAR_COLLAPSED_WIDTH
    : SIDEBAR_WIDTH

  useEffect(() => {
    if (!availableSalesYears.length) {
      setSelectedSalesYear(null)
      return
    }
    if (selectedSalesYear && availableSalesYears.includes(selectedSalesYear)) {
      return
    }
    setSelectedSalesYear(availableSalesYears[0])
  }, [availableSalesYears, selectedSalesYear])

  if (authChecking) {
    return (
      <div
        className="d-flex min-vh-100 align-items-center justify-content-center"
        style={{ background: ADMIN_THEME.loadingBackground }}
      >
        <div className="text-center" style={{ color: ADMIN_THEME.darkTextPrimary }}>
          <CSpinner color="light" />
          <p className="mt-3 mb-0" style={{ color: ADMIN_THEME.darkTextMuted }}>
            Memeriksa akses admin...
          </p>
        </div>
      </div>
    )
  }

  if (!admin) {
    return (
      <div
        className="d-flex min-vh-100 align-items-center"
        style={{ background: ADMIN_THEME.loginBackground }}
      >
        <CContainer>
          <CRow className="justify-content-center">
            <CCol md={7} lg={5}>
              <CCard
                className="border-0 shadow-lg"
                style={{
                  background: ADMIN_THEME.loginCardBackground,
                  color: ADMIN_THEME.darkTextPrimary,
                  border: ADMIN_THEME.loginCardBorder,
                }}
              >
                <CCardBody className="p-4 p-lg-5">
                  <div className="mb-4">
                    <h2 className="h4 mb-1" style={{ color: ADMIN_THEME.darkTextPrimary }}>
                      Admin System
                    </h2>
                    <p className="mb-0" style={{ color: ADMIN_THEME.darkTextMuted }}>
                      Login menggunakan akun admin untuk membuka /admin.
                    </p>
                  </div>
                  {authError && (
                    <CAlert color="danger" className="mb-3">
                      {authError}
                    </CAlert>
                  )}
                  <CForm onSubmit={handleAdminLogin}>
                    <div className="mb-3">
                      <CFormLabel htmlFor="admin-login-email">Email</CFormLabel>
                      <CFormInput
                        id="admin-login-email"
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(event) => setLoginEmail(event.target.value)}
                        placeholder="admin@bafain.com"
                        style={loginInputStyle}
                      />
                    </div>
                    <div className="mb-4">
                      <CFormLabel htmlFor="admin-login-password">Password</CFormLabel>
                      <CFormInput
                        id="admin-login-password"
                        type="password"
                        required
                        value={loginPassword}
                        onChange={(event) => setLoginPassword(event.target.value)}
                        placeholder="Masukkan password admin"
                        style={loginInputStyle}
                      />
                    </div>
                    <CButton
                      type="submit"
                      className="w-100 border-0"
                      style={{
                        background:
                          "linear-gradient(135deg, #6476d9, #7387dc)",
                        color: "#f8fafc",
                      }}
                      disabled={loginSubmitting}
                    >
                      {loginSubmitting ? "Memproses..." : "Login Admin"}
                    </CButton>
                  </CForm>
                  <div className="mt-4 d-flex justify-content-between small">
                    <Link
                      to="/beranda"
                      className="text-decoration-none"
                      style={{ color: ADMIN_THEME.darkLink }}
                    >
                      Kembali ke beranda
                    </Link>
                    {isLoggedIn && (
                      <button
                        type="button"
                        onClick={logout}
                        className="btn btn-link p-0 text-decoration-none"
                        style={{ color: ADMIN_THEME.darkLinkAccent }}
                      >
                        Logout sesi saat ini
                      </button>
                    )}
                  </div>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        </CContainer>
      </div>
    )
  }

  return (
    <div className="min-vh-100" style={{ backgroundColor: ADMIN_THEME.appBackground }}>
      <CSidebar
        colorScheme="dark"
        className="border-0 d-flex flex-column"
        style={{
          width: sidebarWidth,
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          height: "100vh",
          overflowY: "auto",
          zIndex: 1030,
          background: ADMIN_THEME.sidebarBackground,
          padding: "0.85rem 0.7rem 0.8rem",
          boxShadow: "8px 0 28px rgba(15, 23, 42, 0.2)",
          transition: "width 0.22s ease",
        }}
      >
        <CSidebarHeader className="border-0 p-2 pb-3">
          <div className="mb-2 d-flex justify-content-end">
            <CButton
              color="light"
              variant="outline"
              size="sm"
              className="d-inline-flex align-items-center justify-content-center text-white"
              style={{
                width: 34,
                height: 34,
                borderColor: "rgba(148, 163, 184, 0.35)",
                background: "rgba(255, 255, 255, 0.06)",
              }}
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={() => setSidebarCollapsed((prev) => !prev)}
            >
              <CIcon icon={sidebarCollapsed ? cilChevronRight : cilChevronLeft} />
            </CButton>
          </div>
          <CSidebarBrand
            className="m-0 d-flex align-items-center fw-semibold text-white rounded-4"
            style={{
              padding: sidebarCollapsed ? "0.85rem 0.65rem" : "0.85rem 0.95rem",
              border: ADMIN_THEME.sidebarInsetBorder,
              background: ADMIN_THEME.sidebarInsetBackground,
              justifyContent: sidebarCollapsed ? "center" : "flex-start",
            }}
          >
            <CIcon
              icon={cilShieldAlt}
              className={sidebarCollapsed ? "" : "me-2"}
              size="lg"
            />
            {!sidebarCollapsed && "Bafain Admin"}
          </CSidebarBrand>
        </CSidebarHeader>
        <div className="px-2">
          {!sidebarCollapsed && (
            <div
              className="small text-uppercase fw-semibold mb-2"
              style={{ color: "rgba(217, 226, 240, 0.66)", paddingLeft: "0.5rem" }}
            >
              Navigation
            </div>
          )}
          <div className="d-grid gap-2">
            <CNavLink
              href="#"
              active={activePanel === "dashboard"}
              className="d-flex align-items-center"
              style={getSidebarNavItemStyle(activePanel === "dashboard", sidebarCollapsed)}
              title="Dashboard"
              onClick={(event) => {
                event.preventDefault()
                setActivePanel("dashboard")
              }}
            >
              <CIcon
                icon={cilSpeedometer}
                className={sidebarCollapsed ? "" : "me-2"}
              />
              {!sidebarCollapsed && "Dashboard"}
            </CNavLink>
            <CNavLink
              href="#"
              active={activePanel === "orders"}
              className="d-flex align-items-center"
              style={getSidebarNavItemStyle(activePanel === "orders", sidebarCollapsed)}
              title="Orders"
              onClick={(event) => {
                event.preventDefault()
                setActivePanel("orders")
              }}
            >
              <CIcon icon={cilListRich} className={sidebarCollapsed ? "" : "me-2"} />
              {!sidebarCollapsed && "Orders"}
            </CNavLink>
            <CNavLink
              href="#"
              active={activePanel === "products"}
              className="d-flex align-items-center"
              style={getSidebarNavItemStyle(activePanel === "products", sidebarCollapsed)}
              title="Products"
              onClick={(event) => {
                event.preventDefault()
                setActivePanel("products")
              }}
            >
              <CIcon icon={cilBasket} className={sidebarCollapsed ? "" : "me-2"} />
              {!sidebarCollapsed && "Products"}
            </CNavLink>
          </div>
        </div>
        <div className="mt-auto p-2 pt-3 text-white small">
          <div
            className="rounded-4"
            style={{
              border: ADMIN_THEME.sidebarInsetBorder,
              background: ADMIN_THEME.sidebarInsetBackground,
              padding: "0.85rem 0.9rem",
              textAlign: sidebarCollapsed ? "center" : "left",
            }}
          >
            {sidebarCollapsed ? (
              <CBadge color="info">{admin.role.slice(0, 1).toUpperCase()}</CBadge>
            ) : (
              <>
                <div className="mb-2 fw-semibold">Signed in</div>
                <div className="text-truncate">{admin.email || admin.uid}</div>
                <CBadge color="info" className="mt-2">
                  role: {admin.role}
                </CBadge>
              </>
            )}
          </div>
        </div>
      </CSidebar>

      <div
        className="d-flex min-vh-100 flex-column"
        style={{
          marginLeft: sidebarWidth,
          transition: "margin-left 0.2s ease",
        }}
      >
        <CHeader
          className="border-bottom px-3 py-2"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 1020,
            backgroundColor: ADMIN_THEME.headerBackground,
            borderColor: ADMIN_THEME.headerBorder,
          }}
        >
          <CHeaderBrand className="fw-semibold" style={{ color: "#334155" }}>
            <CIcon icon={cilCog} className="me-2" style={{ color: "#6476d9" }} />
            Admin Control Center
          </CHeaderBrand>
          <CHeaderNav className="ms-auto d-flex align-items-center">
            <CNavItem>
              <CButton
                color="primary"
                variant="outline"
                className="me-2"
                onClick={() => {
                  void loadAllData()
                }}
                disabled={refreshing}
              >
                <CIcon icon={cilReload} className="me-2" />
                Refresh
              </CButton>
            </CNavItem>
            <CNavItem>
              <CButton color="danger" onClick={logout}>
                Logout
              </CButton>
            </CNavItem>
          </CHeaderNav>
        </CHeader>

        <CContainer fluid className="p-4">
          {feedback && (
            <CAlert color={feedback.color} className="mb-4">
              {feedback.message}
            </CAlert>
          )}

          {activePanel === "dashboard" && (
            <>
              <CRow className="g-3 mb-3">
                <CCol sm={6} xl={3}>
                  <CWidgetStatsA
                    color="primary"
                    value={<>{dashboard?.summary.total_orders ?? 0}</>}
                    title="Total Orders"
                  />
                </CCol>
                <CCol sm={6} xl={3}>
                  <CWidgetStatsA
                    color="success"
                    value={<>{dashboard?.summary.paid_orders ?? 0}</>}
                    title="Paid Orders"
                  />
                </CCol>
                <CCol sm={6} xl={3}>
                  <CWidgetStatsA
                    color="warning"
                    value={<>{dashboard?.summary.pending_orders ?? 0}</>}
                    title="Pending Orders"
                  />
                </CCol>
                <CCol sm={6} xl={3}>
                  <CWidgetStatsA
                    color="info"
                    value={<>{dashboard?.summary.products_count ?? 0}</>}
                    title="Products"
                  />
                </CCol>
              </CRow>
              <CRow className="g-3">
                <CCol lg={8}>
                  <CCard className="h-100 border-0 shadow-sm">
                    <CCardHeader className="bg-white d-flex justify-content-between">
                      <span className="fw-semibold">Orders by Status</span>
                      {dashboardLoading && <CSpinner size="sm" />}
                    </CCardHeader>
                    <CCardBody>
                      {dashboardError && (
                        <CAlert color="danger" className="mb-3">
                          {dashboardError}
                        </CAlert>
                      )}
                      {statusChartLabels.length > 0 ? (
                        <CChartBar
                          data={{
                            labels: statusChartLabels,
                            datasets: [
                              {
                                label: "Jumlah Order",
                                backgroundColor: ADMIN_THEME.chartBar,
                                borderRadius: 10,
                                data: statusChartData,
                              },
                            ],
                          }}
                          options={{
                            plugins: { legend: { display: false } },
                            scales: {
                              y: {
                                beginAtZero: true,
                                ticks: { precision: 0 },
                              },
                            },
                          }}
                        />
                      ) : (
                        <p className="text-body-secondary mb-0">
                          Belum ada data status order.
                        </p>
                      )}
                    </CCardBody>
                  </CCard>
                </CCol>
                <CCol lg={4}>
                  <CCard className="h-100 border-0 shadow-sm">
                    <CCardHeader className="bg-white fw-semibold">
                      Revenue Summary
                    </CCardHeader>
                    <CCardBody>
                      <h3 className="mb-1">{formatIdr(dashboard?.summary.total_revenue)}</h3>
                      <p className="text-body-secondary mb-4">Total paid revenue</p>
                      <div className="small text-body-secondary">
                        <div className="d-flex justify-content-between mb-1">
                          <span>Paid</span>
                          <span>{dashboard?.summary.paid_orders ?? 0}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-1">
                          <span>Pending</span>
                          <span>{dashboard?.summary.pending_orders ?? 0}</span>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span>Total</span>
                          <span>{dashboard?.summary.total_orders ?? 0}</span>
                        </div>
                      </div>
                    </CCardBody>
                  </CCard>
                </CCol>
              </CRow>
              <CRow className="g-3 mt-1">
                <CCol lg={12}>
                  <CCard className="border-0 shadow-sm">
                    <CCardHeader className="bg-white d-flex flex-wrap justify-content-between align-items-center gap-2">
                      <div>
                        <span className="fw-semibold">Penjualan Per Bulan</span>
                        <div className="small text-body-secondary">
                          Total {effectiveSalesYear || "-"}: {formatIdr(selectedYearSalesTotal)}
                        </div>
                      </div>
                      <div style={{ minWidth: 160 }}>
                        <CFormSelect
                          value={effectiveSalesYear ?? ""}
                          onChange={(event) => {
                            const nextYear = Number(event.target.value)
                            setSelectedSalesYear(
                              Number.isFinite(nextYear) ? nextYear : null
                            )
                          }}
                          disabled={!availableSalesYears.length}
                        >
                          {availableSalesYears.length === 0 && (
                            <option value="">Tidak ada tahun</option>
                          )}
                          {availableSalesYears.map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </CFormSelect>
                      </div>
                    </CCardHeader>
                    <CCardBody>
                      {availableSalesYears.length > 0 ? (
                        <CChartLine
                          data={{
                            labels: monthlySalesLabels,
                            datasets: [
                              {
                                label: `Penjualan ${effectiveSalesYear}`,
                                data: monthlySalesTotals,
                                borderColor: ADMIN_THEME.chartLine,
                                pointBackgroundColor: ADMIN_THEME.chartLine,
                                pointBorderColor: ADMIN_THEME.chartPointBorder,
                                tension: 0.35,
                                fill: false,
                              },
                            ],
                          }}
                          options={{
                            plugins: { legend: { display: true } },
                            scales: {
                              y: {
                                beginAtZero: true,
                              },
                            },
                          }}
                        />
                      ) : (
                        <p className="text-body-secondary mb-0">
                          Belum ada data order untuk ditampilkan.
                        </p>
                      )}
                    </CCardBody>
                  </CCard>
                </CCol>
              </CRow>
            </>
          )}

          {activePanel === "orders" && (
            <CCard className="border-0 shadow-sm">
              <CCardHeader className="bg-white">
                <CRow className="g-2 align-items-center">
                  <CCol md={5}>
                    <CFormInput
                      value={orderQuery}
                      onChange={(event) => setOrderQuery(event.target.value)}
                      placeholder="Cari ID order / catatan"
                    />
                  </CCol>
                  <CCol md={4}>
                    <CFormSelect
                      value={orderStatusFilter}
                      onChange={(event) => setOrderStatusFilter(event.target.value)}
                    >
                      <option value="">Semua status</option>
                      {ORDER_STATUS_OPTIONS.map((statusValue) => (
                        <option key={statusValue} value={statusValue}>
                          {statusValue}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>
                  <CCol md={3} className="d-grid">
                    <CButton
                      color="primary"
                      variant="outline"
                      onClick={() => {
                        void loadOrders()
                      }}
                    >
                      Filter Order
                    </CButton>
                  </CCol>
                </CRow>
              </CCardHeader>
              <CCardBody>
                {!canManageOrders && (
                  <CAlert color="warning">
                    Role {admin.role} hanya dapat melihat order tanpa update.
                  </CAlert>
                )}
                {ordersError && <CAlert color="danger">{ordersError}</CAlert>}
                {ordersLoading ? (
                  <div className="text-center py-5">
                    <CSpinner />
                  </div>
                ) : (
                  <CTable responsive hover align="middle">
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>ID</CTableHeaderCell>
                        <CTableHeaderCell>User</CTableHeaderCell>
                        <CTableHeaderCell>Created</CTableHeaderCell>
                        <CTableHeaderCell>Status</CTableHeaderCell>
                        <CTableHeaderCell>Payment</CTableHeaderCell>
                        <CTableHeaderCell>Total</CTableHeaderCell>
                        <CTableHeaderCell>Shipment</CTableHeaderCell>
                        <CTableHeaderCell style={{ minWidth: 220 }}>
                          Actions
                        </CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {orders.length === 0 && (
                        <CTableRow>
                          <CTableDataCell colSpan={8} className="text-center py-4">
                            Order tidak ditemukan.
                          </CTableDataCell>
                        </CTableRow>
                      )}
                      {orders.map((order) => (
                        <CTableRow key={order.id}>
                          <CTableDataCell className="fw-semibold">{order.id}</CTableDataCell>
                          <CTableDataCell>{order.user_id || "-"}</CTableDataCell>
                          <CTableDataCell>{formatDate(order.created_at)}</CTableDataCell>
                          <CTableDataCell>
                            <CBadge color={badgeColorByStatus(order.status)}>
                              {order.status || "-"}
                            </CBadge>
                          </CTableDataCell>
                          <CTableDataCell>
                            <CBadge color={badgeColorByPayment(order.payment_status)}>
                              {order.payment_status || "-"}
                            </CBadge>
                          </CTableDataCell>
                          <CTableDataCell>{formatIdr(order.total)}</CTableDataCell>
                          <CTableDataCell className="small">
                            {order.shipment?.carrier ? (
                              <>
                                <div>{order.shipment.carrier}</div>
                                <div className="text-body-secondary">
                                  {order.shipment.nomor_resi || "-"}
                                </div>
                              </>
                            ) : (
                              <span className="text-body-secondary">Belum diisi</span>
                            )}
                          </CTableDataCell>
                          <CTableDataCell>
                            {canManageOrders ? (
                              <div className="d-flex gap-2">
                                <CFormSelect
                                  size="sm"
                                  value={orderStatusDrafts[order.id] || order.status || ""}
                                  onChange={(event) =>
                                    setOrderStatusDrafts((prev) => ({
                                      ...prev,
                                      [order.id]: event.target.value,
                                    }))
                                  }
                                >
                                  {ORDER_STATUS_OPTIONS.map((statusValue) => (
                                    <option key={statusValue} value={statusValue}>
                                      {statusValue}
                                    </option>
                                  ))}
                                </CFormSelect>
                                <CButton
                                  size="sm"
                                  color="primary"
                                  onClick={() => {
                                    void handleSaveOrderStatus(order.id)
                                  }}
                                  disabled={savingStatusByOrder[order.id]}
                                >
                                  Save
                                </CButton>
                                <CButton
                                  size="sm"
                                  color="info"
                                  variant="outline"
                                  aria-label={`Update shipment ${order.id}`}
                                  onClick={() => openShipmentEditor(order)}
                                >
                                  <CIcon icon={cilTruck} />
                                </CButton>
                              </div>
                            ) : (
                              <span className="text-body-secondary small">Read-only</span>
                            )}
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                )}
              </CCardBody>
            </CCard>
          )}

          {activePanel === "products" && (
            <CCard className="border-0 shadow-sm">
              <CCardHeader className="bg-white d-flex flex-wrap justify-content-between align-items-center gap-2">
                <div className="d-flex align-items-center gap-2">
                  <span className="fw-semibold">Daftar Produk</span>
                  <span className="small text-body-secondary">
                    {selectedProductIds.length} dipilih
                  </span>
                </div>
                <div className="d-flex flex-wrap align-items-center gap-3">
                  <CFormCheck
                    id="admin-products-select-all"
                    label="Centang semua"
                    checked={isAllProductsSelected}
                    onChange={() => toggleSelectAllProducts()}
                    disabled={products.length === 0}
                    style={{ borderColor: "#111827" }}
                  />
                  {canManageProducts ? (
                    <>
                      <CButton
                        color="danger"
                        variant="outline"
                        onClick={() => {
                          void handleDeleteSelectedProducts()
                        }}
                        disabled={
                          selectedProductIds.length === 0 || deletingSelectedProducts
                        }
                      >
                        {deletingSelectedProducts ? "Menghapus..." : "Hapus terpilih"}
                      </CButton>
                      <CButton color="primary" onClick={openCreateProductForm}>
                        Tambah Produk
                      </CButton>
                    </>
                  ) : (
                    <span className="small text-body-secondary">Mode read-only</span>
                  )}
                </div>
              </CCardHeader>
              <CCardBody>
                {!canManageProducts && (
                  <CAlert color="warning" className="mb-3">
                    Role {admin.role} hanya dapat melihat data produk.
                  </CAlert>
                )}
                {productsError && <CAlert color="danger">{productsError}</CAlert>}
                {productsLoading ? (
                  <div className="text-center py-5">
                    <CSpinner />
                  </div>
                ) : (
                  <CTable hover align="middle" style={{ tableLayout: "fixed", width: "100%" }}>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell
                          style={{ width: "4%", paddingLeft: "0.5rem", paddingRight: "0.5rem" }}
                        />
                        <CTableHeaderCell style={{ width: "23%", paddingLeft: "0.25rem" }}>
                          Produk
                        </CTableHeaderCell>
                        <CTableHeaderCell style={{ width: "32%", paddingLeft: "0.75rem" }}>
                          Deskripsi
                        </CTableHeaderCell>
                        <CTableHeaderCell
                          className="text-start"
                          style={{ width: "8%", paddingLeft: "0.75rem" }}
                        >
                          Stock
                        </CTableHeaderCell>
                        <CTableHeaderCell
                          className="text-start"
                          style={{ width: "18%", paddingLeft: "0.75rem" }}
                        >
                          Harga
                        </CTableHeaderCell>
                        <CTableHeaderCell
                          className="text-start"
                          style={{ width: "15%", paddingLeft: "0.75rem" }}
                        >
                          Aksi
                        </CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {products.length === 0 && (
                        <CTableRow>
                          <CTableDataCell colSpan={6} className="text-center py-4">
                            Belum ada produk.
                          </CTableDataCell>
                        </CTableRow>
                      )}
                      {products.map((product) => (
                        <CTableRow key={product.id}>
                          <CTableDataCell
                            style={{ width: "4%", paddingLeft: "0.5rem", paddingRight: "0.5rem" }}
                          >
                            <CFormCheck
                              className="m-0"
                              checked={selectedProductIds.includes(product.id)}
                              onChange={() => toggleProductSelection(product.id)}
                              aria-label={`Pilih produk ${product.title}`}
                              style={{ borderColor: "#111827" }}
                            />
                          </CTableDataCell>
                          <CTableDataCell style={{ paddingLeft: "0.25rem" }}>
                            <div className="d-flex align-items-center gap-3">
                              <div
                                className="overflow-hidden rounded"
                                style={{
                                  width: 48,
                                  height: 48,
                                  backgroundColor: "#f1f5f9",
                                  flex: "0 0 48px",
                                }}
                              >
                                <img
                                  src={product.image_url || "/hero-team.svg"}
                                  alt={product.title || "Produk"}
                                  className="h-100 w-100 object-fit-cover"
                                />
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <div className="fw-semibold text-truncate">
                                  {product.title}
                                </div>
                              </div>
                            </div>
                          </CTableDataCell>
                          <CTableDataCell
                            className="text-body-secondary"
                            style={{ paddingLeft: "0.75rem" }}
                          >
                            <div
                              style={{
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                wordBreak: "break-word",
                              }}
                            >
                              {product.description?.trim() || "-"}
                            </div>
                          </CTableDataCell>
                          <CTableDataCell
                            className="text-start text-nowrap"
                            style={{ paddingLeft: "0.75rem" }}
                          >
                            {typeof product.stock === "number"
                              ? product.stock.toLocaleString("id-ID")
                              : "20"}
                          </CTableDataCell>
                          <CTableDataCell
                            className="text-start fw-semibold text-nowrap"
                            style={{ paddingLeft: "0.75rem" }}
                          >
                            {formatIdr(product.price_idr)}
                            {product.price_unit ? ` / ${product.price_unit}` : ""}
                          </CTableDataCell>
                          <CTableDataCell className="text-start" style={{ paddingLeft: "0.75rem" }}>
                            {canManageProducts ? (
                              <div className="d-flex justify-content-start flex-wrap gap-2">
                                <CButton
                                  size="sm"
                                  color="info"
                                  variant="outline"
                                  onClick={() => handleEditProduct(product)}
                                >
                                  Edit
                                </CButton>
                                <CButton
                                  size="sm"
                                  color="danger"
                                  variant="outline"
                                  onClick={() => {
                                    void handleDeleteProduct(product.id)
                                  }}
                                >
                                  Hapus
                                </CButton>
                              </div>
                            ) : (
                              <span className="text-body-secondary small">Read-only</span>
                            )}
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                )}
              </CCardBody>
            </CCard>
          )}
        </CContainer>
      </div>

      <CModal
        alignment="center"
        size="lg"
        scrollable
        visible={productFormOpen}
        onClose={closeProductForm}
      >
        <CModalHeader>
          <CModalTitle>
            {productForm.id ? "Edit Produk" : "Tambah Produk"}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {!canManageProducts && (
            <CAlert color="warning" className="mb-3">
              Role {admin.role} hanya dapat melihat data produk.
            </CAlert>
          )}
          <CForm onSubmit={handleSubmitProduct}>
            <div className="mb-3">
              <CFormLabel htmlFor="admin-product-title">Nama Produk</CFormLabel>
              <CFormInput
                id="admin-product-title"
                value={productForm.title}
                onChange={(event) =>
                  setProductForm((prev) => ({
                    ...prev,
                    title: event.target.value,
                  }))
                }
                placeholder="Masukkan nama produk"
                disabled={!canManageProducts}
              />
            </div>
            <div className="mb-3">
              <CFormLabel htmlFor="admin-product-price">Harga (IDR)</CFormLabel>
              <CFormInput
                id="admin-product-price"
                type="number"
                min={0}
                value={productForm.price_idr}
                onChange={(event) =>
                  setProductForm((prev) => ({
                    ...prev,
                    price_idr: event.target.value,
                  }))
                }
                disabled={!canManageProducts}
              />
            </div>
            <div className="mb-3">
              <CFormLabel htmlFor="admin-product-stock">Stock</CFormLabel>
              <CFormInput
                id="admin-product-stock"
                type="number"
                min={0}
                step={1}
                value={productForm.stock}
                onChange={(event) =>
                  setProductForm((prev) => ({
                    ...prev,
                    stock: event.target.value,
                  }))
                }
                placeholder="contoh: 20"
                disabled={!canManageProducts}
              />
            </div>
            <div className="mb-3">
              <CFormLabel htmlFor="admin-product-unit">Satuan Harga</CFormLabel>
              <CFormInput
                id="admin-product-unit"
                value={productForm.price_unit}
                onChange={(event) =>
                  setProductForm((prev) => ({
                    ...prev,
                    price_unit: event.target.value,
                  }))
                }
                placeholder="contoh: unit"
                disabled={!canManageProducts}
              />
            </div>
            <div className="mb-3">
              <CFormLabel htmlFor="admin-product-image">URL Gambar</CFormLabel>
              <CFormInput
                id="admin-product-image"
                value={productForm.image_url}
                onChange={(event) =>
                  setProductForm((prev) => ({
                    ...prev,
                    image_url: event.target.value,
                  }))
                }
                placeholder="https://..."
                disabled={!canManageProducts}
              />
            </div>
            <div className="mb-3">
              <CFormLabel htmlFor="admin-product-description">Deskripsi</CFormLabel>
              <CFormTextarea
                id="admin-product-description"
                rows={5}
                value={productForm.description}
                onChange={(event) =>
                  setProductForm((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                placeholder="Deskripsi produk"
                disabled={!canManageProducts}
              />
            </div>
            {canManageProducts ? (
              <div className="d-flex gap-2">
                <CButton type="submit" color="primary" disabled={productSubmitting}>
                  {productSubmitting
                    ? "Menyimpan..."
                    : productForm.id
                      ? "Simpan Perubahan"
                      : "Tambah Produk"}
                </CButton>
                <CButton
                  type="button"
                  color="secondary"
                  variant="outline"
                  onClick={closeProductForm}
                >
                  Batal
                </CButton>
              </div>
            ) : (
              <CButton
                type="button"
                color="secondary"
                variant="outline"
                onClick={closeProductForm}
              >
                Tutup
              </CButton>
            )}
          </CForm>
        </CModalBody>
      </CModal>

      <COffcanvas
        placement="end"
        visible={Boolean(shipmentOrderId)}
        onHide={() => setShipmentOrderId(null)}
      >
        <COffcanvasHeader>
          <COffcanvasTitle>Update Shipment</COffcanvasTitle>
        </COffcanvasHeader>
        <COffcanvasBody>
          <CForm onSubmit={handleSaveShipment}>
            <div className="mb-3">
              <CFormLabel htmlFor="admin-shipment-carrier">Carrier</CFormLabel>
              <CFormInput
                id="admin-shipment-carrier"
                value={shipmentForm.carrier}
                onChange={(event) =>
                  setShipmentForm((prev) => ({
                    ...prev,
                    carrier: event.target.value,
                  }))
                }
                placeholder="JNE / J&T / SiCepat"
              />
            </div>
            <div className="mb-3">
              <CFormLabel htmlFor="admin-shipment-resi">Nomor Resi</CFormLabel>
              <CFormInput
                id="admin-shipment-resi"
                value={shipmentForm.nomor_resi}
                onChange={(event) =>
                  setShipmentForm((prev) => ({
                    ...prev,
                    nomor_resi: event.target.value,
                  }))
                }
                placeholder="Masukkan nomor resi"
              />
            </div>
            <div className="mb-4">
              <CFormLabel htmlFor="admin-shipment-eta">ETA</CFormLabel>
              <CFormInput
                id="admin-shipment-eta"
                value={shipmentForm.eta}
                onChange={(event) =>
                  setShipmentForm((prev) => ({
                    ...prev,
                    eta: event.target.value,
                  }))
                }
                placeholder="Contoh: 2-3 hari"
              />
            </div>
            <CButton type="submit" color="primary" disabled={savingShipment}>
              {savingShipment ? "Menyimpan..." : "Simpan Shipment"}
            </CButton>
          </CForm>
        </COffcanvasBody>
      </COffcanvas>
    </div>
  )
}

export default Admin
