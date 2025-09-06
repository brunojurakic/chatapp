import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Shield, UserCheck, MessageSquare } from "lucide-react"

interface SystemStats {
  totalUsers: number
  adminUsers: number
  regularUsers: number
  totalMessages: number
}

interface SystemStatsProps {
  stats: SystemStats | null
}

export const SystemStats = ({ stats }: SystemStatsProps) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
          <p className="text-xs text-muted-foreground">Registered users</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.adminUsers || 0}</div>
          <p className="text-xs text-muted-foreground">
            Users with admin privileges
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Regular Users</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.regularUsers || 0}</div>
          <p className="text-xs text-muted-foreground">
            Standard user accounts
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalMessages || 0}</div>
          <p className="text-xs text-muted-foreground">
            Messages sent in total
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
