import { ArrowRight, ShieldCheck, Sun, Wind } from "lucide-react"
import PageLayout from "@/components/PageLayout"

const principles = [
  {
    title: "Pengumpulan Energi Surya",
    description:
      "Panel surya efisiensi tinggi menyerap radiasi matahari, mengubahnya menjadi energi panas yang digunakan untuk memanaskan udara.",
    icon: Sun,
  },
  {
    title: "Sirkulasi Udara Terkendali",
    description:
      "Udara panas disirkulasikan secara merata di dalam ruang pengeringan untuk memastikan proses pengeringan yang konsisten dan cepat.",
    icon: Wind,
  },
  {
    title: "Proses Pengeringan Higienis",
    description:
      "Udang dikeringkan dalam lingkungan tertutup yang terkontrol, bebas dari debu dan kontaminasi.",
    icon: ShieldCheck,
  },
]

const steps = [
  {
    title: "Pemanasan Udara",
    description:
      "Kolektor surya terintegrasi mengumpulkan energi matahari, memanaskan udara ambient. Udara panas disaring dan dialirkan ke ruang pengering dengan bantuan kipas berdaya rendah.",
    image: "/solar-diagram.svg",
  },
  {
    title: "Pemasukan Udang",
    description:
      "Udang segar yang telah dibersihkan ditempatkan pada rak tahan panas higienis yang terbuat dari bahan food-grade.",
    image: "/solar-diagram.svg",
  },
  {
    title: "Proses Pengeringan Terkendali",
    description:
      "Sistem kontrol digital memantau suhu dan kelembapan optimal di ruang pengering, menjaga aliran udara panas secara stabil.",
    image: "/solar-diagram.svg",
  },
  {
    title: "Udang Kering Berkualitas",
    description:
      "Setelah proses selesai, udang kering memiliki kualitas superior, tekstur konsisten, warna alami, dan bebas kontaminan.",
    image: "/solar-diagram.svg",
  },
]

export function Teknologi() {
  return (
    <PageLayout>
      <section className="mx-auto w-full max-w-6xl px-6 pb-16 pt-12 md:pb-20 md:pt-16">
        <div className="text-center">
          <h1 className="font-['Sora'] text-3xl font-semibold text-slate-900 md:text-4xl">
            Teknologi Pengering Udara Tenaga Surya untuk Udang
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-slate-600">
            Pengering udara tenaga surya kami merevolusi proses pengeringan udang,
            menawarkan solusi yang bersih, efisien, dan berkelanjutan. Dengan
            memanfaatkan energi matahari secara cerdas, kami memastikan produk
            udang kering berkualitas tinggi sambil mengurangi dampak lingkungan
            dan biaya operasional.
          </p>
        </div>

        <div className="mt-10 flex justify-center">
          <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <img
              src="/hero-team.svg"
              alt="Teknisi melakukan pengujian teknologi pengering surya"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
          <div className="text-center">
            <h2 className="font-['Sora'] text-2xl font-semibold text-slate-900 md:text-3xl">
              Prinsip Kerja Utama Pengering Udara Tenaga Surya
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
            {principles.map((item, index) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="contents">
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-600">
                      {index + 1}
                    </div>
                    <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 font-['Sora'] text-base font-semibold text-slate-900">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-600">
                      {item.description}
                    </p>
                  </div>
                  {index < principles.length - 1 && (
                    <div className="hidden items-center justify-center md:flex">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-blue-600">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto w-full max-w-6xl px-6 pb-20 pt-4">
          <div className="text-center">
            <h2 className="font-['Sora'] text-2xl font-semibold text-slate-900 md:text-3xl">
              Bagaimana Cara Kerja Pengering Udara Tenaga Surya Kami?
            </h2>
          </div>

          <div className="mt-12 space-y-10">
            {steps.map((step, index) => {
              const isEven = index % 2 === 1
              return (
                <div
                  key={step.title}
                  className={`grid items-center gap-8 md:grid-cols-[1fr_1fr] ${
                    isEven ? "md:[&>div:first-child]:order-2" : ""
                  }`}
                >
                  <div>
                    <p className="text-sm font-semibold text-blue-600">
                      {index + 1}. {step.title}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">
                      {step.description}
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <div className="w-full max-w-xs rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                      <img
                        src={step.image}
                        alt={step.title}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </PageLayout>
  )
}

export default Teknologi
