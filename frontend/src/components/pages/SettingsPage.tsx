import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from '@/components/header';
import { Navigate } from 'react-router-dom';
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Camera, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface SettingsFormData {
  displayName: string;
  profilePictureFile: File | null;
  themePreference: 'light' | 'dark' | 'system';
}

const SettingsPage = () => {
  const { user, refreshUser } = useAuth();
  const { setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState<SettingsFormData>({
    displayName: user?.displayName || user?.name || '',
    profilePictureFile: null,
    themePreference: user?.themePreference as 'light' | 'dark' | 'system' || 'system',
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        displayName: user.displayName || user.name || '',
        themePreference: user.themePreference as 'light' | 'dark' | 'system' || 'system',
      }));
    }
  }, [user]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user && (!user.username || !user.displayName)) {
    return <Navigate to="/setup" replace />;
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      setFormData(prev => ({ ...prev, profilePictureFile: file }));
      
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        throw new Error('No auth token');
      }

      const requestBody = {
        displayName: formData.displayName,
        themePreference: formData.themePreference,
      };

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        if (formData.themePreference !== (user?.themePreference || 'system')) {
          setTheme(formData.themePreference);
        }
        
        await refreshUser();
        
        if (previewUrl && !formData.profilePictureFile) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }
        
        setFormData(prev => ({ ...prev, profilePictureFile: null }));
        
        toast.success('Settings updated successfully!');
      } else {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to update settings');
      }
    } catch (error) {
      console.error('Settings update failed:', error);
      toast.error('Failed to update settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const hasChanges = 
    formData.displayName !== (user?.displayName || user?.name || '') ||
    formData.themePreference !== (user?.themePreference || 'system');

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground mt-2">
              Manage your account settings and preferences.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage 
                      src={previewUrl || user?.picture} 
                      alt={user?.name} 
                    />
                    <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-xl">
                      {user?.name ? getInitials(user.name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2"
                      disabled={true}
                    >
                      <Camera className="h-4 w-4" />
                      Change Picture
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Profile picture upload coming soon
                    </p>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      displayName: e.target.value 
                    }))}
                    placeholder="Enter your display name"
                    maxLength={50}
                  />
                  <p className="text-xs text-muted-foreground">
                    This is the name that will be displayed to other users.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={user?.username ? `@${user.username}` : ''}
                    disabled
                    className="bg-muted cursor-not-allowed"
                    placeholder="No username set"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your unique username cannot be changed.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Theme Preference</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Default Theme</Label>
                  <Select 
                    value={formData.themePreference} 
                    onValueChange={(value: 'light' | 'dark' | 'system') => 
                      setFormData(prev => ({ ...prev, themePreference: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    This will be your default theme when you log in.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={!hasChanges || isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
