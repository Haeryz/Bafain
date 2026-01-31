import { CheckCircle2 } from "lucide-react"
import { Link } from "react-router-dom"
import PageLayout from "@/components/PageLayout"

const productFeatures = [
  "Pengeringan Efisien",
  "Proses Higienis",
  "Ramah Lingkungan",
  "Kapasitas Besar",
]

const specs = [
  { label: "Kapasitas Pengeringan", value: "500 - 1000 kg" },
  { label: "Sumber Energi", value: "Tenaga Surya & Pemanas Cadangan" },
  { label: "Bahan Konstruksi", value: "Stainless Steel Food Grade" },
  { label: "Suhu Operasional", value: "40°C - 70°C (Dapat Diatur)" },
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

const benefits = [
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

const galleryItems = [
  {
    title: "Instalasi Panel Surya",
    description:
      "Teknisi memastikan panel surya terpasang optimal untuk penyerapan energi maksimal.",
  },
  {
    title: "Kontrol Digital",
    description:
      "Panel kontrol memantau suhu dan kelembapan secara real-time untuk hasil konsisten.",
  },
  {
    title: "Ruang Pengering Higienis",
    description:
      "Ruang pengering tertutup menjaga kualitas udang tetap bersih dan aman.",
  },
]

export function Produk() {
  return (
    <PageLayout>
      <section className="mx-auto w-full max-w-6xl px-6 pb-16 pt-12 md:pb-20 md:pt-16">
        <div className="grid items-center gap-10 md:grid-cols-[1.05fr_0.95fr]">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <img
              src="/hero-team.svg"
              alt="Solar dryer tenaga surya"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h1 className="font-['Sora'] text-3xl font-semibold text-slate-900 md:text-4xl">
              Solar Dryer Pengeringan Udang Tenaga Surya
            </h1>
            <p className="mt-3 text-lg font-semibold text-blue-600">
              Rp 500.000/panel
            </p>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              Pengering Udang Tenaga Surya kami adalah terobosan dalam pengolahan
              hasil laut, menawarkan efisiensi tanpa banding, higienis, dan
              ramah lingkungan. Optimalkan kualitas produk dan kurangi biaya
              operasional Anda dengan teknologi terdepan.
            </p>

            <div className="mt-6">
              <p className="text-sm font-semibold text-slate-900">Fitur Utama</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {productFeatures.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-2 text-sm text-slate-600"
                  >
                    <CheckCircle2 className="h-4 w-4 text-orange-500" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              to="/pemesanan"
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
                  key={spec.label}
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
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
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
            {galleryItems.map((item) => (
              <div
                key={item.title}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <img
                  src="/hero-team.svg"
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
