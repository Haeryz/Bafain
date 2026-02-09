import { useEffect, useMemo, useState } from "react"
import PageLayout from "@/components/PageLayout"
import { useNavigate } from "react-router-dom"
import { useCartStore } from "@/stores/cart/useCartStore"
import { useCheckoutStore } from "@/stores/checkout/useCheckoutStore"
import { useAuthStore } from "@/stores/auth/useAuthStore"
import { useProfileStore } from "@/stores/profile/useProfileStore"
import {
  fetchCountryOptions,
  getCountryOptions,
  type CountryOption,
} from "@/lib/countries"

const paymentMethods = [
  { id: "bca", label: "BCA Virtual Account" },
  { id: "mandiri", label: "Mandiri Virtual Account" },
  { id: "bri", label: "BRI Virtual Account" },
  { id: "bni", label: "BNI Virtual Account" },
  { id: "jatim", label: "Jatim Virtual Account" },
  { id: "bsi", label: "BSI Virtual Account" },
]

const fallbackSummaryItems = [
  { id: "fallback-item", title: "Solar Dryer", qty: 1, price_idr: 500000 },
]

const fallbackSubtotal = 500000

const formatIdr = (value: number) =>
  `Rp ${value.toLocaleString("id-ID")}`

const TAX_RATE = 0.11

const calculateTaxAmount = (baseTotal: number) =>
  Math.round(baseTotal * TAX_RATE)

