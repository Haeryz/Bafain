import {
  Calendar,
  ClipboardList,
  MapPin,
  Package,
  Search,
  Truck,
} from "lucide-react"
import { useMemo, useState } from "react"
import PageLayout from "@/components/PageLayout"

const orders = [
  {
    id: "ORD-2024-1201",
    title: "Solar Dryer SD-500 - Kapasitas 500kg",
    date: "28 November 2024",
    status: "Sedang Diproses",
    statusTone: "bg-blue-100 text-blue-600",
    total: "Rp 45.000.000",
    qty: "1 Unit",
    address: "Jl. Industri No. 45, Surabaya, Jawa Timur",
    eta: "15 Desember 2024",
    progress: 40,
    waybill: "JNE1234567890",
    note: "Instalasi termasuk dalam paket",
  },
  {
    id: "ORD-2024-1150",
    title: "Solar Dryer SD-300 - Kapasitas 300kg",
    date: "15 November 2024",
    status: "Dalam Pengiriman",
    statusTone: "bg-purple-100 text-purple-600",
    total: "Rp 60.000.000",
    qty: "2 Unit",
    address: "Jl. Pelabuhan No. 12, Makassar, Sulawesi Selatan",
    eta: "5 Desember 2024",
    progress: 75,
    waybill: "JNE0987654321",
  },
  {
    id: "ORD-2024-1089",
    title: "Solar Dryer SD-1000 - Kapasitas 1000kg",
    date: "20 Oktober 2024",
    status: "Terkirim",
    statusTone: "bg-emerald-100 text-emerald-600",
    total: "Rp 75.000.000",
    qty: "1 Unit",
    address: "Jl. Raya Pantai No. 88, Lampung",
    eta: "10 November 2024",
    progress: 100,
    waybill: "JNE555666777",
  },
]

export function LacakPesanan() {
  const [activeTab, setActiveTab] = useState("Semua")

  const tabs = useMemo(() => {
    const statusCounts = orders.reduce<Record<string, number>>((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    }, {})
    return [
      { label: "Semua", count: orders.length },
      ...Object.entries(statusCounts).map(([label, count]) => ({
        label,
        count,
      })),
    ]
  }, [])

  const visibleOrders =
    activeTab === "Semua"
      ? orders
      : orders.filter((order) => order.status === activeTab)

  return (
    <PageLayout>
      <section className="mx-auto w-full max-w-6xl px-6 pb-20 pt-12 md:pt-16">
        <div>
          <p className="text-sm font-semibold text-slate-400">
            <a
              href="/profile"
              className="cursor-pointer text-slate-500 transition hover:text-blue-600"
            >
              Profil Saya
            </a>{" "}
            <span className="text-slate-400">/</span>{" "}
            <span className="text-blue-600">Lacak Pesanan</span>
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Pantau status dan pengiriman pesanan mesin pengering udang Anda
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nomor order atau nama produk..."
              className="w-full bg-transparent text-sm text-slate-700 outline-none"
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.label}
                type="button"
                onClick={() => setActiveTab(tab.label)}
                className={`cursor-pointer rounded-full border px-4 py-2 text-xs font-semibold transition ${
                  activeTab === tab.label
                    ? "border-blue-200 bg-blue-50 text-blue-600"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 space-y-6">
          {visibleOrders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Package className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-sm font-semibold text-slate-900">
                        {order.id}
                      </p>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${order.statusTone}`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-700">
                      {order.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{order.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Total Harga</p>
                  <p className="text-sm font-semibold text-blue-600">
                    {order.total}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 rounded-xl bg-slate-50 p-4 text-xs text-slate-600 md:grid-cols-3">
                <div className="flex items-start gap-2">
                  <ClipboardList className="mt-0.5 h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-slate-500">Jumlah</p>
                    <p className="font-semibold text-slate-900">{order.qty}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-slate-500">Alamat Pengiriman</p>
                    <p className="font-semibold text-slate-900">
                      {order.address}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="mt-0.5 h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-slate-500">Estimasi Pengiriman</p>
                    <p className="font-semibold text-slate-900">{order.eta}</p>
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Progress Pengiriman</span>
                  <span className="font-semibold text-blue-600">
                    {order.progress} %
                  </span>
                </div>
                <div className="mt-3 h-1.5 w-full rounded-full bg-slate-200">
                  <div
                    className="h-1.5 rounded-full bg-slate-900"
                    style={{ width: `${order.progress}%` }}
                  />
                </div>
              </div>

              <div className="mt-5 rounded-xl bg-blue-50 px-4 py-3 text-xs text-slate-600">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-slate-500">Nomor Resi</p>
                      <p className="font-semibold text-slate-900">
                        {order.waybill}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-semibold text-blue-600 transition hover:border-blue-300"
                  >
                    Lacak Paket
                  </button>
                </div>
              </div>

              {order.note && (
                <div className="mt-4 rounded-xl bg-orange-50 px-4 py-3 text-xs text-slate-600">
                  <p className="text-slate-500">Catatan</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {order.note}
                  </p>
                </div>
              )}

              <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-4 text-xs text-slate-600">
                <div>
                  <p className="text-slate-500">Status Pembayaran</p>
                  <p className="font-semibold text-emerald-600">Lunas</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {order.progress === 100 && (
                    <button
                      type="button"
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-300"
                    >
                      Download Invoice
                    </button>
                  )}
                  <button
                    type="button"
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-300"
                  >
                    Hubungi CS
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageLayout>
  )
}

export default LacakPesanan
