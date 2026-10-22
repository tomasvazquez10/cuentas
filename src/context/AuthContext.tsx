import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { authService } from '@services/authService';
import { queryClient } from '@lib/queryClient';

interface AuthContextType {
  userId: string | null;
  isLoading: boolean;
  isSignedIn: boolean;

  signIn(email: string, password: string): Promise<void>;

  signUp(email: string, password: string, nombre?: string): Promise<void>;

  signOut(): Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [userId, setUserId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const currentUserId = useRef<string | null>(null);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const authUser = await authService.getCurrentUser();
        currentUserId.current = authUser?.id ?? null;
        setUserId(currentUserId.current);
      } catch (error) {
        console.error('Error loading session', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();

    const {
      data: { subscription },
    } = authService.onAuthStateChanged((authUser) => {
      const nextUserId = authUser?.id ?? null;
      if (currentUserId.current && currentUserId.current !== nextUserId) {
        queryClient.clear();
      }
      currentUserId.current = nextUserId;
      setUserId(nextUserId);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    await authService.signIn(email, password);

    const authUser = await authService.getCurrentUser();

    currentUserId.current = authUser?.id ?? null;
    setUserId(currentUserId.current);
  };

  const signUp = async (email: string, password: string, nombre?: string) => {
    await authService.signUp(email, password, nombre);
  };

  const signOut = async () => {
    await authService.signOut();

    queryClient.clear();
    currentUserId.current = null;
    setUserId(null);
  };

  return (
    <AuthContext.Provider
      value={{
        userId,
        isLoading,
        isSignedIn: !!userId,

        signIn,

        signUp,

        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};
