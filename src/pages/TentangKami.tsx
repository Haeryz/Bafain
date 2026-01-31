import {
  BadgeCheck,
  Lightbulb,
  Rocket,
  Target,
  Users,
  Wrench,
} from "lucide-react"
import PageLayout from "@/components/PageLayout"

const missionPoints = [
  "Mengembangkan teknologi pengering udang yang higienis dan efisien",
  "Meningkatkan kualitas dan nilai jual udang kering nelayan Indonesia",
  "Memberikan solusi ramah lingkungan dengan energi terbarukan",
  "Mendukung keberlanjutan industri perikanan Indonesia",
]

const timeline = [
  {
    year: "2018",
    title: "Pendirian Perusahaan",
    description:
      "Pembentukan Shrimp Solar Dryer dengan misi menyediakan solusi pengeringan udang berkelanjutan.",
    icon: BadgeCheck,
  },
  {
    year: "2019",
    title: "Riset & Pengembangan Awal",
    description:
      "Fokus pada studi kelayakan teknologi surya untuk aplikasi pengeringan makanan laut, prototype pertama.",
    icon: Lightbulb,
  },
  {
    year: "2020",
    title: "Pengembangan Prototype V1",
    description:
      "Peluncuran prototype pertama dengan sistem pengeringan terkontrol dan sensor suhu dasar.",
    icon: Wrench,
  },
  {
    year: "2021",
    title: "Pengujian Lapangan Intensif",
    description:
      "Uji coba ekstensif di berbagai lokasi budidaya udang untuk mengumpulkan data kinerja dan umpan balik.",
    icon: Users,
  },
  {
    year: "2022",
    title: "Integrasi Teknologi Smart",
    description:
      "Pengenalan sistem kontrol cerdas untuk pemantauan kelembapan otomatis dan optimasi pengeringan.",
    icon: Target,
  },
  {
    year: "2023",
    title: "Peluncuran Produk Komersial",
    description:
      "Pengering Udang Tenaga Surya siap dipasarkan, tersedia untuk industri perikanan.",
    icon: Rocket,
  },
]

export function TentangKami() {
  return (
    <PageLayout>
      <section className="mx-auto w-full max-w-6xl px-6 pb-16 pt-12 md:pb-20 md:pt-16">
        <div className="text-center">
          <h1 className="font-['Sora'] text-3xl font-semibold text-slate-900 md:text-4xl">
            Tentang Kami
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600">
            Mengenal lebih dekat visi, misi, dan tim di balik inovasi Pengering
            Udang Tenaga Surya.
          </p>
        </div>

        <div className="mt-12 grid gap-10 md:grid-cols-[1fr_1.1fr]">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <img
              src="/hero-team.svg"
              alt="Tim Bafain"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="space-y-4 text-sm leading-relaxed text-slate-600">
            <p>
              Didirikan pada tahun 2018, Shrimp Solar Dryer memulai perjalanannya
              dengan visi untuk merevolusi industri pengeringan udang. Melihat
              kebutuhan yang terus meningkat akan metode pengeringan yang lebih
              efisien, higienis, dan ramah lingkungan, tim insinyur dan ahli
              pangan kami berdedikasi untuk mengembangkan solusi inovatif.
            </p>
            <p>
              Dengan fokus pada keberlanjutan dan kualitas produk, kami
              mengembangkan Pengering Udang Tenaga Surya yang memanfaatkan energi
              matahari secara optimal. Teknologi kami dirancang untuk mengurangi
              ketergantungan pada metode tradisional yang rentan terhadap cuaca
              dan metode listrik yang mahal, sekaligus meningkatkan kualitas
              akhir udang kering.
            </p>
            <p>
              Sejak awal, kami telah bekerja sama dengan petani udang dan
              lembaga riset untuk memastikan produk kami tidak hanya inovatif
              tetapi juga praktis dan memberikan nilai tambah yang nyata bagi
              pengguna. Kami percaya bahwa masa depan pengolahan udang terletak
              pada teknologi yang cerdas dan berkelanjutan.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
          <h2 className="text-center font-['Sora'] text-2xl font-semibold text-slate-900 md:text-3xl">
            Visi & Misi
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <Target className="h-5 w-5" />
                </span>
                <p className="font-['Sora'] text-base font-semibold text-slate-900">
                  Visi Kami
                </p>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                Menyediakan solusi pengeringan udang yang inovatif dan
                berkelanjutan, meningkatkan efisiensi operasional dan kualitas
                produk bagi pelaku industri perikanan, sambil menjaga kelestarian
                lingkungan.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                  <Lightbulb className="h-5 w-5" />
                </span>
                <p className="font-['Sora'] text-base font-semibold text-slate-900">
                  Misi Kami
                </p>
              </div>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                {missionPoints.map((point) => (
                  <li key={point} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto w-full max-w-6xl px-6 pb-20">
          <h2 className="text-center font-['Sora'] text-2xl font-semibold text-slate-900 md:text-3xl">
            Linimasa Pengembangan Teknologi
          </h2>
          <div className="relative mt-12">
            <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-blue-500 via-blue-500/60 to-orange-500 md:block md:z-0" />
            <div className="flex flex-col gap-10">
              {timeline.map((item, index) => {
                const Icon = item.icon
                const isRight = index % 2 === 1
                const accent =
                  index % 2 === 0
                    ? {
                        badge: "bg-blue-50 text-blue-600",
                        icon: "bg-blue-600 text-white",
                      }
                    : {
                        badge: "bg-orange-50 text-orange-600",
                        icon: "bg-orange-500 text-white",
                      }
                return (
                  <div
                    key={item.year}
                    className="grid gap-6 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center"
                  >
                    <div className="order-1 flex justify-center md:order-none md:col-start-2 md:row-start-1 md:justify-self-center md:z-10">
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-full shadow ring-4 ring-white ${accent.icon}`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                    </div>
                    <div
                      className={`order-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md md:order-none md:row-start-1 md:max-w-md ${
                        isRight
                          ? "md:col-start-3 md:justify-self-start md:text-left"
                          : "md:col-start-1 md:justify-self-end md:text-right"
                      }`}
                    >
                      <div className={isRight ? "flex" : "flex justify-end"}>
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${accent.badge}`}
                        >
                          {item.year}
                        </span>
                      </div>
                      <p className="mt-3 font-['Sora'] text-sm font-semibold text-slate-900">
                        {item.title}
                      </p>
                      <p className="mt-2 text-xs leading-relaxed text-slate-600">
                        {item.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  )
}

export default TentangKami
