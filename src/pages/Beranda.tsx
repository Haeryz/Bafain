import { ArrowRight, Leaf, Lightbulb, ShieldCheck, Sparkles } from "lucide-react"
import PageLayout from "@/components/PageLayout"

const benefitCards = [
  {
    title: "Inovasi Terdepan",
    description:
      "Memanfaatkan teknologi pengeringan bertenaga surya terbaru untuk hasil yang konsisten dan higienis.",
    icon: Lightbulb,
  },
  {
    title: "Skala Industri",
    description:
      "Dirancang untuk kapasitas besar, ideal untuk operasi pengolahan udang dengan volume tinggi.",
    icon: Sparkles,
  },
  {
    title: "Kapasitas Besar",
    description:
      "Sistem tertutup melindungi udang dari kontaminan, menjaga kebersihan dan keamanan pangan.",
    icon: ShieldCheck,
  },
  {
    title: "Hemat Energi",
    description:
      "Mengurangi biaya operasional hingga 70% dengan pemanfaatan energi surya yang melimpah.",
    icon: Leaf,
  },
]

export function Beranda() {
  return (
    <PageLayout>
      <div className="bg-white">
        <section className="mx-auto w-full max-w-6xl px-6 pb-16 pt-12 md:pb-20 md:pt-16">
          <div className="flex flex-col items-center gap-8 text-center">
            <div>
              <h1 className="font-['Sora'] text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl md:text-5xl">
                Solar Dryer Pengering Udang Tenaga Surya
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
                Pengering Udang Tenaga Surya kami adalah terobosan dalam
                pengolahan hasil laut, menawarkan efisiensi tanpa banding,
                higienis, dan ramah lingkungan. Optimalkan kualitas produk dan
                kurangi biaya operasional Anda dengan teknologi terdepan.
              </p>
            </div>
            <div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <img
                src="/hero-team.svg"
                alt="Tim Bafain di lokasi produksi solar dryer"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
            <div className="text-center">
              <h2 className="font-['Sora'] text-2xl font-semibold text-slate-900 md:text-3xl">
                Mengapa Memilih Pengering Udang Tenaga Surya Kami ?
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600">
                Kami menggabungkan inovasi dan keberlanjutan untuk memberikan
                solusi pengeringan terbaik yang menjaga kualitas produk Anda dan
                menghormati lingkungan.
              </p>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {benefitCards.map((card) => {
                const Icon = card.icon
                return (
                  <div
                    key={card.title}
                    className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 font-['Sora'] text-base font-semibold text-slate-900">
                      {card.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-600">
                      {card.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto w-full max-w-6xl px-6 pb-20 pt-4">
            <div className="grid items-center gap-10 md:grid-cols-[1.1fr_0.9fr]">
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <img
                  src="/solar-diagram.svg"
                  alt="Diagram kerja teknologi solar dryer"
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <h2 className="font-['Sora'] text-2xl font-semibold text-slate-900 md:text-3xl">
                  Bagaimana Teknologi Kami Bekerja ?
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-slate-600">
                  Pengering Udang Tenaga Surya kami menggunakan kombinasi panel
                  surya efisiensi tinggi dan sistem aliran udara terkontrol
                  untuk mengeringkan udang secara merata dan cepat. Ini
                  meminimalkan pembusukan dan mempertahankan rasa alami serta
                  nutrisi.
                </p>
                <button className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
                  Pelajari Lebih Lanjut
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  )
}

export default Beranda
