import { useEffect, useState, type ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import AppFooter from "./AppFooter"
import AppHeader from "./AppHeader"
import LoginModal from "./LoginModal"

type PageLayoutProps = {
  children: ReactNode
}

export function PageLayout({ children }: PageLayoutProps) {
  const [loginOpen, setLoginOpen] = useState(false)
  const [loginMode, setLoginMode] = useState<
    "login" | "register" | "forgot"
  >("login")
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => window.localStorage.getItem("bafain:isLoggedIn") === "true"
  )
  const navigate = useNavigate()

  useEffect(() => {
    if (loginOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [loginOpen])

  return (
    <div className="flex min-h-screen flex-col bg-white font-['Manrope'] text-slate-900">
      <AppHeader
        isLoggedIn={isLoggedIn}
        onLoginClick={() => {
          setLoginMode("login")
          setLoginOpen(true)
        }}
        onLogout={() => {
          setIsLoggedIn(false)
          window.localStorage.removeItem("bafain:isLoggedIn")
        }}
      />
      <main className="flex-1">{children}</main>
      <AppFooter />
      <LoginModal
        open={loginOpen}
        mode={loginMode}
        onClose={() => setLoginOpen(false)}
        onSwitchMode={(mode) => setLoginMode(mode)}
        onLoginSuccess={() => {
          setIsLoggedIn(true)
          window.localStorage.setItem("bafain:isLoggedIn", "true")
          navigate("/beranda")
        }}
      />
    </div>
  )
}

export default PageLayout
