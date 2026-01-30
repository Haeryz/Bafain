import { Link } from "react-router-dom"
import { Mail, MapPin, Phone } from "lucide-react"

export function AppFooter() {
  return (
    <footer className="bg-sky-50">
      <div className="mx-auto w-full max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr_1fr]">
          <div>
            <p className="text-lg font-semibold text-slate-900">
              PT Bafain Haridra Indonesia
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              JL. KH Agus Salim, Betek, Sananrejo, Kec. Turen, Kabupaten Malang,
              Jawa Timur 65175
            </p>
            <div className="mt-5 flex items-center gap-3 text-slate-500">
              {["IG", "FB", "IN", "YT"].map((label) => (
                <span
                  key={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-xs font-semibold"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">
              Navigasi
            </p>
            <div className="mt-4 flex flex-col gap-2 text-sm text-slate-600">
              <Link to="/beranda" className="transition hover:text-slate-900">
                Beranda
              </Link>
              <Link to="/teknologi" className="transition hover:text-slate-900">
                Teknologi
              </Link>
              <Link to="/produk" className="transition hover:text-slate-900">
                Produk
              </Link>
              <Link to="/start#tentang-kami" className="transition hover:text-slate-900">
                Tentang Kami
              </Link>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">
              Hubungi Kami
            </p>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+62 857-0733-1453</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>halo@bafain.co.id</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Malang, Jawa Timur</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6 text-center text-xs text-slate-500">
          © 2025. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

export default AppFooter
