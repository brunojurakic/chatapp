import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Loader2, Trash2 } from "lucide-react"
import { RoleManagementDropdown } from "./RoleManagementDropdown"

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

interface UserCardProps {
  user: User
  roles: Role[]
  actionLoading: string | null
  roleActionLoading: { userId: string; roleName: string } | null
  onToggleRole: (userId: string, roleName: string, hasRole: boolean) => void
  onDeleteUser: (userId: string) => void
}

export const UserCard = ({
  user,
  roles,
  actionLoading,
  roleActionLoading,
  onToggleRole,
  onDeleteUser,
}: UserCardProps) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg gap-3 sm:gap-4">
      <div className="flex items-center space-x-4">
        <Avatar>
          <AvatarImage src={user.picture} />
          <AvatarFallback>
            {getInitials(user.displayName || user.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">
            {user.displayName || user.name}
          </p>
          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
          {user.username && (
            <p className="text-sm text-muted-foreground truncate">
              @{user.username}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <RoleManagementDropdown
          user={user}
          roles={roles}
          roleActionLoading={roleActionLoading}
          onToggleRole={onToggleRole}
        />

        <Button
          variant="default"
          size="sm"
          onClick={() => onDeleteUser(user.id!)}
          disabled={actionLoading === user.id}
          className="flex-shrink-0"
        >
          {actionLoading === user.id ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Trash2 className="h-4 w-4 text-red-500 dark:text-red-800" />
              <span className="hidden sm:ml-2 sm:inline text-red-500 dark:text-red-800">Delete</span>
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
