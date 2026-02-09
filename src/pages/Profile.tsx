import { useEffect, useState } from "react"
import {
  Check,
  Pencil,
  ShoppingBag,
  User,
  ClipboardList,
} from "lucide-react"
import PageLayout from "@/components/PageLayout"
import { Link } from "react-router-dom"
import { useAuthStore } from "@/stores/auth/useAuthStore"
import { useProfileStore } from "@/stores/profile/useProfileStore"
import {
  fetchCountryOptions,
  getCountryOptions,
  type CountryOption,
} from "@/lib/countries"

const stats = [
  {
    title: "Total Order",
    value: "8",
    icon: ClipboardList,
    iconTone: "bg-blue-50 text-blue-600",
    cardTone: "bg-blue-50/40",
  },
  {
    title: "Aktif",
    value: "2",
    icon: Check,
    iconTone: "bg-emerald-50 text-emerald-600",
    cardTone: "bg-emerald-50/40",
  },
  {
    title: "Selesai",
    value: "6",
    icon: ShoppingBag,
    iconTone: "bg-orange-50 text-orange-600",
    cardTone: "bg-orange-50/40",
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
  const { isLoggedIn, user } = useAuthStore()
  const {
    profile,
    isEditing,
    isLoading,
    isSaving,
    errorMessage,
    showUpdated,
    hydrateFromAuth,
    updateField,
    setEditing,
    setShowUpdated,
    loadProfile,
    saveProfile,
  } = useProfileStore()
  const [countryOptions, setCountryOptions] = useState<CountryOption[]>(() =>
    getCountryOptions()
  )

  useEffect(() => {
    if (!showUpdated) return
    const timeout = window.setTimeout(() => setShowUpdated(false), 2500)
    return () => window.clearTimeout(timeout)
  }, [showUpdated, setShowUpdated])

  useEffect(() => {
    hydrateFromAuth(user)
  }, [user, hydrateFromAuth])

  useEffect(() => {
    if (!isLoggedIn) return
    loadProfile()
  }, [isLoggedIn, loadProfile])

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

  const handleToggleEdit = async () => {
    if (!isLoggedIn || isSaving || isLoading) return
    if (!isEditing) {
      setEditing(true)
      return
    }
    await saveProfile()
  }

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
            <div className="relative flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white">
                  <User className="h-7 w-7" />
                </div>
                <div>
                <p className="text-sm font-semibold text-slate-900">
                  {profile.fullName}
                </p>
                <p className="text-xs text-slate-500">{profile.email}</p>
                <span className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Aktif
                </span>
              </div>
            </div>
              <button
                type="button"
                onClick={handleToggleEdit}
                disabled={!isLoggedIn || isSaving || isLoading}
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Pencil className="h-4 w-4 text-slate-500" />
                {isSaving
                  ? "Menyimpan..."
                  : isEditing
                  ? "Simpan Profil"
                  : "Edit Profil"}
              </button>
              {showUpdated && (
                <div className="absolute right-28 top-1/2 -translate-y-1/2 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-xs font-semibold text-emerald-700 shadow-sm">
                  Profil berhasil di update
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
                {errorMessage}
              </div>
            )}
            {isLoading && (
              <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs font-semibold text-blue-600">
                Memuat profil...
              </div>
            )}

            <div className="mt-6 space-y-4 text-sm text-slate-600">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-slate-600">
                    Nama Lengkap
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={profile.fullName}
                      onChange={(event) =>
                        updateField("fullName", event.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500"
                    />
                  ) : (
                    <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                      {profile.fullName || "-"}
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">
                    No Telepon
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      placeholder="+62 812 3456 7890"
                      value={profile.phone}
                      onChange={(event) =>
                        updateField("phone", event.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500"
                    />
                  ) : (
                    <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                      {profile.phone || "-"}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    placeholder="john.doe@example.com"
                    value={profile.email}
                    onChange={(event) =>
                      updateField("email", event.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500"
                  />
                ) : (
                  <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    {profile.email || "-"}
                  </div>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-slate-600">
                    Negara
                  </label>
                  {isEditing ? (
                    <select
                      value={profile.country}
                      onChange={(event) =>
                        updateField("country", event.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500"
                    >
                      {countryOptions.map((option) => (
                        <option key={option.code} value={option.name}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                      {profile.country || "-"}
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">
                    Provinsi
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      placeholder="DKI Jakarta"
                      value={profile.province}
                      onChange={(event) =>
                        updateField("province", event.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500"
                    />
                  ) : (
                    <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                      {profile.province || "-"}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-slate-600">
                    Kota / Kabupaten
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      placeholder="Jakarta"
                      value={profile.city}
                      onChange={(event) =>
                        updateField("city", event.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500"
                    />
                  ) : (
                    <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                      {profile.city || "-"}
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">
                    Kecamatan (District)
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      placeholder="Kemayoran"
                      value={profile.district}
                      onChange={(event) =>
                        updateField("district", event.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500"
                    />
                  ) : (
                    <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                      {profile.district || "-"}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-slate-600">
                    Kelurahan / Desa (Subdistrict)
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      placeholder="Kebon Kosong"
                      value={profile.subdistrict}
                      onChange={(event) =>
                        updateField("subdistrict", event.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500"
                    />
                  ) : (
                    <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                      {profile.subdistrict || "-"}
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">
                    Kode Pos
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      placeholder="10110"
                      value={profile.postalCode}
                      onChange={(event) =>
                        updateField("postalCode", event.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500"
                    />
                  ) : (
                    <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                      {profile.postalCode || "-"}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">
                  Detail Alamat
                </label>
                {isEditing ? (
                  <textarea
                    rows={3}
                    placeholder="Nama jalan, nomor, RT/RW, patokan"
                    value={profile.address}
                    onChange={(event) =>
                      updateField("address", event.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500"
                  />
                ) : (
                  <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    {profile.address || "-"}
                  </div>
                )}
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
                    className={`flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 ${item.cardTone}`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-2xl ${item.iconTone}`}
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
              <Link
                to="/lacak-pesanan"
                className="mt-5 flex w-full cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Lihat Semua Pesanan
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  )
}

export default Profile
