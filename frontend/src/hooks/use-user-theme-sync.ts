import { useEffect, useRef } from 'react';
import { useAuth } from './use-auth';
import { useTheme } from './use-theme';

export const useUserThemeSync = () => {
  const { user } = useAuth();
  const { setTheme } = useTheme();
  const hasSetInitialTheme = useRef(false);

  useEffect(() => {
    if (user?.themePreference && !hasSetInitialTheme.current) {
      const validThemes = ['light', 'dark', 'system'];
      if (validThemes.includes(user.themePreference)) {
        setTheme(user.themePreference as 'light' | 'dark' | 'system');
        hasSetInitialTheme.current = true;
      }
    }
    
    if (!user) {
      hasSetInitialTheme.current = false;
    }
  }, [user?.themePreference, user, setTheme]);
};
