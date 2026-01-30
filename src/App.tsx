import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import Beranda from "@/pages/Beranda"
import Produk from "@/pages/Produk"
import Start from "@/pages/Start"
import Teknologi from "@/pages/Teknologi"

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/start" replace />} />
        <Route path="/start" element={<Start />} />
        <Route path="/beranda" element={<Beranda />} />
        <Route path="/teknologi" element={<Teknologi />} />
        <Route path="/produk" element={<Produk />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
