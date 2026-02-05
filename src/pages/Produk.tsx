import { useEffect, useMemo, useState } from "react"
import { CheckCircle2 } from "lucide-react"
import { Link, useParams } from "react-router-dom"
import PageLayout from "@/components/PageLayout"
import { useProductsStore } from "@/stores/products/useProductsStore"
import { useCartStore } from "@/stores/cart/useCartStore"

const fallbackFeatures = [
  "Pengeringan Efisien",
  "Proses Higienis",
  "Ramah Lingkungan",
  "Kapasitas Besar",
]

const fallbackSpecs = [
  { label: "Kapasitas Pengeringan", value: "500 - 1000 kg" },
  { label: "Sumber Energi", value: "Tenaga Surya & Pemanas Cadangan" },
  { label: "Bahan Konstruksi", value: "Stainless Steel Food Grade" },
  { label: "Suhu Operasional", value: "40 C - 70 C (Dapat Diatur)" },
  {
    label: "Kontrol",
    value: "Digital Otomatis dengan Sensor Suhu & Kelembaban",
  },
  {
    label: "Waktu Pengeringan (rata-rata)",
    value: "8-12 jam (tergantung kondisi cuaca)",
  },
  {
    label: "Konsumsi Daya Tambahan",
    value: "1.6 kW (untuk blower dan sistem kontrol)",
  },
  { label: "Sistem Sirkulasi Udara", value: "Ventilasi Paksa (Forced Convection)" },
]

const fallbackBenefits = [
  {
    title: "Efisiensi Energi Tinggi",
    description:
      "Memanfaatkan energi matahari secara maksimal, mengurangi biaya operasional hingga 80% dibandingkan metode konvensional.",
  },
  {
    title: "Kualitas Produk Stabil",
    description:
      "Suhu dan kelembapan terkontrol menjaga tekstur, warna, dan rasa udang tetap konsisten.",
  },
  {
    title: "Higienis dan Aman",
    description:
      "Proses tertutup melindungi dari debu dan kontaminasi, menjaga standar keamanan pangan.",
  },
  {
    title: "Skalabilitas Produksi",
    description:
      "Cocok untuk kebutuhan pengolahan kecil hingga industri besar dengan kapasitas fleksibel.",
  },
]

const fallbackGallery = [
  {
    title: "Instalasi Panel Surya",
    description:
      "Teknisi memastikan panel surya terpasang optimal untuk penyerapan energi maksimal.",
    image_url: "/hero-team.svg",
  },
  {
    title: "Kontrol Digital",
    description:
      "Panel kontrol memantau suhu dan kelembapan secara real-time untuk hasil konsisten.",
    image_url: "/hero-team.svg",
  },
  {
    title: "Ruang Pengering Higienis",
    description:
      "Ruang pengering tertutup menjaga kualitas udang tetap bersih dan aman.",
    image_url: "/hero-team.svg",
  },
]

