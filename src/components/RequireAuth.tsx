import { type ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuthStore } from "@/stores/auth/useAuthStore"

type RequireAuthProps = {
  children: ReactNode
}

export function RequireAuth({ children }: RequireAuthProps) {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
  const location = useLocation()

  if (!isLoggedIn) {
    const nextPath = `${location.pathname}${location.search}${location.hash}`
    return <Navigate to={`/start?next=${encodeURIComponent(nextPath)}`} replace />
  }

  return <>{children}</>
}

export default RequireAuth
