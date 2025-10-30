import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabase: SupabaseClient | null = null;

// Function to initialize Supabase client
const initSupabase = () => {
  if (!supabase && supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
  }

  return supabase;
};

// Getter for supabase client
export const getSupabase = () => {
  if (!supabase) {
    initSupabase();
  }

  return supabase;
};

export type User = {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
    name?: string;
  };
};

export const auth = {
  signInWithGoogle: async () => {
    const client = getSupabase();

    if (!client) {
      return { data: null, error: new Error('Supabase not configured') };
    }

    const { data, error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/',
      },
    });

    return { data, error };
  },

  signInWithEmail: async (email: string, password: string) => {
    const client = getSupabase();

    if (!client) {
      return { data: null, error: new Error('Supabase not configured') };
    }

    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    });

    return { data, error };
  },

  signUpWithEmail: async (email: string, password: string) => {
    const client = getSupabase();

    if (!client) {
      return { data: null, error: new Error('Supabase not configured') };
    }

    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + '/chat',
      },
    });

    return { data, error };
  },

  signOut: async () => {
    const client = getSupabase();

    if (!client) {
      return { error: new Error('Supabase not configured') };
    }

    const { error } = await client.auth.signOut();

    return { error };
  },

  getSession: async () => {
    const client = getSupabase();

    if (!client) {
      return { session: null, error: new Error('Supabase not configured') };
    }

    const {
      data: { session },
      error,
    } = await client.auth.getSession();

    return { session, error };
  },

  onAuthStateChange: (callback: (user: User | null) => void) => {
    const client = getSupabase();

    if (!client) {
      return { data: { subscription: null }, error: new Error('Supabase not configured') };
    }

    return client.auth.onAuthStateChange((event, session) => {
      callback(session?.user as User | null);
    });
  },
};

// Check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseKey);
};
