
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api, User } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData?: Partial<User>) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const refreshUser = async () => {
    try {
      const session = await api.getSession();
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      setUser(null);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        // Update session and user state synchronously
        setSession(session);
        
        if (session?.user) {
          // Defer user profile fetching to prevent deadlocks
          setTimeout(() => {
            refreshUser();
          }, 0);
          
          // Redirect to home if on auth page
          if (location.pathname === '/auth' || location.pathname === '/login' || location.pathname === '/signup') {
            navigate('/home');
          }
        } else {
          // User is signed out
          setUser(null);
          
          // Redirect to auth if on protected route
          const publicPaths = ['/auth', '/login', '/signup', '/forgot-password', '/welcome'];
          if (!publicPaths.includes(location.pathname)) {
            navigate('/auth');
          }
        }
        
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setTimeout(() => {
          refreshUser();
        }, 0);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const session = await api.signIn(email, password);
      
      toast({
        title: 'Login successful!',
        description: 'Welcome back to Orunlink',
      });
    } catch (error: any) {
      console.error('Error signing in:', error);
      toast({
        title: 'Login failed',
        description: error.message || 'Please check your credentials and try again',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData?: Partial<User>) => {
    try {
      setIsLoading(true);
      const result = await api.signUp(email, password, userData);
      
      if (result?.user) {
        toast({
          title: 'Account created!',
          description: 'Welcome to Orunlink! Your profile is being set up.',
        });
      } else {
        toast({
          title: 'Account created!',
          description: 'Please check your email to verify your account, then sign in.',
        });
      }
    } catch (error: any) {
      console.error('Error signing up:', error);
      toast({
        title: 'Signup failed',
        description: error.message || 'There was an error creating your account',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await api.signOut();
      
      setUser(null);
      setSession(null);
      
      toast({
        title: 'Logged out successfully',
        description: 'You have been signed out of your account',
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'Logout error',
        description: 'There was an issue signing out',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      setIsLoading(true);
      const updatedProfile = await api.updateProfile(data);
      setUser(prev => prev ? { ...prev, ...updatedProfile } : updatedProfile);
      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated',
      });
    } catch (error: any) {
      toast({
        title: 'Update failed',
        description: error.message || 'Failed to update profile',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!user,
        isLoading,
        signIn,
        signUp,
        signOut,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
