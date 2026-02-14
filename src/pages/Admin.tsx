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
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CHeader,
  CHeaderBrand,
  CHeaderNav,
  CNavItem,
  CNavLink,
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
  cilCog,
  cilListRich,
  cilReload,
  cilShieldAlt,
  cilSpeedometer,
  cilTruck,
} from "@coreui/icons"
import { CChartBar } from "@coreui/react-chartjs"
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

const getSidebarNavItemStyle = (active: boolean): CSSProperties => ({
  borderRadius: 14,
  padding: "0.75rem 0.9rem",
  border: active
    ? "1px solid rgba(56, 189, 248, 0.45)"
    : "1px solid rgba(148, 163, 184, 0.2)",
  background: active
    ? "linear-gradient(135deg, rgba(37, 99, 235, 0.35), rgba(14, 165, 233, 0.22))"
    : "rgba(255, 255, 255, 0.04)",
  color: "#e2e8f0",
  fontWeight: 600,
})

const defaultProductForm: ProductFormState = {
  id: null,
  title: "",
  price_idr: "",
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
  const [sidebarVisible, setSidebarVisible] = useState(true)
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
  const [productForm, setProductForm] = useState<ProductFormState>(
    defaultProductForm
  )
  const [productSubmitting, setProductSubmitting] = useState(false)

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
      price_unit: product.price_unit || "",
      description: product.description || "",
      image_url: product.image_url || "",
    })
    setActivePanel("products")
  }

  const handleSubmitProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canManageProducts) return

    const title = productForm.title.trim()
    const priceValue = Number(productForm.price_idr)
    if (!title) {
      setFeedback({ color: "warning", message: "Nama produk wajib diisi." })
      return
    }
    if (!Number.isFinite(priceValue) || priceValue < 0) {
      setFeedback({ color: "warning", message: "Harga produk tidak valid." })
      return
    }

    setProductSubmitting(true)
    setFeedback(null)
    try {
      const payload = {
        title,
        price_idr: Math.round(priceValue),
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

  const statusChartLabels = dashboard?.orders_by_status.map((x) => x.status) || []
  const statusChartData = dashboard?.orders_by_status.map((x) => x.count) || []

  if (authChecking) {
    return (
      <div
        className="d-flex min-vh-100 align-items-center justify-content-center"
        style={{ background: "linear-gradient(140deg, #0f172a, #1e293b)" }}
      >
        <div className="text-center text-white">
          <CSpinner color="light" />
          <p className="mt-3 mb-0">Memeriksa akses admin...</p>
        </div>
      </div>
    )
  }

  if (!admin) {
    return (
      <div
        className="d-flex min-vh-100 align-items-center"
        style={{ background: "linear-gradient(140deg, #0b1020, #111827)" }}
      >
        <CContainer>
          <CRow className="justify-content-center">
            <CCol md={7} lg={5}>
              <CCard
                className="border-0 shadow-lg"
                style={{ background: "rgba(15, 23, 42, 0.92)", color: "#e2e8f0" }}
              >
                <CCardBody className="p-4 p-lg-5">
                  <div className="mb-4">
                    <h2 className="h4 mb-1 text-white">Admin System</h2>
                    <p className="mb-0 text-body-secondary">
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
                      />
                    </div>
                    <CButton
                      type="submit"
                      color="primary"
                      className="w-100"
                      disabled={loginSubmitting}
                    >
                      {loginSubmitting ? "Memproses..." : "Login Admin"}
                    </CButton>
                  </CForm>
                  <div className="mt-4 d-flex justify-content-between small">
                    <Link to="/beranda" className="text-info text-decoration-none">
                      Kembali ke beranda
                    </Link>
                    {isLoggedIn && (
                      <button
                        type="button"
                        onClick={logout}
                        className="btn btn-link p-0 text-warning text-decoration-none"
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
    <div className="min-vh-100" style={{ backgroundColor: "#f4f6fb" }}>
      {sidebarVisible && (
        <CSidebar
          colorScheme="dark"
          className="border-0 d-flex flex-column"
          style={{
            width: SIDEBAR_WIDTH,
            position: "fixed",
            top: 0,
            left: 0,
            bottom: 0,
            height: "100vh",
            overflowY: "auto",
            zIndex: 1030,
            background: "linear-gradient(180deg, #0b1736, #0f244f 38%, #07142c)",
            padding: "0.85rem 0.7rem 0.8rem",
            boxShadow: "8px 0 30px rgba(2, 6, 23, 0.25)",
          }}
        >
          <CSidebarHeader className="border-0 p-2 pb-3">
            <CSidebarBrand
              className="m-0 d-flex align-items-center fw-semibold text-white rounded-4"
              style={{
                padding: "0.85rem 0.95rem",
                border: "1px solid rgba(148, 163, 184, 0.24)",
                background: "rgba(255, 255, 255, 0.04)",
              }}
            >
              <CIcon icon={cilShieldAlt} className="me-2" />
              Bafain Admin
            </CSidebarBrand>
          </CSidebarHeader>
          <div className="px-2">
            <div
              className="small text-uppercase fw-semibold mb-2"
              style={{ color: "rgba(226, 232, 240, 0.65)", paddingLeft: "0.5rem" }}
            >
              Navigation
            </div>
            <div className="d-grid gap-2">
              <CNavLink
                href="#"
                active={activePanel === "dashboard"}
                className="d-flex align-items-center"
                style={getSidebarNavItemStyle(activePanel === "dashboard")}
                onClick={(event) => {
                  event.preventDefault()
                  setActivePanel("dashboard")
                }}
              >
                <CIcon icon={cilSpeedometer} className="me-2" />
                Dashboard
              </CNavLink>
              <CNavLink
                href="#"
                active={activePanel === "orders"}
                className="d-flex align-items-center"
                style={getSidebarNavItemStyle(activePanel === "orders")}
                onClick={(event) => {
                  event.preventDefault()
                  setActivePanel("orders")
                }}
              >
                <CIcon icon={cilListRich} className="me-2" />
                Orders
              </CNavLink>
              <CNavLink
                href="#"
                active={activePanel === "products"}
                className="d-flex align-items-center"
                style={getSidebarNavItemStyle(activePanel === "products")}
                onClick={(event) => {
                  event.preventDefault()
                  setActivePanel("products")
                }}
              >
                <CIcon icon={cilBasket} className="me-2" />
                Products
              </CNavLink>
            </div>
          </div>
          <div className="mt-auto p-2 pt-3 text-white small">
            <div
              className="rounded-4"
              style={{
                border: "1px solid rgba(148, 163, 184, 0.24)",
                background: "rgba(255, 255, 255, 0.05)",
                padding: "0.85rem 0.9rem",
              }}
            >
              <div className="mb-2 fw-semibold">Signed in</div>
              <div className="text-truncate">{admin.email || admin.uid}</div>
              <CBadge color="info" className="mt-2">
                role: {admin.role}
              </CBadge>
            </div>
          </div>
        </CSidebar>
      )}

      <div
        className="d-flex min-vh-100 flex-column"
        style={{
          marginLeft: sidebarVisible ? SIDEBAR_WIDTH : 0,
          transition: "margin-left 0.2s ease",
        }}
      >
        <CHeader
          className="bg-white border-bottom px-3 py-2 shadow-sm"
          style={{ position: "sticky", top: 0, zIndex: 1020 }}
        >
          <CHeaderBrand className="fw-semibold">
            <CIcon icon={cilCog} className="me-2 text-primary" />
            Admin Control Center
          </CHeaderBrand>
          <CHeaderNav className="ms-auto d-flex align-items-center">
            <CNavItem>
              <CButton
                color="light"
                variant="outline"
                className="me-2"
                onClick={() => setSidebarVisible((prev) => !prev)}
              >
                {sidebarVisible ? "Hide Sidebar" : "Show Sidebar"}
              </CButton>
            </CNavItem>
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
              <Link to="/beranda" className="btn btn-outline-secondary me-2">
                Beranda
              </Link>
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
                                backgroundColor: "#4f46e5",
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
            <CRow className="g-3">
              <CCol xl={4}>
                <CCard className="border-0 shadow-sm">
                  <CCardHeader className="bg-white fw-semibold">
                    {productForm.id ? "Edit Produk" : "Tambah Produk"}
                  </CCardHeader>
                  <CCardBody>
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
                      {canManageProducts && (
                        <div className="d-flex gap-2">
                          <CButton type="submit" color="primary" disabled={productSubmitting}>
                            {productSubmitting
                              ? "Menyimpan..."
                              : productForm.id
                                ? "Simpan Perubahan"
                                : "Tambah Produk"}
                          </CButton>
                          {productForm.id && (
                            <CButton
                              type="button"
                              color="secondary"
                              variant="outline"
                              onClick={() => setProductForm(defaultProductForm)}
                            >
                              Batal
                            </CButton>
                          )}
                        </div>
                      )}
                    </CForm>
                  </CCardBody>
                </CCard>
              </CCol>

              <CCol xl={8}>
                <CCard className="border-0 shadow-sm">
                  <CCardHeader className="bg-white fw-semibold">Daftar Produk</CCardHeader>
                  <CCardBody>
                    {productsError && <CAlert color="danger">{productsError}</CAlert>}
                    {productsLoading ? (
                      <div className="text-center py-5">
                        <CSpinner />
                      </div>
                    ) : (
                      <CTable responsive hover align="middle">
                        <CTableHead>
                          <CTableRow>
                            <CTableHeaderCell>Produk</CTableHeaderCell>
                            <CTableHeaderCell>Harga</CTableHeaderCell>
                            <CTableHeaderCell style={{ minWidth: 230 }}>
                              Aksi
                            </CTableHeaderCell>
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          {products.length === 0 && (
                            <CTableRow>
                              <CTableDataCell colSpan={3} className="text-center py-4">
                                Belum ada produk.
                              </CTableDataCell>
                            </CTableRow>
                          )}
                          {products.map((product) => (
                            <CTableRow key={product.id}>
                              <CTableDataCell>
                                <div className="fw-semibold">{product.title}</div>
                                <div className="text-body-secondary small text-truncate">
                                  {product.description || "-"}
                                </div>
                              </CTableDataCell>
                              <CTableDataCell>
                                {formatIdr(product.price_idr)}{" "}
                                {product.price_unit ? `/${product.price_unit}` : ""}
                              </CTableDataCell>
                              <CTableDataCell>
                                <div className="d-flex gap-2">
                                  <CButton
                                    size="sm"
                                    color="info"
                                    variant="outline"
                                    onClick={() => handleEditProduct(product)}
                                  >
                                    Edit
                                  </CButton>
                                  {canManageProducts && (
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
                                  )}
                                </div>
                              </CTableDataCell>
                            </CTableRow>
                          ))}
                        </CTableBody>
                      </CTable>
                    )}
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>
          )}
        </CContainer>
      </div>

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
