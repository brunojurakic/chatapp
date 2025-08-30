import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface User {
  id?: string
  name: string
  displayName?: string | null
}

interface DeleteUserModalProps {
  isOpen: boolean
  isVisible: boolean
  userId: string | null
  users: User[]
  isDeleting: boolean
  onClose: () => void
  onConfirm: () => void
}

export const DeleteUserModal = ({
  isOpen,
  isVisible,
  userId,
  users,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteUserModalProps) => {
  if (!isOpen) return null

  const userToDelete = users.find((u) => u.id === userId)

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity duration-200 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
    >
      <Card
        className={`w-96 transition-all duration-200 ease-out ${
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader>
          <CardTitle>Confirm User Deletion</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Are you sure you want to delete user{" "}
            <span className="font-medium">
              {userToDelete?.displayName || userToDelete?.name}
            </span>
            ? This action cannot be undone and will delete all of their related
            data.
          </p>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Delete User
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
