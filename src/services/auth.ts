export interface AuthUser {
  id: string;
  email: string;
  nombre?: string;
}

export const authService = {
  async getCurrentUser(): Promise<AuthUser | null> {
    return null;
  },

  async getCurrentSession(): Promise<null> {
    return null;
  },

  onAuthStateChanged(callback: (session: null) => void) {
    return {
      unsubscribe: () => undefined,
    };
  },

  async signIn(_email: string, _password: string): Promise<void> {
    return;
  },

  async signUp(_email: string, _password: string, _nombre?: string): Promise<void> {
    return;
  },

  async signOut(): Promise<void> {
    return;
  },
};
