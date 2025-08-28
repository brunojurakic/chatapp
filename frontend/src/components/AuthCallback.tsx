import React, { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "../hooks/use-auth"
import { Loader2 } from "lucide-react"

const AuthCallback: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setToken, user, isLoading } = useAuth()
  const [tokenSet, setTokenSet] = useState(false)

  useEffect(() => {
    const token = searchParams.get("token")

    if (token && !tokenSet) {
      setToken(token)
      setTokenSet(true)
    }
  }, [searchParams, setToken, tokenSet])

  useEffect(() => {
    if (tokenSet && !isLoading) {
      if (user) {
        navigate("/home", { replace: true })
      } else {
        navigate("/login?error=true", { replace: true })
      }
    }
  }, [tokenSet, isLoading, user, navigate])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p>Completing authentication...</p>
      </div>
    </div>
  )
}

export default AuthCallback
