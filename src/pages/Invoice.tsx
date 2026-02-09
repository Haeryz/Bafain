import { useEffect, useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { getOrder, type OrderPayload } from "@/lib/ordersApi"
import { getProduct, type Product } from "@/lib/productsApi"

type InvoiceLine = {
  product_id: string
  qty: number
  product: Product | null
}

const formatIdr = (value: number) =>
  `Rp ${value.toLocaleString("id-ID")}`

const toDate = (value: unknown) => {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value === "string") {
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) return parsed
    return null
  }
  if (typeof value === "object" && value && "seconds" in value) {
    const seconds = (value as { seconds?: number }).seconds
    if (typeof seconds === "number") {
      return new Date(seconds * 1000)
    }
  }
  return null
}

const formatDateTime = (value: unknown) => {
  const date = toDate(value)
  if (!date) return "-"
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const displayValue = (value?: string) =>
  value && value.trim() ? value : "-"

export function Invoice() {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get("orderId")?.trim() || ""
  const [order, setOrder] = useState<OrderPayload | null>(null)
  const [lines, setLines] = useState<InvoiceLine[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true
    const loadInvoice = async () => {
      if (!orderId) {
        setError("Order ID tidak ditemukan.")
        setIsLoading(false)
        return
      }
      setIsLoading(true)
      setError(null)
      try {
        const response = await getOrder(orderId)
        if (!isActive) return
        const orderData = response.order
        setOrder(orderData)

        const rawItems = Array.isArray(orderData?.items)
          ? orderData.items
          : []
        const normalized = rawItems
          .map((item) => {
            const record =
              item && typeof item === "object"
                ? (item as Record<string, unknown>)
                : {}
            const productId =
              typeof record.product_id === "string"
                ? record.product_id
                : ""
            const qtyValue =
              typeof record.qty === "number"
                ? record.qty
                : Number(record.qty)
            const qty =
              Number.isFinite(qtyValue) && qtyValue > 0
                ? Math.floor(qtyValue)
                : 1
            return {
              product_id: productId,
              qty,
            }
          })
          .filter((item) => item.product_id)

        const enriched = await Promise.all(
          normalized.map(async (item) => {
            let product: Product | null = null
            try {
              product = await getProduct(item.product_id)
            } catch {
              product = null
            }
            return { ...item, product }
          })
        )
        if (!isActive) return
        setLines(enriched)
      } catch (err) {
        if (!isActive) return
        setError(
          err instanceof Error && err.message
            ? err.message
            : "Gagal memuat invoice."
        )
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    loadInvoice()
    return () => {
      isActive = false
    }
  }, [orderId])

  const address = useMemo(() => {
    const payload = (order?.address ?? {}) as Record<string, unknown>
    const metadata = (payload.metadata ?? {}) as Record<string, unknown>
    return {
      name: typeof payload.full_name === "string" ? payload.full_name : "",
      phone: typeof payload.phone === "string" ? payload.phone : "",
      email: typeof payload.email === "string" ? payload.email : "",
      addressLine:
        typeof payload.address_line1 === "string"
          ? payload.address_line1
          : "",
      city: typeof payload.city === "string" ? payload.city : "",
      province: typeof payload.province === "string" ? payload.province : "",
      postalCode:
        typeof payload.postal_code === "string"
          ? payload.postal_code
          : "",
      country: typeof payload.country === "string" ? payload.country : "",
      district:
        typeof metadata.district === "string" ? metadata.district : "",
      subdistrict:
        typeof metadata.subdistrict === "string" ? metadata.subdistrict : "",
      notes: typeof payload.notes === "string" ? payload.notes : "",
    }
  }, [order])

  const paymentLabel = useMemo(() => {
    const payload = (order?.payment_method ?? {}) as Record<string, unknown>
    if (typeof payload.label === "string") return payload.label
    if (typeof payload.id === "string") return payload.id
    return "-"
  }, [order])

  const shippingLabel = useMemo(() => {
    const payload = (order?.shipping_option ?? {}) as Record<string, unknown>
    if (typeof payload.name === "string") return payload.name
    if (typeof payload.title === "string") return payload.title
    return "-"
  }, [order])

  const computedSubtotal = useMemo(
    () =>
      lines.reduce((total, line) => {
        const price = line.product?.price_idr ?? 0
        return total + price * line.qty
      }, 0),
    [lines]
  )
  const subtotal =
    typeof order?.subtotal === "number" && order.subtotal > 0
      ? order.subtotal
      : computedSubtotal
  const shippingFee =
    typeof order?.shipping_fee === "number" ? order.shipping_fee : 0
  const totalBeforeTax =
    typeof order?.total === "number" && order.total > 0
      ? order.total
      : subtotal + shippingFee
  const taxRate = 0.11
  const taxAmount = Math.round(subtotal * taxRate)
  const grandTotal = totalBeforeTax + taxAmount

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100/70 px-6 py-12 font-['Manrope'] text-slate-900">
        <div className="mx-auto w-full max-w-4xl">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
            <p className="text-sm text-slate-500">Menyiapkan invoice...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100/70 px-6 py-12 font-['Manrope'] text-slate-900">
        <div className="mx-auto w-full max-w-3xl">
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 shadow-sm">
            <p className="text-sm font-semibold text-rose-700">{error}</p>
            <Link
              to="/pembayaran"
              className="mt-4 inline-flex text-xs font-semibold text-blue-600"
            >
              Kembali ke Pembayaran
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100/70 px-6 py-12 font-['Manrope'] text-slate-900 print:bg-white print:px-0 print:py-0">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500">
              Invoice
            </p>
            <h1 className="mt-1 font-['Sora'] text-2xl font-semibold text-slate-900">
              Invoice Pembayaran
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/pembayaran"
              className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-600"
            >
              Kembali
            </Link>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex cursor-pointer items-center rounded-full bg-blue-600 px-5 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
            >
              Download / Cetak
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white shadow-xl print:rounded-none print:border-0 print:shadow-none">
          <div className="border-b border-slate-200 px-8 py-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400">
                  Bafain Solar Dryer
                </p>
                <h2 className="mt-2 font-['Sora'] text-xl font-semibold text-slate-900">
                  Invoice #{orderId.slice(0, 10).toUpperCase()}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  No Order: {orderId || "-"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  ID Pesanan: {orderId || "-"}
                </p>
                <span className="mt-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-600">
                  Status: {order?.payment_status || "pending"}
                </span>
              </div>
              <div className="space-y-2 text-xs text-slate-500">
                <div className="flex items-center justify-between gap-4">
                  <span>Tanggal Pesanan</span>
                  <span className="font-semibold text-slate-900">
                    {formatDateTime(order?.created_at)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Jatuh Tempo</span>
                  <span className="font-semibold text-slate-900">
                    {formatDateTime(order?.expires_at)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Metode Pembayaran</span>
                  <span className="font-semibold text-slate-900">
                    {paymentLabel}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Pengiriman</span>
                  <span className="font-semibold text-slate-900">
                    {shippingLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 px-8 py-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-xs font-semibold text-slate-500">
                Informasi Pemesan
              </p>
              <div className="mt-3 space-y-1 text-xs text-slate-600">
                <p className="font-semibold text-slate-900">
                  {displayValue(address.name)}
                </p>
                <p>Email: {displayValue(address.email)}</p>
                <p>No Tlpn: {displayValue(address.phone)}</p>
                <p>Kota / Kabupaten: {displayValue(address.city)}</p>
                <p>Kecamatan: {displayValue(address.district)}</p>
                <p>Kelurahan / Desa: {displayValue(address.subdistrict)}</p>
                <p>Kode Pos: {displayValue(address.postalCode)}</p>
                <p>Provinsi: {displayValue(address.province)}</p>
                <p>Negara: {displayValue(address.country)}</p>
                <p>Detail Alamat: {displayValue(address.addressLine)}</p>
                {address.notes && (
                  <p className="text-[11px] text-slate-500">
                    Catatan: {address.notes}
                  </p>
                )}
                {order?.customer_note && (
                  <p className="text-[11px] text-slate-500">
                    Catatan Pesanan: {order.customer_note}
                  </p>
                )}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
              <p className="text-xs font-semibold text-slate-500">
                Ringkasan Pembayaran
              </p>
              <div className="mt-3 space-y-2 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">
                    {formatIdr(subtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Pengiriman</span>
                  <span className="font-semibold text-slate-900">
                    {formatIdr(shippingFee)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Pajak (PPN 11% - Estimasi)</span>
                  <span className="font-semibold text-slate-900">
                    {formatIdr(taxAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-sm font-semibold">
                  <span>Total Tagihan</span>
                  <span className="text-orange-500">
                    {formatIdr(grandTotal)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="px-8 pb-8">
            <p className="text-xs font-semibold text-slate-600">
              Detail Produk
            </p>
            <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200">
              <div className="grid grid-cols-[1.4fr_0.4fr_0.6fr] gap-4 bg-slate-50 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                <span>Produk</span>
                <span>Qty</span>
                <span className="text-right">Total</span>
              </div>
              <div className="divide-y divide-slate-200">
                {lines.length === 0 && (
                  <div className="px-4 py-4 text-xs text-slate-500">
                    Produk tidak tersedia.
                  </div>
                )}
                {lines.map((line) => (
                  <div
                    key={`${line.product_id}-${line.qty}`}
                    className="grid grid-cols-[1.4fr_0.4fr_0.6fr] gap-4 px-4 py-4 text-sm text-slate-700"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">
                        {line.product?.title || "Produk"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Harga satuan:{" "}
                        {formatIdr(line.product?.price_idr ?? 0)}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">
                      {line.qty}
                    </span>
                    <span className="text-right text-sm font-semibold text-slate-900">
                      {formatIdr(
                        (line.product?.price_idr ?? 0) * line.qty
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-4 text-[11px] text-slate-400">
              Pajak bersifat estimasi dan dapat berubah sesuai kebijakan
              pemerintah. Nilai akhir mengikuti invoice resmi.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Invoice
