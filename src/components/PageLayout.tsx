import { useEffect, useRef, useState, type ReactNode } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import AppFooter from "./AppFooter"
import AppHeader from "./AppHeader"
import CsFloatingButton from "./CsFloatingButton"
import LoginModal from "./LoginModal"
import { useAuthStore } from "@/stores/auth/useAuthStore"

type PageLayoutProps = {
  children: ReactNode
}

export function PageLayout({ children }: PageLayoutProps) {
  const [loginOpen, setLoginOpen] = useState(false)
  const [loginMode, setLoginMode] = useState<
    "login" | "register" | "forgot"
  >("login")
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()
  const location = useLocation()
  const wasLoggedIn = useRef(isLoggedIn)

  useEffect(() => {
    if (wasLoggedIn.current && !isLoggedIn) {
      navigate("/beranda")
    }
    wasLoggedIn.current = isLoggedIn
  }, [isLoggedIn, navigate])

  useEffect(() => {
    if (!isLoggedIn) return
    const IDLE_TIMEOUT_MS = 60 * 60 * 1000
    let lastActive = Date.now()
    let timeoutId: number | null = null

    const scheduleCheck = () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId)
      }
      timeoutId = window.setTimeout(() => {
        const idleFor = Date.now() - lastActive
        if (idleFor >= IDLE_TIMEOUT_MS) {
          logout()
          return
        }
        scheduleCheck()
      }, IDLE_TIMEOUT_MS)
    }

    const markActive = () => {
      lastActive = Date.now()
      scheduleCheck()
    }

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        markActive()
      }
    }

    markActive()

    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
    ] as const
    events.forEach((event) =>
      window.addEventListener(event, markActive, { passive: true })
    )
    document.addEventListener("visibilitychange", handleVisibility)

    return () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId)
      }
      events.forEach((event) =>
        window.removeEventListener(event, markActive)
      )
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [isLoggedIn, logout])

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
        onLogout={logout}
      />
      <main className="flex-1">{children}</main>
      <AppFooter />
      <CsFloatingButton />
      <LoginModal
        open={loginOpen}
        mode={loginMode}
        onClose={() => setLoginOpen(false)}
        onSwitchMode={(mode) => setLoginMode(mode)}
        onLoginSuccess={() => {
          navigate("/beranda")
        }}
      />
    </div>
  )
}

export default PageLayout
