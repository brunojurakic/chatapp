import { Navigate, useLocation } from "react-router-dom"
import React from "react"
import { useAuth } from "@/hooks/use-auth"
import { useUserThemeSync } from "@/hooks/use-user-theme-sync"
import { Loader2 } from "lucide-react"

interface AdminRouteProps {
  children: React.ReactNode
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  useUserThemeSync()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!user.roles?.includes("ADMIN")) {
    return <Navigate to="/home" replace />
  }

  return <>{children}</>
}

export default AdminRoute