export function Produk() {
  const { productId } = useParams<{ productId?: string }>()
  const { products, currentProduct, isLoading, error, loadProducts, loadProduct } =
    useProductsStore()
  const { addItem } = useCartStore()
  const [quantityById, setQuantityById] = useState<Record<string, number>>({})

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const selectedProductId =
    productId || products[0]?.id || currentProduct?.id || null

  useEffect(() => {
    if (!selectedProductId) return
    if (currentProduct?.id === selectedProductId) return
    loadProduct(selectedProductId)
  }, [selectedProductId, currentProduct?.id, loadProduct])

  const productFromList = selectedProductId
    ? products.find((item) => item.id === selectedProductId)
    : undefined
  const product =
    currentProduct?.id === selectedProductId ? currentProduct : productFromList
  const activeProductId = product?.id
  const quantity =
    activeProductId && quantityById[activeProductId]
      ? quantityById[activeProductId]
      : 1

  const productFeatures = useMemo(() => {
    if (!product?.product_features?.length) return fallbackFeatures
    return product.product_features.map((f) => f.feature)
  }, [product])

  const specs = useMemo(() => {
    if (!product?.product_specs?.length) return fallbackSpecs
    return product.product_specs.map((s) => ({
      label: s.spec_key,
      value: s.spec_value || "-",
    }))
  }, [product])

  const benefits = useMemo(() => {
    if (!product?.product_benefits?.length) return fallbackBenefits
    return product.product_benefits.map((b) => ({
      title: b.title,
      description: b.description || "",
    }))
  }, [product])

  const galleryItems = useMemo(() => {
    if (!product?.product_gallery?.length) return fallbackGallery
    return product.product_gallery.map((g) => ({
      title: g.title,
      description: g.description || "",
      image_url: g.image_url,
    }))
  }, [product])

  const title = product?.title || "Solar Dryer Pengeringan Udang Tenaga Surya"
  const price = product?.price_idr
    ? `Rp ${product.price_idr.toLocaleString("id-ID")}${product.price_unit ? `/${product.price_unit}` : ""}`
    : "Rp 500.000/panel"
  const description =
    product?.description ||
    "Pengering Udang Tenaga Surya kami adalah terobosan dalam pengolahan hasil laut, menawarkan efisiensi tanpa banding, higienis, dan ramah lingkungan. Optimalkan kualitas produk dan kurangi biaya operasional Anda dengan teknologi terdepan."
  const imageUrl = product?.image_url || "/hero-team.svg"
  const handleOrderNow = () => {
    if (activeProductId) {
      addItem(activeProductId, quantity)
    }
  }

  const handleQuantityChange = (nextValue: number) => {
    const nextQty = Number.isFinite(nextValue) ? Math.floor(nextValue) : 1
    if (!activeProductId) return
    const normalized = Math.max(1, nextQty)
    setQuantityById((prev) => ({
      ...prev,
      [activeProductId]: normalized,
    }))
  }

  return (
    <PageLayout>
      <section className="mx-auto w-full max-w-6xl px-6 pb-12 pt-12 md:pb-16 md:pt-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              Katalog Produk
            </p>
            <h1 className="mt-2 font-['Sora'] text-3xl font-semibold text-slate-900 md:text-4xl">
              Pilih Mesin Pengering Anda
            </h1>
          </div>
          <p className="text-sm text-slate-500">
            Klik produk untuk melihat detail lengkap.
          </p>
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-500">{error}</p>
        )}

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.length === 0 && isLoading ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
              Memuat katalog produk...
            </div>
          ) : null}

          {products.length === 0 && !isLoading ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
              Produk belum tersedia. Silakan cek kembali nanti.
            </div>
          ) : null}

          {products.map((item) => {
            const isActive = item.id === selectedProductId
            const priceLabel = item.price_idr
              ? `Rp ${item.price_idr.toLocaleString("id-ID")}${item.price_unit ? `/${item.price_unit}` : ""}`
              : "Hubungi kami"
            return (
              <Link
                key={item.id}
                to={`/produk/${item.id}`}
                className={`group rounded-3xl border bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md ${
                  isActive ? "border-blue-500" : "border-slate-200"
                }`}
              >
                <div className="aspect-square overflow-hidden rounded-2xl bg-slate-50">
                  <img
                    src={item.image_url || "/hero-team.svg"}
                    alt={item.title}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="mt-4">
                  <p className="text-base font-semibold text-slate-900">
                    {item.title}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-blue-600">
                    {priceLabel}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    Lihat detail produk
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-16 pt-12 md:pb-20 md:pt-16">
        <div className="grid items-center gap-10 md:grid-cols-[1.05fr_0.95fr]">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <img
              src={imageUrl}
              alt={title}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h1 className="font-['Sora'] text-3xl font-semibold text-slate-900 md:text-4xl">
              {title}
            </h1>
            <p className="mt-3 text-lg font-semibold text-blue-600">
              {price}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              {description}
            </p>

            <div className="mt-6">
              <p className="text-sm font-semibold text-slate-900">Fitur Utama</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {productFeatures.map((feature, index) => (
                  <div
                    key={`${feature}-${index}`}
                    className="flex items-center gap-2 text-sm text-slate-600"
                  >
                    <CheckCircle2 className="h-4 w-4 text-orange-500" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <span className="text-sm font-semibold text-slate-900">
                Jumlah
              </span>
              <div className="flex items-center overflow-hidden rounded-full border border-slate-200 bg-white">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                  className="h-10 w-10 text-lg font-semibold text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300"
                >
                  -
                </button>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(event) =>
                    handleQuantityChange(Number(event.target.value))
                  }
                  className="h-10 w-16 border-x border-slate-200 text-center text-sm font-semibold text-slate-900 outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  className="h-10 w-10 text-lg font-semibold text-slate-500 transition hover:bg-slate-100"
                >
                  +
                </button>
              </div>
            </div>

            <Link
              to="/pemesanan"
              onClick={handleOrderNow}
              className="mt-8 inline-flex rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Pesan Sekarang
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto w-full max-w-6xl px-6 py-16">
          <h2 className="text-center font-['Sora'] text-2xl font-semibold text-slate-900 md:text-3xl">
            Spesifikasi Teknis
          </h2>
          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
              <p className="text-sm font-semibold text-slate-900">
                Tabel Spesifikasi Utama
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Parameter inti dari Pengering Surya Udang kami.
              </p>
            </div>
            <div className="grid">
              <div className="grid grid-cols-[1.1fr_1.3fr] gap-4 border-b border-blue-100 bg-blue-50 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-blue-600">
                <span>Spesifikasi</span>
                <span>Nilai</span>
              </div>
              {specs.map((spec, index) => (
                <div
                  key={`${spec.label}-${index}`}
                  className={`grid grid-cols-[1.1fr_1.3fr] gap-4 px-6 py-3 text-sm text-slate-600 ${
                    index % 2 === 0 ? "bg-white" : "bg-slate-50"
                  }`}
                >
                  <span className="font-medium text-slate-700">
                    {spec.label}
                  </span>
                  <span>{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto w-full max-w-6xl px-6 py-16">
          <h2 className="text-center font-['Sora'] text-2xl font-semibold text-slate-900 md:text-3xl">
            Manfaat Utama untuk Produsen Udang
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {benefits.map((benefit, index) => (
              <div
                key={`${benefit.title}-${index}`}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-['Sora'] text-base font-semibold text-slate-900">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto w-full max-w-6xl px-6 pb-20">
          <h2 className="text-center font-['Sora'] text-2xl font-semibold text-slate-900 md:text-3xl">
            Foto Instalasi Nyata
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {galleryItems.map((item, index) => (
              <div
                key={`${item.title}-${index}`}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="h-44 w-full object-cover"
                />
                <div className="p-5">
                  <p className="text-sm font-semibold text-slate-900">
                    {item.title}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  )
}

export default Produk
