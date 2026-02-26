import { useEffect, useMemo, useState } from "react"
import { Link, NavLink } from "react-router-dom"
import {
  Building2,
  Cpu,
  Home,
  LogOut,
  Menu,
  Package,
  ShoppingCart,
  User,
  X,
} from "lucide-react"
import { useCartStore } from "@/stores/cart/useCartStore"

const navItems = [
  { label: "Beranda", to: "/beranda", Icon: Home },
  { label: "Teknologi", to: "/teknologi", Icon: Cpu },
  { label: "Produk", to: "/produk", Icon: Package },
  { label: "Tentang Kami", to: "/tentang-kami", Icon: Building2 },
]

type AppHeaderProps = {
  onLoginClick?: () => void
  isLoggedIn?: boolean
  onLogout?: () => void
}

export function AppHeader({ onLoginClick, isLoggedIn, onLogout }: AppHeaderProps) {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { items, subtotal, isLoading, error, loadCart } = useCartStore()

  useEffect(() => {
    loadCart()
  }, [isLoggedIn, loadCart])

  const itemCount = useMemo(() => items.length, [items])
  const formatIdr = (value: number) =>
    `Rp ${value.toLocaleString("id-ID")}`

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <Link to="/beranda" className="flex items-center">
            <img
              src="/Logo PT Bafain Haridra Indonesia.png"
              alt="Bafain Haridra Indonesia"
              className="h-10 w-auto"
            />
          </Link>
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
          <button
            type="button"
            onClick={() =>
              setMobileMenuOpen((prev) => {
                const next = !prev
                if (next) {
                  setCartOpen(false)
                  setProfileMenuOpen(false)
                }
                return next
              })
            }
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900 md:hidden"
            aria-haspopup="menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-main-menu"
            aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          <div className="hidden items-center gap-3 md:flex">
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setCartOpen((prev) => {
                    const next = !prev
                    if (next) {
                      setProfileMenuOpen(false)
                      setMobileMenuOpen(false)
                    }
                    return next
                  })
                }
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
                aria-haspopup="dialog"
                aria-expanded={cartOpen}
              >
                <ShoppingCart className="h-5 w-5" />
              </button>
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-semibold text-white">
                  {itemCount}
                </span>
              )}
              {cartOpen && (
                <div className="absolute right-0 top-12 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="text-sm font-semibold text-slate-900">
                      Keranjang
                    </p>
                    <p className="text-xs text-slate-500">
                      {itemCount} item dipilih
                    </p>
                  </div>
                  <div className="max-h-72 space-y-3 overflow-auto px-4 py-3 text-sm text-slate-600">
                    {!isLoggedIn && (
                      <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center">
                        <p className="text-xs text-slate-500">
                          Masuk untuk melihat keranjang.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setCartOpen(false)
                            onLoginClick?.()
                          }}
                          className="mt-3 rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                        >
                          Masuk
                        </button>
                      </div>
                    )}
                    {isLoggedIn && isLoading && (
                      <p className="text-xs text-slate-500">
                        Memuat keranjang...
                      </p>
                    )}
                    {isLoggedIn && error && (
                      <p className="text-xs text-red-500">{error}</p>
                    )}
                    {isLoggedIn && !isLoading && items.length === 0 && (
                      <p className="text-xs text-slate-500">
                        Keranjang masih kosong.
                      </p>
                    )}
                    {isLoggedIn &&
                      items.map((item) => {
                        const lineTotal =
                          (item.product?.price_idr ?? 0) * item.qty
                        return (
                          <div
                            key={item.id}
                            className="flex items-center gap-3"
                          >
                            <div className="h-12 w-12 overflow-hidden rounded-xl bg-slate-50">
                              <img
                                src={item.product?.image_url || "/hero-team.svg"}
                                alt={item.product?.title || "Produk"}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-slate-900">
                                {item.product?.title || "Produk"}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                Qty {item.qty}
                              </p>
                            </div>
                            <p className="text-xs font-semibold text-slate-900">
                              {formatIdr(lineTotal)}
                            </p>
                          </div>
                        )
                      })}
                  </div>
                  {isLoggedIn && items.length > 0 && (
                    <div className="border-t border-slate-100 px-4 py-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Subtotal</span>
                        <span className="font-semibold text-slate-900">
                          {formatIdr(subtotal)}
                        </span>
                      </div>
                      <Link
                        to="/pemesanan"
                        onClick={() => setCartOpen(false)}
                        className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                      >
                        Lihat Keranjang
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
            {isLoggedIn ? (
              <button
                type="button"
                onClick={() =>
                  setProfileMenuOpen((prev) => {
                    const next = !prev
                    if (next) {
                      setCartOpen(false)
                      setMobileMenuOpen(false)
                    }
                    return next
                  })
                }
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
                aria-haspopup="menu"
                aria-expanded={profileMenuOpen}
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
            {isLoggedIn && profileMenuOpen && (
              <div className="absolute right-0 top-14 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white text-sm shadow-lg">
                <Link
                  to="/profile"
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex w-full cursor-pointer items-center gap-2 px-4 py-3 text-left text-slate-700 transition hover:bg-slate-50"
                >
                  <User className="h-4 w-4 text-slate-500" />
                  My Profile
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setProfileMenuOpen(false)
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

          {mobileMenuOpen && (
            <div
              id="mobile-main-menu"
              className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white text-sm shadow-lg md:hidden"
            >
              <nav className="flex flex-col py-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `px-4 py-3 font-medium transition hover:bg-slate-50 ${
                        isActive ? "bg-blue-50 text-blue-700" : "text-slate-700"
                      }`
                    }
                  >
                    <span className="flex items-center gap-3">
                      <item.Icon className="h-4 w-4" />
                      {item.label}
                    </span>
                  </NavLink>
                ))}
                {isLoggedIn ? (
                  <Link
                    to="/pemesanan"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Keranjang
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      onLoginClick?.()
                    }}
                    className="flex cursor-pointer items-center gap-3 px-4 py-3 text-left font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Keranjang
                  </button>
                )}
                {isLoggedIn ? (
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <User className="h-4 w-4" />
                    Akun
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      onLoginClick?.()
                    }}
                    className="flex cursor-pointer items-center gap-3 px-4 py-3 text-left font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <User className="h-4 w-4" />
                    Akun
                  </button>
                )}
                {isLoggedIn && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      onLogout?.()
                    }}
                    className="flex cursor-pointer items-center gap-3 px-4 py-3 text-left font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                )}
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default AppHeader
