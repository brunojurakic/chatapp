import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { UserCard } from "./UserCard"

interface User {
  id?: string
  name: string
  email: string
  picture?: string
  username?: string | null
  displayName?: string | null
  roles?: string[]
}

interface Role {
  name: string
  description: string
}

interface UserManagementProps {
  users: User[]
  roles: Role[]
  actionLoading: string | null
  roleActionLoading: { userId: string; roleName: string } | null
  onToggleRole: (userId: string, roleName: string, hasRole: boolean) => void
  onDeleteUser: (userId: string) => void
}

export const UserManagement = ({
  users,
  roles,
  actionLoading,
  roleActionLoading,
  onToggleRole,
  onDeleteUser,
}: UserManagementProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          View and manage user roles and permissions
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          {users.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              roles={roles}
              actionLoading={actionLoading}
              roleActionLoading={roleActionLoading}
              onToggleRole={onToggleRole}
              onDeleteUser={onDeleteUser}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
