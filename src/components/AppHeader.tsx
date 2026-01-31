import { useState } from "react"
import { Link, NavLink } from "react-router-dom"
import { LogOut, User } from "lucide-react"

const navItems = [
  { label: "Beranda", to: "/beranda" },
  { label: "Teknologi", to: "/teknologi" },
  { label: "Produk", to: "/produk" },
  { label: "Tentang Kami", to: "/tentang-kami" },
]

type AppHeaderProps = {
  onLoginClick?: () => void
  isLoggedIn?: boolean
  onLogout?: () => void
}

export function AppHeader({ onLoginClick, isLoggedIn, onLogout }: AppHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <Link to="/beranda" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-white">
              <span className="text-lg font-semibold">B</span>
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-900">
                Bafain
              </p>
              <p className="text-xs text-slate-500">Solar Dryer</p>
            </div>
          </Link>
          <div className="hidden items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500 md:flex">
            <span className="font-medium text-slate-600">Astra</span>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span>Inovasi Hijau</span>
          </div>
        </div>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                `transition-colors hover:text-slate-900 ${
                  isActive ? "text-blue-600" : ""
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="relative flex items-center gap-3">
          <a
            href="#akses-akun"
            className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 md:hidden"
          >
            Menu
          </a>
          {isLoggedIn ? (
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              <User className="h-5 w-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onLoginClick}
              className="cursor-pointer rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Masuk
            </button>
          )}
          {isLoggedIn && menuOpen && (
            <div className="absolute right-0 top-14 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white text-sm shadow-lg">
              <button
                type="button"
                className="flex w-full cursor-pointer items-center gap-2 px-4 py-3 text-left text-slate-700 transition hover:bg-slate-50"
              >
                <User className="h-4 w-4 text-slate-500" />
                My Profile
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  onLogout?.()
                }}
                className="flex w-full cursor-pointer items-center gap-2 px-4 py-3 text-left text-slate-700 transition hover:bg-slate-50"
              >
                <LogOut className="h-4 w-4 text-slate-500" />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default AppHeader
