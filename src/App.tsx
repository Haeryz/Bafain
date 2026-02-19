import { Suspense, lazy, useEffect } from "react"
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom"
import Beranda from "@/pages/Beranda"
import Pemesanan from "@/pages/Pemesanan"
import Pembayaran from "@/pages/Pembayaran"
import Profile from "@/pages/Profile"
import LacakPesanan from "@/pages/LacakPesanan"
import Produk from "@/pages/Produk"
import Start from "@/pages/Start"
import TentangKami from "@/pages/TentangKami"
import Teknologi from "@/pages/Teknologi"
import Invoice from "@/pages/Invoice"
import RequireAuth from "@/components/RequireAuth"
import RequireGuest from "@/components/RequireGuest"
const Admin = lazy(() => import("@/pages/Admin"))

function ScrollToTop() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" })
  }, [location.pathname])

  return null
}

export function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Navigate to="/beranda" replace />} />
        <Route
          path="/start"
          element={
            <RequireGuest>
              <Start />
            </RequireGuest>
          }
        />
        <Route path="/beranda" element={<Beranda />} />
        <Route path="/teknologi" element={<Teknologi />} />
        <Route path="/produk" element={<Produk />} />
        <Route path="/produk/:productId" element={<Produk />} />
        <Route
          path="/pemesanan"
          element={
            <RequireAuth>
              <Pemesanan />
            </RequireAuth>
          }
        />
        <Route
          path="/pembayaran"
          element={
            <RequireAuth>
              <Pembayaran />
            </RequireAuth>
          }
        />
        <Route
          path="/invoice"
          element={
            <RequireAuth>
              <Invoice />
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />
        <Route
          path="/lacak-pesanan"
          element={
            <RequireAuth>
              <LacakPesanan />
            </RequireAuth>
          }
        />
        <Route path="/tentang-kami" element={<TentangKami />} />
        <Route
          path="/admin"
          element={
            <Suspense
              fallback={
                <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-600">
                  Memuat admin panel...
                </div>
              }
            >
              <Admin />
            </Suspense>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
