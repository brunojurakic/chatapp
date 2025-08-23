import { useAuth } from "@/hooks/use-auth"
import Header from "@/components/header"
import FriendsList from "@/components/friends/FriendsList"
import { Navigate } from "react-router-dom"

const HomePage = () => {
  const { user } = useAuth()

  if (user && (!user.username || !user.displayName)) {
    return <Navigate to="/setup" replace />
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex-col">
          <h2 className="text-3xl font-bold text-center mb-10">
            Welcome,{" "}
            <span className="text-emerald-600 dark:text-emerald-500">
              {user?.name?.split(" ")[0]}
            </span>
            !
          </h2>
          <FriendsList />
        </div>
      </main>
    </div>
  )
}

export default HomePage
