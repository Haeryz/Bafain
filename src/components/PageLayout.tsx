import { useEffect, useState, type ReactNode } from "react"
import { useLocation, useNavigate } from "react-router-dom"
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
  const location = useLocation()

  useEffect(() => {
    if (loginOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [loginOpen])

  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll("main section")
    ) as HTMLElement[]

    if (!sections.length) return

    sections.forEach((section, index) => {
      if (section.dataset.revealReady === "true") return
      section.dataset.revealReady = "true"
      section.classList.add(
        "opacity-0",
        "translate-y-6",
        "pointer-events-none",
        "transition-all",
        "duration-700",
        "ease-out"
      )
      section.style.transitionDelay = `${index * 80}ms`
    })

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const target = entry.target as HTMLElement
          if (entry.isIntersecting) {
            target.classList.remove(
              "opacity-0",
              "translate-y-6",
              "pointer-events-none"
            )
            target.classList.add("opacity-100", "translate-y-0")
          } else {
            target.classList.add(
              "opacity-0",
              "translate-y-6",
              "pointer-events-none"
            )
            target.classList.remove("opacity-100", "translate-y-0")
          }
        })
      },
      { threshold: 0.2 }
    )

    sections.forEach((section) => observer.observe(section))

    return () => observer.disconnect()
  }, [location.pathname])

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
