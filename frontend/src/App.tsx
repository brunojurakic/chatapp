import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { ThemeProvider } from "./components/theme-provider"
import { Toaster } from "./components/ui/sonner"
import ProtectedRoute from "./components/ProtectedRoute"
import SetupRoute from "./components/SetupRoute"
import LoginPage from "./components/pages/LoginPage"
import HomePage from "./components/pages/HomePage"
import SetupPage from "./components/pages/SetupPage"
import SettingsPage from "./components/pages/SettingsPage"
import AuthCallback from "./components/AuthCallback"
import FriendsPage from "./components/pages/FriendsPage"
import ChatPage from "./components/pages/ChatPage"

const App = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="flow-ui-theme">
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/setup"
              element={
                <SetupRoute>
                  <SetupPage />
                </SetupRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/friends"
              element={
                <ProtectedRoute>
                  <FriendsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat/:id"
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route
              path="*"
              element={
                <ProtectedRoute>
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-4xl font-bold">404</h1>
                      <p className="text-muted-foreground">Page not found</p>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
