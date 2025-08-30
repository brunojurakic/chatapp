import { useState, useEffect } from "react"
import Header from "../header"
import { apiUtils, errorUtils } from "@/utils/apiUtils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { CheckIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Loader2,
  Users,
  Shield,
  UserCheck,
  Settings,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

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

const RoleCheckboxItem = ({
  checked,
  onCheckedChange,
  disabled,
  loading,
  children,
  onSelect,
}: {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  loading?: boolean
  children: React.ReactNode
  onSelect?: (e: Event) => void
}) => {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      className="focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      onSelect={onSelect}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        {loading ? (
          <Loader2 className="size-3 animate-spin" />
        ) : (
          <DropdownMenuPrimitive.ItemIndicator>
            <CheckIcon className="size-4" />
          </DropdownMenuPrimitive.ItemIndicator>
        )}
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  )
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

  const deleteUser = async (userId: string, userName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete user "${userName}"? This action cannot be undone and will delete all of their data including messages, friendships, and roles.`,
      )
    ) {
      return
    }

    setActionLoading(userId)
    try {
      const response = await apiUtils.authenticatedRequest(
        `/api/admin/users/${userId}`,
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
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Users
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.totalUsers || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Registered users
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Admin Users
                  </CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.adminUsers || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Users with admin privileges
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Regular Users
                  </CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.regularUsers || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Standard user accounts
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  View and manage user roles and permissions
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-4">
                  {users.map((userItem) => (
                    <div
                      key={userItem.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg gap-3 sm:gap-4"
                    >
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={userItem.picture} />
                          <AvatarFallback>
                            {getInitials(userItem.displayName || userItem.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {userItem.displayName || userItem.name}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {userItem.email}
                          </p>
                          {userItem.username && (
                            <p className="text-sm text-muted-foreground truncate">
                              @{userItem.username}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="flex-shrink-0">
                              <Settings className="h-4 w-4" />
                              <span className="hidden sm:ml-2 sm:inline">
                                Manage Roles
                              </span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-56 max-w-[calc(100vw-2rem)]">
                            <DropdownMenuLabel>
                              Role Management
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {roles.map((role) => (
                              <RoleCheckboxItem
                                key={role.name}
                                checked={
                                  userItem.roles?.includes(role.name) || false
                                }
                                onCheckedChange={(checked) =>
                                  toggleRole(userItem.id!, role.name, !checked)
                                }
                                onSelect={(e) => e.preventDefault()}
                                disabled={
                                  roleActionLoading?.userId === userItem.id &&
                                  roleActionLoading?.roleName === role.name
                                }
                                loading={
                                  roleActionLoading?.userId === userItem.id &&
                                  roleActionLoading?.roleName === role.name
                                }
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {role.name}
                                  </span>
                                  {role.description && (
                                    <span className="text-xs text-muted-foreground">
                                      {role.description}
                                    </span>
                                  )}
                                </div>
                              </RoleCheckboxItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            deleteUser(
                              userItem.id!,
                              userItem.displayName || userItem.name,
                            )
                          }
                          disabled={actionLoading === userItem.id}
                          className="flex-shrink-0"
                        >
                          {actionLoading === userItem.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4" />
                              <span className="hidden sm:ml-2 sm:inline">
                                Delete
                              </span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default AdminPage
