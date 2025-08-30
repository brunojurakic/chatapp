import { useState, useEffect, useRef } from "react"
import Header from "../header"
import { apiUtils, errorUtils } from "@/utils/apiUtils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import {
  SystemStats,
  UserManagement,
  DeleteUserModal,
} from "@/components/admin"

interface User {
  id?: string
  name: string
  email: string
  picture?: string
  authenticated: boolean
  username?: string | null
  displayName?: string | null
  themePreference?: string
  roles?: string[]
}

interface Role {
  name: string
  description: string
}

interface SystemStats {
  totalUsers: number
  adminUsers: number
  regularUsers: number
}

const AdminPage = () => {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [roleActionLoading, setRoleActionLoading] = useState<{
    userId: string
    roleName: string
  } | null>(null)
  const [confirmUserId, setConfirmUserId] = useState<string | null>(null)
  const [modalMounted, setModalMounted] = useState(false)
  const [modalEntered, setModalEntered] = useState(false)
  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    fetchUsers()
    fetchRoles()
    fetchStats()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await apiUtils.authenticatedRequest("/api/admin/users")
      if (response.ok) {
        const userData = await response.json()
        setUsers(userData)
      } else {
        toast.error("Failed to fetch users")
      }
    } catch (error) {
      errorUtils.handleApiError("Fetch users", error)
    }
  }

  const fetchRoles = async () => {
    try {
      const response = await apiUtils.authenticatedRequest("/api/admin/roles")
      if (response.ok) {
        const roleData = await response.json()
        setRoles(roleData)
      } else {
        toast.error("Failed to fetch roles")
      }
    } catch (error) {
      errorUtils.handleApiError("Fetch roles", error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await apiUtils.authenticatedRequest("/api/admin/stats")
      if (response.ok) {
        const statsData = await response.json()
        setStats(statsData)
      } else {
        toast.error("Failed to fetch system stats")
      }
    } catch (error) {
      errorUtils.handleApiError("Fetch stats", error)
    } finally {
      setLoading(false)
    }
  }

  const assignRole = async (userId: string, roleName: string) => {
    setRoleActionLoading({ userId, roleName })
    try {
      const response = await apiUtils.authenticatedRequest(
        `/api/admin/users/${userId}/roles?roleName=${roleName}`,
        { method: "POST" },
      )
      if (response.ok) {
        toast.success("Role assigned successfully")
        fetchUsers()
      } else {
        const error = await response.text()
        toast.error(error || "Failed to assign role")
      }
    } catch (error) {
      errorUtils.handleApiError("Assign role", error)
    } finally {
      setRoleActionLoading(null)
    }
  }

  const removeRole = async (userId: string, roleName: string) => {
    setRoleActionLoading({ userId, roleName })
    try {
      const response = await apiUtils.authenticatedRequest(
        `/api/admin/users/${userId}/roles?roleName=${roleName}`,
        { method: "DELETE" },
      )
      if (response.ok) {
        toast.success("Role removed successfully")
        fetchUsers()
      } else {
        const error = await response.text()
        toast.error(error || "Failed to remove role")
      }
    } catch (error) {
      errorUtils.handleApiError("Remove role", error)
    } finally {
      setRoleActionLoading(null)
    }
  }

  const toggleRole = async (
    userId: string,
    roleName: string,
    hasRole: boolean,
  ) => {
    if (hasRole) {
      await removeRole(userId, roleName)
    } else {
      await assignRole(userId, roleName)
    }
  }

  const deleteUser = (userId: string) => {
    openModal(userId)
  }

  const closeModal = () => {
    setModalEntered(false)
    timeoutRef.current = window.setTimeout(() => {
      setModalMounted(false)
      setConfirmUserId(null)
    }, 200)
  }

  const openModal = (userId: string) => {
    setConfirmUserId(userId)
    setModalMounted(true)
    setModalEntered(false)
    requestAnimationFrame(() => {
      setModalEntered(true)
    })
  }

  const confirmDeleteUser = async () => {
    if (!confirmUserId) return
    const userToDelete = users.find((u) => u.id === confirmUserId)
    if (!userToDelete) return

    setActionLoading(confirmUserId)
    try {
      const response = await apiUtils.authenticatedRequest(
        `/api/admin/users/${confirmUserId}`,
        { method: "DELETE" },
      )
      if (response.ok) {
        toast.success("User deleted successfully")
        fetchUsers()
        fetchStats()
      } else {
        const error = await response.text()
        toast.error(error || "Failed to delete user")
      }
    } catch (error) {
      errorUtils.handleApiError("Delete user", error)
    } finally {
      setActionLoading(null)
      closeModal()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage users and system settings
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <SystemStats stats={stats} />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UserManagement
              users={users}
              roles={roles}
              actionLoading={actionLoading}
              roleActionLoading={roleActionLoading}
              onToggleRole={toggleRole}
              onDeleteUser={deleteUser}
            />
          </TabsContent>
        </Tabs>
      </div>

      <DeleteUserModal
        isOpen={modalMounted}
        isVisible={modalEntered}
        userId={confirmUserId}
        users={users}
        isDeleting={actionLoading === confirmUserId}
        onClose={closeModal}
        onConfirm={confirmDeleteUser}
      />
    </div>
  )
}

export default AdminPage
