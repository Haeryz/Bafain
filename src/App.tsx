import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom"
import Beranda from "@/pages/Beranda"
import Produk from "@/pages/Produk"
import Start from "@/pages/Start"
import TentangKami from "@/pages/TentangKami"
import Teknologi from "@/pages/Teknologi"

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
        <Route path="/start" element={<Start />} />
        <Route path="/beranda" element={<Beranda />} />
        <Route path="/teknologi" element={<Teknologi />} />
        <Route path="/produk" element={<Produk />} />
        <Route path="/tentang-kami" element={<TentangKami />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
