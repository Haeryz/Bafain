import { type FormEvent } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import {
  ArrowRight,
  Leaf,
  Lightbulb,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import PageLayout from "@/components/PageLayout"
import { getSafeNextPath } from "@/lib/navigation"
import { useAuthStore } from "@/stores/auth/useAuthStore"

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

const authTabs = [
  { key: "masuk", label: "Masuk" },
  { key: "daftar", label: "Daftar" },
  { key: "lupa", label: "Lupa Password" },
  { key: "reset", label: "Reset Password" },
] as const

export function Start() {
  const navigate = useNavigate()
  const location = useLocation()
  const nextPath = getSafeNextPath(location.search)
  const {
    activeTab,
    setActiveTab,
    isLoggedIn,
    user,
    loginForm,
    registerForm,
    forgotForm,
    resetForm,
    submitting,
    feedback,
    updateLoginForm,
    updateRegisterForm,
    updateForgotForm,
    updateResetForm,
    passwordVisibility,
    togglePasswordVisibility,
    login,
    register,
    forgot,
    reset,
    logout,
  } = useAuthStore()

  const displayName =
    user && typeof user.display_name === "string"
      ? user.display_name.trim()
      : ""
  const displayEmail =
    user && typeof user.email === "string" ? user.email : ""

  const handleLoginSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const success = await login()
    if (!success) return
    navigate(nextPath || "/beranda", { replace: true })
  }

  const handleRegisterSubmit = async (event: FormEvent) => {
    event.preventDefault()
    await register()
  }

  const handleForgotSubmit = async (event: FormEvent) => {
    event.preventDefault()
    await forgot()
  }

  const handleResetSubmit = async (event: FormEvent) => {
    event.preventDefault()
    await reset()
  }

  return (
    <PageLayout>
      <div className="bg-[radial-gradient(1200px_600px_at_top,_#eff6ff_0%,_#ffffff_50%,_#ffffff_100%)]">
        <section className="mx-auto w-full max-w-6xl px-6 pb-16 pt-12 md:pb-20 md:pt-16">
          <div className="flex flex-col items-center gap-8 text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              Solar Dryer Bafain
            </p>
            <div>
              <h1 className="font-['Sora'] text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl md:text-5xl">
                Solar Dryer Pengering Udang Tenaga Surya
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
                Pengering udang tenaga surya kami adalah terobosan dalam
                pengolahan hasil laut, menawarkan efisiensi tanpa banding,
                higienis, dan ramah lingkungan. Optimalkan kualitas produk dan
                kurangi biaya operasional dengan teknologi terdepan.
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
                Mengapa Memilih Pengering Udang Tenaga Surya Kami?
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

        <section className="bg-slate-50">
          <div
            id="tentang-kami"
            className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20"
          >
            <div className="grid items-center gap-10 md:grid-cols-[1.1fr_0.9fr]">
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <img
                  src="/solar-diagram.svg"
                  alt="Diagram kerja teknologi solar dryer"
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-500">
                  Teknologi
                </p>
                <h2 className="mt-4 font-['Sora'] text-2xl font-semibold text-slate-900 md:text-3xl">
                  Bagaimana Teknologi Kami Bekerja?
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-slate-600">
                  Pengering udang tenaga surya kami menggunakan kombinasi panel
                  surya efisiensi tinggi dan sistem aliran udara terkontrol untuk
                  mengeringkan udang secara merata dan cepat. Ini meminimalkan
                  pembusukan dan mempertahankan rasa alami serta nutrisi.
                </p>
                <button className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
                  Pelajari Lebih Lanjut
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        <section id="akses-akun" className="bg-white">
          <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
            <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
                  Akses Akun
                </p>
                <h2 className="mt-4 font-['Sora'] text-2xl font-semibold text-slate-900 md:text-3xl">
                  Kelola kebutuhan produksi Anda di satu tempat
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-slate-600">
                  Masuk atau buat akun baru untuk memantau kinerja pengeringan,
                  jadwal produksi, hingga laporan kualitas harian. Jika lupa
                  kata sandi, kami siap membantu.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                {isLoggedIn ? (
                  <div className="space-y-5 text-sm text-slate-600">
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                          <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-emerald-900">
                            Akun Anda sudah aktif
                          </p>
                          <p className="text-xs text-emerald-700">
                            {displayName ||
                              displayEmail ||
                              "Sesi Anda tersimpan dengan aman."}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 text-xs text-slate-500">
                      <p>
                        Gunakan fitur pengelolaan produksi, pantau pesanan, dan
                        akses laporan kapan pun diperlukan.
                      </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Link
                        to="/beranda"
                        className="flex items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        Masuk Beranda
                      </Link>
                      <Link
                        to="/profile"
                        className="flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                      >
                        Lihat Profil
                      </Link>
                    </div>
                    <button
                      type="button"
                      onClick={logout}
                      className="w-full rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700 transition hover:border-rose-300 hover:text-rose-800"
                    >
                      Keluar dari Akun Ini
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-2">
                      {authTabs.map((tab) => (
                        <button
                          key={tab.key}
                          type="button"
                          onClick={() => setActiveTab(tab.key)}
                          className={`cursor-pointer rounded-full px-4 py-2 text-xs font-semibold transition ${
                            activeTab === tab.key
                              ? "bg-blue-600 text-white"
                              : "bg-white text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {activeTab === "masuk" && (
                  <form
                    onSubmit={handleLoginSubmit}
                    className="mt-6 space-y-4 text-sm text-slate-600"
                  >
                    {feedback.login && (
                      <div
                        className={`rounded-xl border px-4 py-3 text-xs font-semibold ${
                          feedback.login.type === "success"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-rose-200 bg-rose-50 text-rose-700"
                        }`}
                      >
                        {feedback.login.message}
                      </div>
                    )}
                    <div>
                      <label className="text-xs font-semibold text-slate-600">
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="nama@email.com"
                        value={loginForm.email}
                        onChange={(event) =>
                          updateLoginForm({ email: event.target.value })
                        }
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600">
                        Password
                      </label>
                      <div className="relative mt-2">
                        <input
                          type={passwordVisibility.login ? "text" : "password"}
                          required
                          autoComplete="current-password"
                          placeholder="Masukkan password"
                          value={loginForm.password}
                          onChange={(event) =>
                            updateLoginForm({ password: event.target.value })
                          }
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-16 text-sm text-slate-900 outline-none focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility("login")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 transition hover:text-slate-700"
                        >
                          {passwordVisibility.login ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={submitting.login}
                      className="w-full cursor-pointer rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {submitting.login ? "Memproses..." : "Masuk"}
                    </button>
                  </form>
                )}

                {activeTab === "daftar" && (
                  <form
                    onSubmit={handleRegisterSubmit}
                    className="mt-6 space-y-4 text-sm text-slate-600"
                  >
                    {feedback.register && (
                      <div
                        className={`rounded-xl border px-4 py-3 text-xs font-semibold ${
                          feedback.register.type === "success"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-rose-200 bg-rose-50 text-rose-700"
                        }`}
                      >
                        {feedback.register.message}
                      </div>
                    )}
                    <div>
                      <label className="text-xs font-semibold text-slate-600">
                        Nama Lengkap (opsional)
                      </label>
                      <input
                        type="text"
                        autoComplete="name"
                        placeholder="PT Mitra Laut"
                        value={registerForm.name}
                        onChange={(event) =>
                          updateRegisterForm({ name: event.target.value })
                        }
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600">
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="nama@email.com"
                        value={registerForm.email}
                        onChange={(event) =>
                          updateRegisterForm({ email: event.target.value })
                        }
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600">
                        Password
                      </label>
                      <div className="relative mt-2">
                        <input
                          type={passwordVisibility.register ? "text" : "password"}
                          required
                          autoComplete="new-password"
                          placeholder="Buat password"
                          value={registerForm.password}
                          onChange={(event) =>
                            updateRegisterForm({ password: event.target.value })
                          }
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-16 text-sm text-slate-900 outline-none focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility("register")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 transition hover:text-slate-700"
                        >
                          {passwordVisibility.register ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={submitting.register}
                      className="w-full cursor-pointer rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {submitting.register ? "Memproses..." : "Daftar Akun"}
                    </button>
                  </form>
                )}

                {activeTab === "lupa" && (
                  <form
                    onSubmit={handleForgotSubmit}
                    className="mt-6 space-y-4 text-sm text-slate-600"
                  >
                    {feedback.forgot && (
                      <div
                        className={`rounded-xl border px-4 py-3 text-xs font-semibold ${
                          feedback.forgot.type === "success"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-rose-200 bg-rose-50 text-rose-700"
                        }`}
                      >
                        {feedback.forgot.message}
                      </div>
                    )}
                    <div>
                      <label className="text-xs font-semibold text-slate-600">
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="nama@email.com"
                        value={forgotForm.email}
                        onChange={(event) =>
                          updateForgotForm({ email: event.target.value })
                        }
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submitting.forgot}
                      className="w-full cursor-pointer rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {submitting.forgot
                        ? "Memproses..."
                        : "Kirim Instruksi Reset"}
                    </button>
                  </form>
                )}

                {activeTab === "reset" && (
                  <form
                    onSubmit={handleResetSubmit}
                    className="mt-6 space-y-4 text-sm text-slate-600"
                  >
                    {feedback.reset && (
                      <div
                        className={`rounded-xl border px-4 py-3 text-xs font-semibold ${
                          feedback.reset.type === "success"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-rose-200 bg-rose-50 text-rose-700"
                        }`}
                      >
                        {feedback.reset.message}
                      </div>
                    )}
                    <div>
                      <label className="text-xs font-semibold text-slate-600">
                        Access Token / OOB Code
                      </label>
                      <input
                        type="text"
                        required
                        autoComplete="off"
                        placeholder="Tempel access token atau oobCode"
                        value={resetForm.accessToken}
                        onChange={(event) =>
                          updateResetForm({ accessToken: event.target.value })
                        }
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-900 outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600">
                        Refresh Token (opsional)
                      </label>
                      <input
                        type="text"
                        autoComplete="off"
                        placeholder="Tempel refresh token (jika ada)"
                        value={resetForm.refreshToken}
                        onChange={(event) =>
                          updateResetForm({ refreshToken: event.target.value })
                        }
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-900 outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600">
                        Password Baru
                      </label>
                      <div className="relative mt-2">
                        <input
                          type={passwordVisibility.reset ? "text" : "password"}
                          required
                          autoComplete="new-password"
                          placeholder="Masukkan password baru"
                          value={resetForm.newPassword}
                          onChange={(event) =>
                            updateResetForm({ newPassword: event.target.value })
                          }
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-16 text-sm text-slate-900 outline-none focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility("reset")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 transition hover:text-slate-700"
                        >
                          {passwordVisibility.reset ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={submitting.reset}
                      className="w-full cursor-pointer rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {submitting.reset
                        ? "Memproses..."
                        : "Simpan Password Baru"}
                    </button>
                  </form>
                )}
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  )
}

export default Start
