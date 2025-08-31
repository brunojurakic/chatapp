import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import { RoleCheckboxItem } from "./RoleCheckboxItem"

interface Role {
  name: string
  description: string
}

interface User {
  id?: string
  roles?: string[]
}

interface RoleManagementDropdownProps {
  user: User
  roles: Role[]
  roleActionLoading: { userId: string; roleName: string } | null
  onToggleRole: (userId: string, roleName: string, hasRole: boolean) => void
}

export const RoleManagementDropdown = ({
  user,
  roles,
  roleActionLoading,
  onToggleRole,
}: RoleManagementDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="accent" size="sm" className="flex-shrink-0">
          <Settings className="h-4 w-4" />
          <span className="hidden sm:ml-2 sm:inline">Manage Roles</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 max-w-[calc(100vw-2rem)]">
        <DropdownMenuLabel className="text-emerald-600 dark:text-emerald-500">Role Management</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {roles.map((role) => (
          <RoleCheckboxItem
            key={role.name}
            checked={user.roles?.includes(role.name) || false}
            onCheckedChange={(checked) =>
              onToggleRole(user.id!, role.name, !checked)
            }
            onSelect={(e) => e.preventDefault()}
            disabled={
              roleActionLoading?.userId === user.id &&
              roleActionLoading?.roleName === role.name
            }
            loading={
              roleActionLoading?.userId === user.id &&
              roleActionLoading?.roleName === role.name
            }
          >
            <div className="flex flex-col">
              <span className="font-medium">{role.name}</span>
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
  )
}
