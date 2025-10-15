import { Moon, Sun } from "lucide-react"
import { useCallback, useRef } from "react"

import { Button } from "@/components/ui/button"
import { useTheme } from "@/hooks/use-theme"
import { useAuth } from "@/hooks/use-auth"
import { useLocation } from "react-router-dom"
import { apiUtils } from "@/utils/apiUtils"
import { toast } from "sonner"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const { user, refreshUser } = useAuth()
  const location = useLocation()
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const saveThemeToServer = useCallback(
    async (themeToSave: string) => {
      try {
        const formData = new FormData()
        formData.append("themePreference", themeToSave)

        const response = await apiUtils.authenticatedRequest(
          "/api/user/settings",
          {
            method: "PUT",
            body: formData,
          },
        )

        if (response.ok) {
          await refreshUser()
        } else {
          toast.error("Failed to save theme preference")
        }
      } catch (error) {
        console.error("Failed to update theme preference:", error)
        toast.error("Failed to save theme preference")
      }
    },
    [refreshUser],
  )

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"

    if (location.pathname === "/login" || !user) {
      setTheme(newTheme)
      return
    }

    setTheme(newTheme)

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    debounceTimeoutRef.current = setTimeout(() => {
      saveThemeToServer(newTheme)
    }, 500) // 500ms debounce delay
  }

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme}>
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
