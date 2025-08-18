import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

interface Friend {
  id: string
  name: string
  username?: string
  picture?: string
}

export default function FriendsList() {
  const [friends, setFriends] = useState<Friend[]>([])
  const [loading, setLoading] = useState(false)
  const token = localStorage.getItem('jwt_token')

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      if (!token) { setLoading(false); return }
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/friends`, { headers: { Authorization: `Bearer ${token}` } })
        if (res.ok) setFriends(await res.json())
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    })()
  }, [token])

  return (
    <Card className="shadow-lg border-2">
      <CardHeader>
        <CardTitle>Your Friends</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading friends...</span>
          </div>
        ) : friends.length === 0 ? (
          <p className="text-muted-foreground">You have no friends yet</p>
        ) : (
          friends.map((f) => (
            <div key={f.id} className="flex items-center justify-between p-2 border-b last:border-b-0">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  {f.picture ? <AvatarImage src={f.picture} /> : <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-sm">{f.name?.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>}
                </Avatar>
                <div>
                  <div className="font-medium">{f.name}</div>
                  <div className="text-xs text-muted-foreground">{f.username ? `@${f.username}` : ''}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
