import {
  Calendar,
  Check,
  Mail,
  MapPin,
  Phone,
  ShoppingBag,
  User,
  Building2,
  ClipboardList,
} from "lucide-react"
import PageLayout from "@/components/PageLayout"

const stats = [
  {
    title: "Total Order",
    value: "8",
    icon: ClipboardList,
    tone: "bg-blue-50 text-blue-600",
  },
  { title: "Aktif", value: "2", icon: Check, tone: "bg-emerald-50 text-emerald-600" },
  {
    title: "Selesai",
    value: "6",
    icon: ShoppingBag,
    tone: "bg-orange-50 text-orange-600",
  },
]

const lastOrders = [
  {
    title: "Solar Dryer SD-500",
    date: "15 Nov 2024",
    status: "Dikirim",
    statusTone: "bg-emerald-100 text-emerald-600",
  },
  {
    title: "Solar Dryer SD-300",
    date: "28 Okt 2024",
    status: "Dalam Proses",
    statusTone: "bg-blue-100 text-blue-600",
  },
]

export function Profile() {
  return (
    <PageLayout>
      <section className="mx-auto w-full max-w-6xl px-6 pb-20 pt-12 md:pt-16">
        <div>
          <h1 className="font-['Sora'] text-2xl font-semibold text-blue-600 md:text-3xl">
            Profil Saya
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Kelola informasi profil Anda
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white">
                  <User className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Google User
                  </p>
                  <p className="text-xs text-slate-500">user@gmail.com</p>
                  <span className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Aktif
                  </span>
                </div>
              </div>
              <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300">
                Edit Profil
              </button>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div>
                <p className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <User className="h-4 w-4" />
                  Nama Lengkap
                </p>
                <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  Google User
                </div>
              </div>
              <div>
                <p className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <Mail className="h-4 w-4" />
                  Email
                </p>
                <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  user@gmail.com
                </div>
              </div>
              <div>
                <p className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <Phone className="h-4 w-4" />
                  Nomor Telepon
                </p>
                <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  081234567890
                </div>
              </div>
              <div>
                <p className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <Building2 className="h-4 w-4" />
                  Perusahaan
                </p>
                <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  -
                </div>
              </div>
              <div className="md:col-span-2">
                <p className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <MapPin className="h-4 w-4" />
                  Alamat
                </p>
                <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  Jakarta, Indonesia
                </div>
              </div>
              <div className="md:col-span-2">
                <p className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <Calendar className="h-4 w-4" />
                  Tanggal Bergabung
                </p>
                <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  30 November 2025
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">
                Statistik Order
              </h2>
              <div className="mt-4 space-y-3">
                {stats.map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-2xl ${item.tone}`}
                      >
                        <item.icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-xs text-slate-500">{item.title}</p>
                        <p className="text-base font-semibold text-slate-900">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">
                Order Terakhir
              </h2>
              <div className="mt-4 space-y-3">
                {lastOrders.map((order) => (
                  <div
                    key={order.title}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3"
                  >
                    <p className="text-sm font-semibold text-slate-900">
                      {order.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{order.date}</p>
                    <span
                      className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${order.statusTone}`}
                    >
                      {order.status}
                    </span>
                  </div>
                ))}
              </div>
              <button className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
                Lihat Semua Pesanan
              </button>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  )
}

export default Profile