export function Pemesanan() {
  const navigate = useNavigate()
  const [showAllPayments, setShowAllPayments] = useState(false)
  const { isLoggedIn } = useAuthStore()
  const { profile, addresses, loadProfile } = useProfileStore()
  const {
    items,
    subtotal,
    isLoading,
    error,
    loadCart,
    updateItem,
    removeItem,
  } = useCartStore()
  const {
    customer,
    paymentMethod,
    shippingOptions,
    selectedShippingId,
    expeditionOptions,
    selectedExpeditionId,
    packagingOptions,
    selectedPackagingId,
    summary,
    isLoading: isCheckoutLoading,
    error: checkoutError,
    updateCustomerField,
    prefillCustomer,
    setPaymentMethod,
    setExpeditionOption,
    setPackagingOption,
    setShippingOption,
    loadShippingOptions,
    calculateSummary,
    placeOrder,
  } = useCheckoutStore()

  useEffect(() => {
    loadCart()
  }, [loadCart])

  useEffect(() => {
    loadShippingOptions()
  }, [loadShippingOptions])

  useEffect(() => {
    if (!isLoggedIn) return
    loadProfile()
  }, [isLoggedIn, loadProfile])

  useEffect(() => {
    calculateSummary()
  }, [
    selectedShippingId,
    selectedExpeditionId,
    selectedPackagingId,
    subtotal,
    calculateSummary,
  ])

  const cartSummaryItems = useMemo(
    () =>
      items.map((item) => ({
        id: item.id,
        title: item.product?.title || "Produk",
        qty: item.qty,
        price_idr: item.product?.price_idr ?? 0,
      })),
    [items]
  )

  const summaryItems =
    cartSummaryItems.length > 0 ? cartSummaryItems : fallbackSummaryItems
  const cartSubtotal =
    cartSummaryItems.length > 0 ? subtotal : fallbackSubtotal
  const canEditCart = cartSummaryItems.length > 0
  const [countryOptions, setCountryOptions] = useState<CountryOption[]>(() =>
    getCountryOptions()
  )

  const defaultAddress = useMemo(() => {
    if (!addresses.length) return null
    return addresses.find((address) => address.is_default) || addresses[0]
  }, [addresses])

  useEffect(() => {
    let isActive = true

    fetchCountryOptions().then((options) => {
      if (isActive) {
        setCountryOptions(options)
      }
    })

    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    if (!isLoggedIn) return
    const metadata = (defaultAddress?.metadata ?? {}) as Record<
      string,
      unknown
    >
    const district =
      typeof metadata["district"] === "string" ? metadata["district"] : ""
    const subdistrict =
      typeof metadata["subdistrict"] === "string"
        ? metadata["subdistrict"]
        : ""

    prefillCustomer({
      full_name:
        defaultAddress?.recipient_name || profile.fullName || "",
      email: defaultAddress?.email || profile.email || "",
      phone: defaultAddress?.phone || profile.phone || "",
      address: defaultAddress?.address_line1 || profile.address || "",
      city: defaultAddress?.city || profile.city || "",
      province: defaultAddress?.province || profile.province || "",
      postal_code:
        defaultAddress?.postal_code || profile.postalCode || "",
      country: defaultAddress?.country || profile.country || "",
      notes: defaultAddress?.notes || profile.notes || "",
      district: district || profile.district || "",
      subdistrict: subdistrict || profile.subdistrict || "",
    })
  }, [isLoggedIn, defaultAddress, profile, prefillCustomer])

  const activeShipping =
    shippingOptions.find((option) => option.id === selectedShippingId) ||
    shippingOptions[0]
  const activeExpedition =
    expeditionOptions.find((option) => option.id === selectedExpeditionId) ||
    expeditionOptions[0]
  const activePackaging =
    packagingOptions.find((option) => option.id === selectedPackagingId) ||
    packagingOptions[0]
  const shippingCost = activeShipping?.price_value ?? 0
  const subtotalCost = summary?.subtotal ?? cartSubtotal
  const shippingFee = summary?.shipping_fee ?? shippingCost
  const preTaxTotal = subtotalCost + shippingFee
  const taxAmount = summary?.tax_amount ?? calculateTaxAmount(preTaxTotal)
  const totalCost = summary?.total ?? preTaxTotal + taxAmount

  const handlePaymentChange = (methodId: string, methodLabel: string) => {
    setPaymentMethod({ id: methodId, label: methodLabel })
  }

  const handleShippingChange = (methodId: string) => {
    setShippingOption(methodId)
  }

  const handleExpeditionChange = (optionId: string) => {
    setExpeditionOption(optionId)
  }

  const handlePackagingChange = (optionId: string) => {
    setPackagingOption(optionId)
  }

  const handleDecreaseItem = async (itemId: string, qty: number) => {
    if (isLoading) return
    if (qty <= 1) {
      await removeItem(itemId)
      return
    }
    await updateItem(itemId, qty - 1)
  }

  const handleRemoveItem = async (itemId: string) => {
    if (isLoading) return
    await removeItem(itemId)
  }

  const handleIncreaseItem = async (itemId: string, qty: number) => {
    if (isLoading) return
    await updateItem(itemId, qty + 1)
  }

  const handlePlaceOrder = async () => {
    const orderId = await placeOrder()
    if (orderId) {
      navigate("/pembayaran")
    }
  }

  return (
    <PageLayout>
      <section className="mx-auto w-full max-w-6xl px-6 pb-20 pt-12 md:pt-16">
        <div>
          <p className="text-sm font-semibold text-slate-400">
            <span className="text-blue-600">Pemesanan</span>{" "}
            <span className="text-slate-400">/</span>{" "}
            <a
              href="/pembayaran"
              className="cursor-pointer text-slate-400 transition hover:text-blue-600"
            >
              Pembayaran
            </a>
          </p>
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
                      value={customer.full_name}
                      onChange={(event) =>
                        updateCustomerField("full_name", event.target.value)
                      }
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
                      value={customer.phone}
                      onChange={(event) =>
                        updateCustomerField("phone", event.target.value)
                      }
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
                    value={customer.email}
                    onChange={(event) =>
                      updateCustomerField("email", event.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-600">
                      Negara
                    </label>
                    <select
                      value={customer.country}
                      onChange={(event) =>
                        updateCustomerField("country", event.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500"
                    >
                      {countryOptions.map((option) => (
                        <option key={option.code} value={option.name}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600">
                      Provinsi
                    </label>
                    <input
                      type="text"
                      placeholder="DKI Jakarta"
                      value={customer.province}
                      onChange={(event) =>
                        updateCustomerField("province", event.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-600">
                      Kota / Kabupaten
                    </label>
                    <input
                      type="text"
                      placeholder="Jakarta"
                      value={customer.city}
                      onChange={(event) =>
                        updateCustomerField("city", event.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600">
                      Kecamatan
                    </label>
                    <input
                      type="text"
                      placeholder="Kemayoran"
                      value={customer.district}
                      onChange={(event) =>
                        updateCustomerField("district", event.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-600">
                      Kelurahan / Desa
                    </label>
                    <input
                      type="text"
                      placeholder="Kebon Kosong"
                      value={customer.subdistrict}
                      onChange={(event) =>
                        updateCustomerField("subdistrict", event.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600">
                      Kode Pos
                    </label>
                    <input
                      type="text"
                      placeholder="10110"
                      value={customer.postal_code}
                      onChange={(event) =>
                        updateCustomerField("postal_code", event.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600">
                    Detail Alamat
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Nama jalan, nomor, RT/RW, patokan"
                    value={customer.address}
                    onChange={(event) =>
                      updateCustomerField("address", event.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600">
                    Catatan Alamat (opsional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Contoh: titip ke satpam, rumah warna putih"
                    value={customer.notes}
                    onChange={(event) =>
                      updateCustomerField("notes", event.target.value)
                    }
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
                  const isActive = selectedShippingId === option.id
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleShippingChange(option.id)}
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
                        {option.price_label}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-['Sora'] text-lg font-semibold text-slate-900">
                Ekspedisi
              </h2>
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {expeditionOptions.map((option) => {
                  const isActive = selectedExpeditionId === option.id
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleExpeditionChange(option.id)}
                      className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-4 text-left transition ${
                        isActive
                          ? "border-blue-500 bg-blue-50/40"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <span className="text-sm font-semibold text-slate-900">
                        {option.label}
                      </span>
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
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-['Sora'] text-lg font-semibold text-slate-900">
                Packaging
              </h2>
              <div className="mt-6 space-y-3">
                {packagingOptions.map((option) => {
                  const isActive = selectedPackagingId === option.id
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handlePackagingChange(option.id)}
                      className={`flex w-full cursor-pointer items-center justify-between rounded-xl border px-4 py-4 text-left transition ${
                        isActive
                          ? "border-blue-500 bg-blue-50/40"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {option.label}
                        </p>
                        <p className="text-xs text-slate-500">{option.detail}</p>
                      </div>
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
                  const isActive = paymentMethod.id === method.id
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => handlePaymentChange(method.id, method.label)}
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
              {isLoading && (
                <p className="text-xs text-slate-400">Memuat keranjang...</p>
              )}
              {error && (
                <p className="text-xs text-red-500">{error}</p>
              )}
              {checkoutError && (
                <p className="text-xs text-red-500">{checkoutError}</p>
              )}
              {summaryItems.map((item) => (
                <div
                  key={item.id}
                  className="group flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md hover:cursor-pointer"
                >
                  <div>
                    <p className="text-sm text-slate-700">
                      {item.title}
                      <span className="ml-2 text-xs text-slate-400">
                        x{item.qty}
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Harga satuan: {formatIdr(item.price_idr)}
                    </p>
                    {canEditCart && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                        <button
                          type="button"
                          onClick={() => handleDecreaseItem(item.id, item.qty)}
                          disabled={isLoading}
                          className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-slate-200 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                          aria-label={`Kurangi ${item.title}`}
                        >
                          -
                        </button>
                        <span>Qty {item.qty}</span>
                        <button
                          type="button"
                          onClick={() => handleIncreaseItem(item.id, item.qty)}
                          disabled={isLoading}
                          className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-slate-200 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                          aria-label={`Tambah ${item.title}`}
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={isLoading}
                          className="ml-2 inline-flex cursor-pointer items-center rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-[11px] font-semibold text-rose-600 transition hover:border-rose-300 hover:bg-rose-100 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Hapus
                        </button>
                      </div>
                    )}
                  </div>
                  <span className="font-semibold text-slate-900">
                    {formatIdr(item.price_idr * item.qty)}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">
                  {formatIdr(summary?.subtotal ?? cartSubtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <span>Pengiriman</span>
                <span className="font-semibold text-slate-900">
                  {formatIdr(shippingFee)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span>Ekspedisi</span>
                <span className="font-semibold text-slate-900">
                  {activeExpedition?.label || "JNE"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Packaging</span>
                <span className="font-semibold text-slate-900">
                  {activePackaging?.label || "Regular"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Pajak 11%</span>
                <span className="font-semibold text-slate-900">
                  {formatIdr(taxAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 text-base font-semibold text-slate-900">
                <span>Total</span>
                <span className="text-orange-500">
                  {formatIdr(totalCost)}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={isCheckoutLoading}
              className="mt-6 inline-flex w-full cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isCheckoutLoading ? "Memproses..." : "Bayar Sekarang"}
            </button>
          </div>
        </div>
      </section>
    </PageLayout>
  )
}

export default Pemesanan
