import { useEffect, useState, type ReactNode } from "react"
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
        onLoginClick={() => {
          setLoginMode("login")
          setLoginOpen(true)
        }}
      />
      <main className="flex-1">{children}</main>
      <AppFooter />
      <LoginModal
        open={loginOpen}
        mode={loginMode}
        onClose={() => setLoginOpen(false)}
        onSwitchMode={(mode) => setLoginMode(mode)}
      />
    </div>
  )
}

export default PageLayout
