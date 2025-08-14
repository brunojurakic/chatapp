import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Header from '@/components/header';
import { Navigate } from 'react-router-dom';

const HomePage = () => {
  const { user } = useAuth();

  if (user && (!user.username || !user.displayName)) {
    return <Navigate to="/setup" replace />;
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Welcome, {user?.name?.split(' ')[0]}!</h2>
            <p className="text-muted-foreground">
              You're successfully authenticated.
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <Card className="shadow-lg border-2">
              <CardHeader className="text-center">
                <CardTitle className="text-lg">Your Account</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={user?.picture} alt={user?.name} />
                    <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-lg">
                      {user?.name ? getInitials(user.name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.username ? `@${user.username}` : user?.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
