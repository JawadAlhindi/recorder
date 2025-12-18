import { createContext, useContext, useEffect, useState } from 'react';

import * as youtubeAuth from 'services/youtube/auth';
import * as youtubePreference from 'services/preference/youtube';

type YouTubeContextType = {
  isAuthenticated: boolean;
  isInitialized: boolean;
  signIn: () => Promise<void>;
  signOut: () => void;
  getAccessToken: () => string | null;
};

const YouTubeContext = createContext<YouTubeContextType | undefined>(undefined);

type YouTubeProviderProps = {
  children: React.ReactNode;
};

export const YouTubeProvider = ({ children }: YouTubeProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await youtubeAuth.initGoogleAuth();
        // Check for existing valid token
        const storedToken = youtubePreference.get();
        setIsAuthenticated(!!storedToken);
      } catch (error) {
        console.error('Failed to initialize Google Auth:', error);
      } finally {
        setIsInitialized(true);
      }
    };
    init();
  }, []);

  const signIn = async () => {
    await youtubeAuth.signIn();
    setIsAuthenticated(true);
  };

  const signOut = () => {
    youtubeAuth.signOut();
    setIsAuthenticated(false);
  };

  const getAccessToken = (): string | null => {
    return youtubeAuth.getAccessToken();
  };

  return (
    <YouTubeContext.Provider
      value={{ isAuthenticated, isInitialized, signIn, signOut, getAccessToken }}
    >
      {children}
    </YouTubeContext.Provider>
  );
};

export const useYouTube = (): YouTubeContextType => {
  const context = useContext(YouTubeContext);

  if (context === undefined) {
    throw new Error('useYouTube must be used within a YouTubeProvider');
  }

  return context;
};
