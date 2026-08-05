import { supabase } from '../lib/supabase';

export const authService = {

  async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();

    if (error) throw error;

    return data.user;
  },

  async signIn(email: string, password: string) {
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) throw error;

    return data.user;
  },

  async signUp(email: string, password: string) {
    const { data, error } =
      await supabase.auth.signUp({
        email,
        password,
      });

    if (error) {
        console.error("Supabase error:", error);
        throw error;
}

    return data.user;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;
  },

  onAuthStateChanged(callback: (user: any) => void) {

    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ?? null);
    });

  }

};