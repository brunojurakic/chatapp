import Header from "@/components/header"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import FriendsList from "../friends/FriendsList"
import SearchAndSend from "../friends/SearchAndSend"
import OutgoingRequests from "../friends/OutgoingRequests"
import IncomingRequests from "../friends/IncomingRequests"
import { useEffect, useState, useRef } from "react"
import { useAuth } from "@/hooks/use-auth"
import { tokenUtils, apiUtils } from "@/utils/apiUtils"

export default function FriendsPage() {
  const { user, isLoading } = useAuth()
  const [incomingCount, setIncomingCount] = useState<number>(0)
  const [activeTab, setActiveTab] = useState<string>("friends")

  useEffect(() => {
    ;(async () => {
      if (isLoading) return
      if (!tokenUtils.exists()) {
        setIncomingCount(0)
        return
      }
      try {
        const res = await apiUtils.get("/api/friends/requests")
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
    const refresh = () => {
      ;(async () => {
        if (!tokenUtils.exists()) return
        try {
          const res = await apiUtils.get("/api/friends/requests")
          if (res.ok) {
            const list = await res.json()
            setIncomingCount(Array.isArray(list) ? list.length : 0)
          }
        } catch {
          /* ignore */
        }
      })()
    }
    window.addEventListener("friend:sent", refresh)
    window.addEventListener("friend:accepted", refresh)
    window.addEventListener("friend:rejected", refresh)
    window.addEventListener("friend:removed", refresh)
    return () => {
      window.removeEventListener("friend:sent", refresh)
      window.removeEventListener("friend:accepted", refresh)
      window.removeEventListener("friend:rejected", refresh)
      window.removeEventListener("friend:removed", refresh)
    }
  }, [user, isLoading])
  useEffect(() => {
    try {
      const stored = localStorage.getItem("friends:selectedTab")
      const allowed = ["friends", "find", "requests"]
      if (stored && allowed.includes(stored)) setActiveTab(stored)
    } catch {
      /* ignore */
    }

    const onSelect = (e: Event) => {
      try {
        const detail = (e as CustomEvent).detail
        const allowed = ["friends", "find", "requests"]
        if (detail && allowed.includes(detail)) setActiveTab(detail)
      } catch {
        /* ignore */
      }
    }
    window.addEventListener("friends:selectTab", onSelect)
    return () => window.removeEventListener("friends:selectTab", onSelect)
  }, [])

  const _persistGuard = useRef(true)
  useEffect(() => {
    if (_persistGuard.current) {
      _persistGuard.current = false
      return
    }
    try {
      localStorage.setItem("friends:selectedTab", activeTab)
    } catch {
      /* ignore */
    }
  }, [activeTab])
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold mb-4 text-emerald-600 dark:text-emerald-500">
          Friends
        </h2>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
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
