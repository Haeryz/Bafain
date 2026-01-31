import { useState } from "react"
import PageLayout from "@/components/PageLayout"
import { Link } from "react-router-dom"

const shippingOptions = [
  {
    id: "standar",
    title: "Pengiriman Standar",
    detail: "3 - 5 hari kerja",
    price: "Rp 50.000",
  },
  {
    id: "ekspres",
    title: "Pengiriman Ekspres",
    detail: "1 - 2 hari kerja",
    price: "Rp 150.000",
  },
  {
    id: "premium",
    title: "Pengiriman Premium",
    detail: "Pengiriman hari berikutnya",
    price: "Rp 150.000",
  },
]

const paymentMethods = [
  { id: "bca", label: "BCA Virtual Account" },
  { id: "mandiri", label: "Mandiri Virtual Account" },
  { id: "bri", label: "BRI Virtual Account" },
  { id: "bni", label: "BNI Virtual Account" },
  { id: "jatim", label: "Jatim Virtual Account" },
  { id: "bsi", label: "BSI Virtual Account" },
]

export function Pemesanan() {
  const [selectedShipping, setSelectedShipping] = useState("standar")
  const [selectedPayment, setSelectedPayment] = useState("bca")
  const [showAllPayments, setShowAllPayments] = useState(false)

  return (
    <PageLayout>
      <section className="mx-auto w-full max-w-6xl px-6 pb-20 pt-12 md:pt-16">
        <div>
          <p className="text-sm font-semibold text-blue-600">Pemesanan</p>
          <p className="mt-2 text-sm text-slate-500">
            Pantau status dan pengiriman pesanan mesin pengering udang Anda
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.7fr)]">
          <div className="space-y-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-['Sora'] text-lg font-semibold text-slate-900">
                Informasi Pemesan
              </h2>

              <div className="mt-6 space-y-4 text-sm text-slate-600">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-600">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600">
                      No Telepon
                    </label>
                    <input
                      type="tel"
                      placeholder="+62 812 3456 7890"
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="john.doe@example.com"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600">
                    Alamat
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Jl. Merdeka No. 10, Jakarta Pusat, DKI Jakarta, 10110"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-600">
                      Kota
                    </label>
                    <input
                      type="text"
                      placeholder="Jakarta"
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600">
                      Code Pos
                    </label>
                    <input
                      type="text"
                      placeholder="10110"
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600">
                    Provinsi
                  </label>
                  <input
                    type="text"
                    placeholder="DKI Jakarta"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-['Sora'] text-lg font-semibold text-slate-900">
                Opsi Pengiriman
              </h2>
              <div className="mt-6 space-y-4 text-sm text-slate-700">
                {shippingOptions.map((option) => {
                  const isActive = selectedShipping === option.id
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setSelectedShipping(option.id)}
                      className={`flex w-full cursor-pointer items-center justify-between rounded-xl border px-4 py-4 text-left transition ${
                        isActive
                          ? "border-blue-500 bg-blue-50/40"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                            isActive
                              ? "border-blue-500 bg-blue-500"
                              : "border-slate-300"
                          }`}
                        >
                          {isActive && (
                            <span className="h-1.5 w-1.5 rounded-full bg-white" />
                          )}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {option.title}
                          </p>
                          <p className="text-xs text-slate-500">
                            {option.detail}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">
                        {option.price}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="font-['Sora'] text-lg font-semibold text-slate-900">
                  Metode Pembayaran
                </h2>
                <button
                  type="button"
                  onClick={() => setShowAllPayments((prev) => !prev)}
                  className="cursor-pointer text-xs font-semibold text-blue-600"
                >
                  Lihat Semua
                </button>
              </div>
              <div className="mt-6 space-y-4 text-sm text-slate-700">
                {(showAllPayments
                  ? [
                      ...paymentMethods,
                      { id: "jateng", label: "Jateng Virtual Account" },
                      { id: "jago", label: "Jago Virtual Account" },
                      { id: "jago-syariah", label: "Jago Syariah Virtual Account" },
                      { id: "seabank", label: "Seabank Virtual Account" },
                      { id: "dana", label: "DANA" },
                      { id: "bca-syariah", label: "BCA Syariah Virtual Account" },
                    ]
                  : paymentMethods
                ).map((method) => {
                  const isActive = selectedPayment === method.id
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedPayment(method.id)}
                      className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border px-4 py-4 text-left transition ${
                        isActive
                          ? "border-blue-500 bg-blue-50/40"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                          isActive
                            ? "border-blue-500 bg-blue-500"
                            : "border-slate-300"
                        }`}
                      >
                        {isActive && (
                          <span className="h-1.5 w-1.5 rounded-full bg-white" />
                        )}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-blue-600">
                          {method.id.toUpperCase()}
                        </span>
                        <span className="text-sm font-medium text-slate-700">
                          {method.label}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-['Sora'] text-lg font-semibold text-slate-900">
              Ringkasan Pesanan
            </h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <span>Solar Dryer</span>
                <span className="font-semibold text-slate-900">Rp 500.000</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">Rp 500.000</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <span>Pengiriman</span>
                <span className="font-semibold text-slate-900">Rp 50.000</span>
              </div>
              <div className="flex items-center justify-between pt-2 text-base font-semibold text-slate-900">
                <span>Total</span>
                <span className="text-orange-500">Rp 550.000</span>
              </div>
            </div>
            <Link
              to="/pembayaran"
              className="mt-6 inline-flex w-full cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Bayar Sekarang
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  )
}

export default Pemesanan
