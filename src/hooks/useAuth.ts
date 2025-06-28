import { useState, useEffect } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, UserProfile } from '../lib/supabase';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
  });

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const profile = await fetchUserProfile(session.user.id);
          setAuthState({
            user: session.user,
            profile,
            session,
            loading: false,
          });
        } else {
          setAuthState({
            user: null,
            profile: null,
            session: null,
            loading: false,
          });
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        setAuthState({
          user: null,
          profile: null,
          session: null,
          loading: false,
        });
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (session?.user) {
            const profile = await fetchUserProfile(session.user.id);
            setAuthState({
              user: session.user,
              profile,
              session,
              loading: false,
            });
          } else {
            setAuthState({
              user: null,
              profile: null,
              session: null,
              loading: false,
            });
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
          setAuthState({
            user: null,
            profile: null,
            session: null,
            loading: false,
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle(); // Use maybeSingle() instead of single() to handle no results gracefully

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  const createUserProfile = async (userId: string, email: string, fullName: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          id: userId,
          full_name: fullName,
          email: email,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating user profile:', error);
      return null;
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      // Sign up with email confirmation disabled
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined, // Disable email confirmation
        }
      });

      if (error) {
        return { data: null, error, success: false };
      }

      // If user is created and confirmed immediately
      if (data.user && !data.user.email_confirmed_at) {
        // For development, we'll create the profile immediately
        // In production, you might want to wait for email confirmation
        const profile = await createUserProfile(data.user.id, email, fullName);
        
        if (!profile) {
          return { 
            data: null, 
            error: { message: 'Failed to create user profile' } as AuthError, 
            success: false 
          };
        }
      }

      return { data, error: null, success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return { 
        data: null, 
        error: { message: 'An unexpected error occurred during signup' } as AuthError, 
        success: false 
      };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { data: null, error, success: false };
      }

      // Check if user profile exists, create if it doesn't
      if (data.user) {
        let profile = await fetchUserProfile(data.user.id);
        
        if (!profile) {
          // Create profile if it doesn't exist (for users created before profile system)
          profile = await createUserProfile(data.user.id, data.user.email || email, data.user.user_metadata?.full_name || 'User');
        }
      }

      return { data, error: null, success: true };
    } catch (error) {
      console.error('Signin error:', error);
      return { 
        data: null, 
        error: { message: 'An unexpected error occurred during signin' } as AuthError, 
        success: false 
      };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error, success: !error };
    } catch (error) {
      console.error('Signout error:', error);
      return { 
        error: { message: 'An unexpected error occurred during signout' } as AuthError, 
        success: false 
      };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { error, success: !error };
    } catch (error) {
      console.error('Reset password error:', error);
      return { 
        error: { message: 'An unexpected error occurred while resetting password' } as AuthError, 
        success: false 
      };
    }
  };

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };
};