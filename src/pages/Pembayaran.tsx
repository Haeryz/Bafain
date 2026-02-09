import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import PageLayout from "@/components/PageLayout"
import { useCartStore } from "@/stores/cart/useCartStore"
import { useCheckoutStore } from "@/stores/checkout/useCheckoutStore"

const paymentSteps = [
  {
    title: "Transfer Melalui ATM",
    description:
      "Masukkan kartu ATM dan PIN, pilih menu transfer, lalu masukkan nomor Virtual Account.",
  },
  {
    title: "Transfer Melalui Internet Banking",
    description:
      "Login ke internet banking, pilih menu transfer Virtual Account, lalu masukkan nomor VA.",
  },
  {
    title: "Transfer Melalui Mobile Banking",
    description:
      "Buka aplikasi mobile banking, pilih transfer VA, lalu masukkan nomor Virtual Account.",
  },
]

const TAX_RATE = 0.11

const calculateTaxAmount = (baseTotal: number) =>
  Math.round(baseTotal * TAX_RATE)

export function Pembayaran() {
  const navigate = useNavigate()
  const [showCopied, setShowCopied] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const { items, subtotal, isLoading, error, loadCart } = useCartStore()
  const {
    customer,
    paymentMethod,
    summary,
    orderId,
    paymentDeadline,
    isLoading: isCheckoutLoading,
    error: checkoutError,
    loadOrder,
    checkPaymentStatus,
    clearOrder,
  } = useCheckoutStore()
  const selectedPaymentId = paymentMethod.id
  const selectedPaymentLabel = paymentMethod.label
  const selectedShippingLabel =
    window.localStorage.getItem("bafain:shippingLabel") || "Pengiriman Standar"
  const selectedShippingDetail =
    window.localStorage.getItem("bafain:shippingDetail") || "3 - 5 hari kerja"
  const selectedExpeditionLabel =
    window.localStorage.getItem("bafain:expeditionLabel") || "JNE"
  const selectedPackagingLabel =
    window.localStorage.getItem("bafain:packagingLabel") || "Regular"
  const selectedShippingPrice =
    summary?.shipping_fee ??
    Number(window.localStorage.getItem("bafain:shippingPrice") || "50000")

  const paymentCodeMap: Record<string, string> = {
    bca: "BCA",
    mandiri: "Mandiri",
    bri: "BRI",
    bni: "BNI",
    jatim: "Jatim",
    bsi: "BSI",
    jateng: "Jateng",
    jago: "Jago",
    "jago-syariah": "Jago Syariah",
    seabank: "Seabank",
    dana: "DANA",
    "bca-syariah": "BCA Syariah",
  }

  const vaNumberMap: Record<string, string> = {
    bca: "6 8001 08214456789",
    mandiri: "8890 0001 234567890",
    bri: "8810 0022 334455667",
    bni: "9880 1133 44556677",
    jatim: "8201 4455 66778899",
    bsi: "4050 7788 99001122",
    jateng: "8640 2233 44556677",
    jago: "9001 7788 99001122",
    "jago-syariah": "9002 8899 00112233",
    seabank: "9021 6677 88990011",
    dana: "0857 1234 5678",
    "bca-syariah": "2050 9911 22334455",
  }

  const paymentCode = paymentCodeMap[selectedPaymentId] || "BCA"
  const vaNumber = vaNumberMap[selectedPaymentId] || "6 8001 08214456789"

  useEffect(() => {
    loadCart()
  }, [loadCart])

  useEffect(() => {
    if (orderId) {
      loadOrder(orderId)
    }
  }, [orderId, loadOrder])

  useEffect(() => {
    if (!paymentDeadline) return
    const interval = window.setInterval(() => {
      setNow(Date.now())
    }, 1000)
    return () => window.clearInterval(interval)
  }, [paymentDeadline])

  useEffect(() => {
    if (!showCopied) return
    const timeout = window.setTimeout(() => setShowCopied(false), 2500)
    return () => window.clearTimeout(timeout)
  }, [showCopied])

  const cartSummaryItems = useMemo(
    () =>
      items.map((item) => ({
        id: item.id,
        title: item.product?.title || "Produk",
        qty: item.qty,
        image_url: item.product?.image_url || "/hero-team.svg",
        price_idr: item.product?.price_idr ?? 0,
      })),
    [items]
  )

  const fallbackItems = [
    {
      id: "fallback-item",
      title: "Solar Dryer",
      qty: 1,
      image_url: "/hero-team.svg",
      price_idr: 500000,
    },
  ]

  const summaryItems =
    cartSummaryItems.length > 0 ? cartSummaryItems : fallbackItems
  const cartSubtotal =
    cartSummaryItems.length > 0 ? subtotal : fallbackItems[0].price_idr
  const subtotalCost = summary?.subtotal ?? cartSubtotal
  const shippingFee = summary?.shipping_fee ?? selectedShippingPrice
  const preTaxTotal = subtotalCost + shippingFee
  const taxAmount = summary?.tax_amount ?? calculateTaxAmount(preTaxTotal)
  const totalCost = summary?.total ?? preTaxTotal + taxAmount

  const formatIdr = (value: number) =>
    `Rp ${value.toLocaleString("id-ID")}`

  const addressSummary = (() => {
    const parts = [
      customer.address,
      customer.subdistrict && `Subdistrict ${customer.subdistrict}`,
      customer.district && `District ${customer.district}`,
      customer.city,
      customer.province,
      customer.postal_code,
      customer.country,
    ].filter(Boolean)
    if (parts.length > 0) return parts.join(", ")
    return "Jl. Merdeka No. 10, Jakarta Pusat, DKI Jakarta, 10110"
  })()

  const handleCopyVa = async () => {
    try {
      await navigator.clipboard.writeText(vaNumber.replace(/\s/g, ""))
    } catch {
      const input = document.createElement("input")
      input.value = vaNumber.replace(/\s/g, "")
      document.body.appendChild(input)
      input.select()
      document.execCommand("copy")
      document.body.removeChild(input)
    }
    setShowCopied(true)
  }

  const handleCheckPayment = async () => {
    if (isExpired) {
      return
    }
    const paid = await checkPaymentStatus()
    if (paid) {
      setShowSuccess(true)
    }
  }

  const handleRecheckout = () => {
    clearOrder()
    navigate("/pemesanan")
  }

  const formatCountdown = (value: number | null) => {
    if (value === null) return "-"
    const totalSeconds = Math.ceil(value / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    const pad = (num: number) => String(num).padStart(2, "0")
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  }

  const deadlineLabel = paymentDeadline
    ? new Date(paymentDeadline).toLocaleString("id-ID", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      })
    : "24 jam sejak pemesanan"

  const remainingMs = useMemo(() => {
    if (!paymentDeadline) return null
    const deadlineMs = Date.parse(paymentDeadline)
    if (Number.isNaN(deadlineMs)) return null
    return Math.max(0, deadlineMs - now)
  }, [paymentDeadline, now])

  const isExpired = remainingMs !== null && remainingMs <= 0

  return (
    <PageLayout>
      {showSuccess && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/40 px-6">
          <button
            type="button"
            aria-label="Tutup"
            className="absolute inset-0 h-full w-full cursor-pointer"
            onClick={() => setShowSuccess(false)}
          />
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <span className="text-2xl font-bold text-emerald-600">✓</span>
            </div>
            <h3 className="mt-4 font-['Sora'] text-2xl font-semibold text-slate-900">
              Pembayaran Telah Berhasil
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Terima kasih atas pembelian Anda. Kami telah menerima pesanan Anda
              dan akan segera memprosesnya.
            </p>
          </div>
        </div>
      )}
      <section className="mx-auto w-full max-w-6xl px-6 pb-20 pt-12 md:pt-16">
        <div>
          <Link
            to="/pemesanan"
            className="mb-4 inline-flex items-center gap-2 text-xs font-semibold text-slate-600 transition hover:text-blue-600"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Kembali ke Pemesanan
          </Link>
          <p className="text-sm font-semibold text-slate-400">
            <a
              href="/pemesanan"
              className="cursor-pointer text-slate-400 transition hover:text-blue-600"
            >
              Pemesanan
            </a>{" "}
            <span className="text-slate-400">/</span>{" "}
            <span className="text-blue-600">Pembayaran</span>
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Pantau status dan pengiriman pesanan mesin pengering udang Anda
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.7fr)]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <h2 className="font-['Sora'] text-lg font-semibold text-slate-900">
                Intruksi Pembayaran
              </h2>
              <span className="rounded-full bg-slate-100 px-4 py-2 text-xs text-slate-600">
                Selesaikan Sebelum
                <span className="mt-1 block text-sm font-semibold text-slate-900">
                  {deadlineLabel}
                </span>
                <span className="mt-1 block text-[11px] font-semibold text-slate-500">
                  Sisa waktu: {formatCountdown(remainingMs)}
                </span>
              </span>
            </div>

            <div className="mt-6 space-y-4 text-sm text-slate-700">
              <p className="text-xs font-semibold text-slate-500">
                Lakukan Transfer ke
              </p>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <span className="text-xs font-semibold text-blue-600">
                  {paymentCode}
                </span>
                <span>{selectedPaymentLabel}</span>
              </div>
              <div className="relative flex items-center justify-between rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-slate-900">
                <span>{vaNumber}</span>
                <button
                  type="button"
                  onClick={handleCopyVa}
                  className="cursor-pointer text-xs font-semibold text-blue-600"
                >
                  Salin
                </button>
                {showCopied && (
                  <div className="absolute -top-10 right-0 rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-white shadow-lg">
                    Nomor Virtual Account berhasil di salin
                  </div>
                )}
              </div>

              <div className="pt-2">
                <p className="text-xs font-semibold text-slate-500">
                  Total Pembayaran
                </p>
                <div className="mt-2 rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-slate-900">
                  {formatIdr(totalCost)}
                </div>
              </div>

              <div
                className={`flex items-start gap-2 rounded-xl px-4 py-3 text-xs ${
                  isExpired
                    ? "bg-rose-50 text-rose-700"
                    : "bg-red-50 text-red-600"
                }`}
              >
                <span className="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full border border-current">
                  !
                </span>
                <p>
                  {isExpired
                    ? "Waktu pembayaran sudah habis. Silakan checkout ulang."
                    : "Selesaikan pembayaran ini sebelum melewati batas pembayaran."}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-xs font-semibold text-slate-600">
                Cara Membayar
              </p>
              <div className="mt-3 space-y-2">
                {paymentSteps.map((step) => (
                  <details
                    key={step.title}
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700"
                  >
                    <summary className="cursor-pointer font-medium text-slate-900">
                      {step.title}
                    </summary>
                    <p className="mt-2 text-xs text-slate-500">
                      {step.description}
                    </p>
                  </details>
                ))}
              </div>
            </div>

            <p className="mt-6 text-xs text-slate-400">
              hanya klik tombol dibawah saat sudah melakukan pembayaran
            </p>
            <button
              type="button"
              onClick={handleCheckPayment}
              disabled={isCheckoutLoading || isExpired}
              className="mt-3 w-full cursor-pointer rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-600 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-70"
            >
              Cek Status Pembayaran
            </button>
            {isExpired && (
              <button
                type="button"
                onClick={handleRecheckout}
                className="mt-3 w-full cursor-pointer rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Checkout Ulang
              </button>
            )}
          </div>

          <div className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-['Sora'] text-lg font-semibold text-slate-900">
              Detail Pemesanan
            </h2>
            <div className="mt-4 rounded-xl bg-blue-50 px-4 py-3 text-xs text-slate-700">
              <div className="flex items-center justify-between">
                <span>ID Pesanan:</span>
                <span className="font-semibold text-slate-900">
                  {orderId || "ORD-20250911-001"}
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {isLoading && (
                <p className="text-xs text-slate-400">Memuat keranjang...</p>
              )}
              {error && <p className="text-xs text-red-500">{error}</p>}
              {checkoutError && (
                <p className="text-xs text-red-500">{checkoutError}</p>
              )}
              {summaryItems.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="h-12 w-12 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-500">Qty: {item.qty}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-1 text-xs text-slate-600">
              <p>Nama : {customer.full_name || "John Doe"}</p>
              <p>No Tlpn : {customer.phone || "+62 812 3456 7890"}</p>
              <p>Email : {customer.email || "john.doe@example.com"}</p>
              <p>
                Alamat : {addressSummary}
              </p>
              {customer.notes && <p>Catatan : {customer.notes}</p>}
              <p>
                Pengiriman : {selectedShippingDetail} ({selectedShippingLabel})
              </p>
              <p>Ekspedisi : {selectedExpeditionLabel}</p>
              <p>Packaging : {selectedPackagingLabel}</p>
            </div>

            <div className="mt-4 border-t border-slate-200 pt-4">
              <div className="space-y-2 text-sm text-slate-700">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">
                    {formatIdr(subtotalCost)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Pengiriman</span>
                  <span className="font-semibold text-slate-900">
                    {formatIdr(shippingFee)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span>Pajak 11%</span>
                  <span className="font-semibold text-slate-900">
                    {formatIdr(taxAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span>Total Pembayaran</span>
                  <span className="text-base font-semibold text-orange-500">
                    {formatIdr(totalCost)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  )
}

export default Pembayaran
