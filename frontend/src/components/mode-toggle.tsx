import { Moon, Sun } from "lucide-react"

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

  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light"
    
    if (location.pathname === "/login" || !user) {
      setTheme(newTheme)
      return
    }
    
    try {
      const formData = new FormData()
      formData.append("themePreference", newTheme)

      const response = await apiUtils.authenticatedRequest(
        "/api/user/settings",
        {
          method: "PUT",
          body: formData,
        },
      )

      if (response.ok) {
        setTheme(newTheme)
        await refreshUser()
      } else {
        toast.error("Failed to save theme preference")
      }
    } catch (error) {
      console.error("Failed to update theme preference:", error)
      toast.error("Failed to save theme preference")
    }
  }

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme}>
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
