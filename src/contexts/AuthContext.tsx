
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api, User } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
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
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (session?.user) {
          // User is signed in, get their profile
          await refreshUser();
          
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

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        refreshUser();
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
      setUser(session.user);
      
      toast({
        title: 'Login successful!',
        description: 'Welcome back to Orunlink',
      });
      
      navigate('/home');
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
        setUser(result.user);
        toast({
          title: 'Account created!',
          description: 'You are now logged in',
        });
        navigate('/home');
      } else {
        toast({
          title: 'Account created!',
          description: 'You can now sign in with your new account',
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
      await api.signOut();
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
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
