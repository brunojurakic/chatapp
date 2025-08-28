import React from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ModeToggle } from "@/components/mode-toggle"
import { useForm } from "react-hook-form"
import type { Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { setupSchema, type SetupSchema } from "@/schemas/setupSchema"

const SetupPage: React.FC = () => {
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (user && user.username && user.displayName) {
      navigate("/home", { replace: true })
    }
  }, [user, navigate])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SetupSchema>({
    mode: "onChange",
    reValidateMode: "onChange",
    resolver: zodResolver(setupSchema) as Resolver<SetupSchema>,
    defaultValues: { username: "", displayName: user?.displayName || "" },
  })

  React.useEffect(() => {
    if (user) {
      reset({
        username: user.username || "",
        displayName: user.displayName || "",
      })
    }
  }, [user, reset])

  const submit = async (data: SetupSchema) => {
    setError(null)
    const token = localStorage.getItem("jwt_token")
    if (!token) return navigate("/login")

    setLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/setup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: data.username,
          displayName: data.displayName,
        }),
      })

      if (res.ok) {
        try {
          await refreshUser()
        } catch {
          /* empty */
        }
        navigate("/home", { replace: true })
      } else if (res.status === 409) {
        const txt = await res.text()
        if (txt === "User is already set up") {
          navigate("/home", { replace: true })
        } else {
          setError("Username already taken")
        }
      } else {
        const txt = await res.text()
        setError(txt || "Failed to set username")
      }
    } catch {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>

      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-emerald-600 text-xl">
              Set up your account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit(submit)}>
              <p className="text-sm text-muted-foreground mb-2">
                Choose a unique username and a display name shown to others.
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Username
                </label>
                <div className="flex mb-1">
                  <span className="inline-flex items-center px-3 text-sm border border-r-0 rounded-l-md bg-muted">
                    @
                  </span>
                  <Input
                    {...register("username")}
                    className={
                      (errors.username ? "border-destructive" : "") +
                      " rounded-l-none "
                    }
                    placeholder="your-username"
                  />
                </div>
                {errors.username && (
                  <p className="text-sm text-destructive">
                    {errors.username.message as string}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Display name
                </label>
                <Input
                  {...register("displayName")}
                  className={errors.displayName ? "border-destructive" : ""}
                  placeholder="Your display name"
                />
                {errors.displayName && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.displayName.message as string}
                  </p>
                )}
              </div>

              {error && <div className="text-sm text-destructive">{error}</div>}

              <div className="flex justify-end">
                <Button type="submit" disabled={loading} className="mt-3">
                  {loading ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SetupPage
