import { type ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { getSafeNextPath } from "@/lib/navigation"
import { useAuthStore } from "@/stores/auth/useAuthStore"

type RequireGuestProps = {
  children: ReactNode
}

export function RequireGuest({ children }: RequireGuestProps) {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
  const location = useLocation()

  if (isLoggedIn) {
    const nextPath = getSafeNextPath(location.search) || "/beranda"
    return <Navigate to={nextPath} replace />
  }

  return <>{children}</>
}

export default RequireGuest
