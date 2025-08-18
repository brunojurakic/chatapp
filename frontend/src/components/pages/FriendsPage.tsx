import Header from "@/components/header"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import FriendsList from "./friends/FriendsList"
import SearchAndSend from "./friends/SearchAndSend"
import OutgoingRequests from "./friends/OutgoingRequests"
import IncomingRequests from "./friends/IncomingRequests"

export default function FriendsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold mb-4">Friends</h2>
        <Tabs defaultValue="friends">
          <TabsList className="space-x-3">
            <TabsTrigger value="friends">Friends</TabsTrigger>
            <TabsTrigger value="find">Add friends</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
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
