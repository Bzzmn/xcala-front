import { useState, useEffect, useCallback } from 'react';
import { Hub, HubCapsule } from 'aws-amplify/utils';
import { getCurrentUser, fetchAuthSession, signOut } from 'aws-amplify/auth';
import type { AuthUser } from 'aws-amplify/auth';

interface AuthState {
  user: AuthUser | null;
  idToken: string | undefined;
  isAuthenticated: boolean;
  isLoading: boolean;
  handleLogout: () => Promise<void>;
}

export const useAuth = (): AuthState => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [idToken, setIdToken] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const updateAuthState = useCallback(async () => {
    try {
      const [currentUser, session] = await Promise.all([
        getCurrentUser(),
        fetchAuthSession({ forceRefresh: true }), // Forzar refresco para obtener token fresco
      ]);
      setUser(currentUser);
      setIdToken(session.tokens?.idToken?.toString());
    } catch (error) {
      setUser(null);
      setIdToken(undefined);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    updateAuthState(); // Comprobar estado inicial al montar

    const listener = (data: HubCapsule<'auth', any>) => {
      switch (data.payload.event) {
        case 'signedIn':
        case 'autoSignIn':
          console.log('Auth Hub: User signed in, updating session.');
          updateAuthState();
          break;
        case 'signedOut':
          console.log('Auth Hub: User signed out.');
          setUser(null);
          setIdToken(undefined);
          break;
      }
    };

    const unsubscribe = Hub.listen('auth', listener);
    return () => unsubscribe(); // Limpiar el listener
  }, [updateAuthState]);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  return {
    user,
    idToken,
    isAuthenticated: !!user,
    isLoading,
    handleLogout,
  };
};
