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
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Users, Shield, UserCheck } from "lucide-react"
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

interface SystemStats {
  totalUsers: number
  adminUsers: number
  regularUsers: number
}

const AdminPage = () => {
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
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
    setActionLoading(userId)
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
      setActionLoading(null)
    }
  }

  const getRoleBadgeVariant = (roles: string[]) => {
    if (roles.includes("ADMIN")) return "destructive"
    return "secondary"
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
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
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
            <div className="grid gap-4 md:grid-cols-3">
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
              <CardContent>
                <div className="space-y-4">
                  {users.map((userItem) => (
                    <div
                      key={userItem.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={userItem.picture} />
                          <AvatarFallback>
                            {getInitials(userItem.displayName || userItem.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {userItem.displayName || userItem.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {userItem.email}
                          </p>
                          {userItem.username && (
                            <p className="text-sm text-muted-foreground">
                              @{userItem.username}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="flex flex-wrap gap-2">
                          {userItem.roles?.map((role) => (
                            <Badge
                              key={role}
                              variant={getRoleBadgeVariant([role])}
                            >
                              {role}
                            </Badge>
                          ))}
                        </div>

                        <Select
                          onValueChange={(value) =>
                            assignRole(userItem.id!, value)
                          }
                          disabled={actionLoading === userItem.id}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Assign role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            <SelectItem value="REGULAR">Regular</SelectItem>
                          </SelectContent>
                        </Select>

                        {actionLoading === userItem.id && (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        )}
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
