import Header from "@/components/header"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import FriendsList from "./friends/FriendsList"
import SearchAndSend from "./friends/SearchAndSend"
import OutgoingRequests from "./friends/OutgoingRequests"
import IncomingRequests from "./friends/IncomingRequests"
import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"

export default function FriendsPage() {
  const { user, isLoading } = useAuth()
  const [incomingCount, setIncomingCount] = useState<number>(0)

  useEffect(() => {
    ;(async () => {
      if (isLoading) return
      const token = localStorage.getItem("jwt_token")
      if (!token) {
        setIncomingCount(0)
        return
      }
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/friends/requests`,
          { headers: { Authorization: `Bearer ${token}` } },
        )
        if (res.ok) {
          const list = await res.json()
          setIncomingCount(Array.isArray(list) ? list.length : 0)
        } else {
          setIncomingCount(0)
        }
      } catch {
        setIncomingCount(0)
      }
    })()
  }, [user, isLoading])
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold mb-4">Friends</h2>
        <Tabs defaultValue="friends">
          <TabsList className="space-x-3">
            <TabsTrigger value="friends">Friends</TabsTrigger>
            <TabsTrigger value="find">Add friends</TabsTrigger>
            <TabsTrigger value="requests">
              Requests
              {incomingCount > 0 && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-700">
                  {incomingCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <div className="mt-4 space-y-4">
            <TabsContent value="friends">
              <FriendsList />
            </TabsContent>

            <TabsContent value="find">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SearchAndSend />
                <OutgoingRequests />
              </div>
            </TabsContent>

            <TabsContent value="requests">
              <IncomingRequests />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
