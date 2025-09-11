import { useState, useEffect, useCallback } from "react"
import { apiUtils } from "@/utils/apiUtils"
import {
  Loader2,
  Clock,
  User,
  Activity,
  LogIn,
  LogOut,
  Plus,
  Minus,
  Trash2,
  FileText,
} from "lucide-react"
import { toast } from "sonner"

interface ActivityLog {
  id: string
  userId: string
  userName: string
  userEmail: string
  action: string
  description: string
  ipAddress?: string
  createdAt: string
}

interface ActivityLogsProps {
  limit?: number
}

export function ActivityLogs({ limit = 50 }: ActivityLogsProps) {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchActivityLogs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiUtils.authenticatedRequest(
        `/api/admin/activity-logs?limit=${limit}`,
      )

      if (response.ok) {
        const data = await response.json()
        setLogs(data)
      } else {
        const errorData = await response.text()
        setError(errorData || "Failed to fetch activity logs")
        toast.error("Failed to fetch activity logs")
      }
    } catch {
      setError("Network error occurred")
      toast.error("Network error occurred")
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    fetchActivityLogs()
  }, [fetchActivityLogs])

  const getActionIcon = (action: string) => {
    const iconClass = "h-5 w-5"
    switch (action) {
      case "LOGIN":
        return (
          <LogIn
            className={`${iconClass} text-green-600 dark:text-green-400`}
          />
        )
      case "LOGOUT":
        return (
          <LogOut
            className={`${iconClass} text-orange-600 dark:text-orange-400`}
          />
        )
      case "ROLE_ASSIGN":
        return (
          <Plus className={`${iconClass} text-blue-600 dark:text-blue-400`} />
        )
      case "ROLE_REMOVE":
        return (
          <Minus className={`${iconClass} text-red-600 dark:text-red-400`} />
        )
      case "USER_DELETE":
        return (
          <Trash2 className={`${iconClass} text-red-700 dark:text-red-300`} />
        )
      default:
        return (
          <FileText
            className={`${iconClass} text-gray-600 dark:text-gray-400`}
          />
        )
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case "LOGIN":
        return "text-green-700 dark:text-green-300"
      case "LOGOUT":
        return "text-orange-700 dark:text-orange-300"
      case "ROLE_ASSIGN":
        return "text-blue-700 dark:text-blue-300"
      case "ROLE_REMOVE":
        return "text-red-700 dark:text-red-300"
      case "USER_DELETE":
        return "text-red-800 dark:text-red-200"
      default:
        return "text-gray-700 dark:text-gray-300"
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60),
    )

    if (diffInMinutes < 1) {
      return "Just now"
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60)
      return `${hours} hour${hours === 1 ? "" : "s"} ago`
    } else {
      return date.toLocaleString()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 dark:text-red-400 mb-2">
          Error loading activity logs
        </div>
        <div className="text-sm text-muted-foreground">{error}</div>
        <button
          onClick={fetchActivityLogs}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <Activity className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Activity Timeline</h3>
        <span className="text-sm text-muted-foreground">
          ({logs.length} entries)
        </span>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No activity logs found
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-muted/50 flex items-center justify-center">
                  {getActionIcon(log.action)}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                        <span className="font-medium text-sm sm:text-base truncate">
                          {log.userName}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground hidden sm:inline">
                        ({log.userEmail})
                      </span>
                    </div>

                    <div className="mb-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getActionColor(
                          log.action,
                        )} bg-current/10`}
                      >
                        {log.action.replace("_", " ")}
                      </span>
                    </div>

                    <p className="text-sm text-foreground mb-2 leading-relaxed">
                      {log.description}
                    </p>

                    {log.ipAddress && (
                      <div className="text-xs text-muted-foreground hidden sm:block">
                        IP: {log.ipAddress}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                    <Clock className="h-3 w-3" />
                    <span className="whitespace-nowrap">
                      {formatTimestamp(log.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {logs.length >= limit && (
        <div className="text-center pt-4">
          <button
            onClick={() => fetchActivityLogs()}
            className="text-sm text-primary hover:underline px-4 py-2 min-h-[44px] sm:min-h-0"
          >
            Load more activity...
          </button>
        </div>
      )}
    </div>
  )
}
