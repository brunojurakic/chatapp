import React, { useEffect, useState } from "react"
import { Navigate, useSearchParams } from "react-router-dom"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ModeToggle } from "@/components/mode-toggle"
import { FlowLogo } from "@/components/ui/flow-logo"
import { AlertCircle, Loader2, AlertTriangle } from "lucide-react"

const LoginPage = () => {
  const { user, login, isLoading } = useAuth()
  const [searchParams] = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [starting, setStarting] = useState(false)
  const [showWake, setShowWake] = useState(false)
  const wakeTimerRef = React.useRef<number | null>(null)

  useEffect(() => {
    if (searchParams.get("error")) {
      setError("Authentication failed. Please try again.")
    }
    return () => {
      if (wakeTimerRef.current) {
        clearTimeout(wakeTimerRef.current)
      }
    }
  }, [searchParams])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (user) {
    return <Navigate to="/home" replace />
  }

  return (
    <div className="min-h-screen flex flex-col bg-background p-4">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/20">
              <FlowLogo
                className="h-8 w-8 text-emerald-600 dark:text-emerald-400"
                size={32}
              />
            </div>
            <h1 className="text-3xl font-bold text-center">Welcome to Flow</h1>
          </div>

          <Card className="shadow-lg border-2">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">Sign in</CardTitle>
              <CardDescription className="text-center">
                Sign in to your account to continue
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="flex items-center space-x-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <Button
                onClick={() => {
                  if (starting) return
                  setStarting(true)
                  wakeTimerRef.current = window.setTimeout(
                    () => setShowWake(true),
                    3000,
                  )
                  login()
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                size="lg"
                disabled={starting}
              >
                <svg
                  className="mr-2 h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </Button>
              {showWake && (
                <div className="mt-3 flex w-full items-center justify-center space-x-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-center">
                    Server waking up... this can take up to 20 seconds
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="w-full max-w-md mx-auto mb-4">
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
          <div className="flex items-center justify-center space-x-2 text-amber-800 dark:text-amber-200">
            <AlertTriangle className="h-4 w-4 flex-shrink-0 text-yellow-500" />
            <span className="text-sm text-center">
              This project is under construction
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
