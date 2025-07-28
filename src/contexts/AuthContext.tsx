import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { SecurityUtils } from '@/utils/security';
import { toast } from 'sonner';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  plan: 'free' | 'pro' | 'enterprise';
  createdAt: Date;
  lastLoginAt: Date;
  isDemo?: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemo: boolean;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  loginDemo: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo user data
const DEMO_USER: User = {
  id: 'demo-user-id',
  email: 'demo@shopmatic.cc',
  name: 'Demo User',
  avatar: undefined,
  plan: 'pro',
  createdAt: new Date('2024-01-01'),
  lastLoginAt: new Date(),
  isDemo: true,
};

// Mock user database (in real app this would be backend API calls)
const MOCK_USERS = [
  {
    id: '1',
    email: 'user@example.com',
    password: 'password123', // In real app, this would be hashed
    name: 'John Doe',
    plan: 'free' as const,
    createdAt: new Date('2024-01-01'),
    lastLoginAt: new Date(),
  },
  {
    id: '2',
    email: 'pro@example.com',
    password: 'password123',
    name: 'Jane Smith',
    plan: 'pro' as const,
    createdAt: new Date('2024-01-01'),
    lastLoginAt: new Date(),
  },
];

const AUTH_STORAGE_KEY = 'shopmatic_auth';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    isDemo: false,
  });

  // Check for existing session on mount
  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!stored) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      const sessionData = JSON.parse(stored);
      const now = Date.now();

      // Check if session is expired
      if (now > sessionData.expiresAt) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      // Validate session integrity
      const expectedHash = await SecurityUtils.createHash(
        sessionData.user.id + sessionData.user.email + sessionData.timestamp
      );

      if (expectedHash !== sessionData.hash) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        setAuthState(prev => ({ ...prev, isLoading: false }));
        toast.error('Session validation failed. Please log in again.');
        return;
      }

      // Restore session
      setAuthState({
        user: {
          ...sessionData.user,
          createdAt: new Date(sessionData.user.createdAt),
          lastLoginAt: new Date(sessionData.user.lastLoginAt),
        },
        isAuthenticated: true,
        isLoading: false,
        isDemo: sessionData.user.isDemo || false,
      });

    } catch (error) {
      console.error('Session validation error:', error);
      localStorage.removeItem(AUTH_STORAGE_KEY);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const saveSession = async (user: User) => {
    const timestamp = Date.now();
    const expiresAt = timestamp + SESSION_DURATION;
    
    // Create session hash for integrity
    const hash = await SecurityUtils.createHash(
      user.id + user.email + timestamp
    );

    const sessionData = {
      user,
      timestamp,
      expiresAt,
      hash,
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionData));
  };

  const login = async (email: string, password: string): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      // Find user in mock database
      const mockUser = MOCK_USERS.find(u => u.email === email);
      
      if (!mockUser || mockUser.password !== password) {
        throw new Error('Invalid email or password');
      }

      const user: User = {
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        plan: mockUser.plan,
        createdAt: mockUser.createdAt,
        lastLoginAt: new Date(),
        isDemo: false,
      };

      await saveSession(user);

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        isDemo: false,
      });

      toast.success(`Welcome back, ${user.name}!`);
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      const message = error instanceof Error ? error.message : 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      // Check if user already exists
      const existingUser = MOCK_USERS.find(u => u.email === email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Create new user
      const newUser: User = {
        id: SecurityUtils.generateSecureRandom(16),
        email,
        name,
        plan: 'free',
        createdAt: new Date(),
        lastLoginAt: new Date(),
        isDemo: false,
      };

      // In real app, would save to backend
      MOCK_USERS.push({
        id: newUser.id,
        email,
        password, // Would be hashed in real app
        name,
        plan: 'free',
        createdAt: newUser.createdAt,
        lastLoginAt: newUser.lastLoginAt,
      });

      await saveSession(newUser);

      setAuthState({
        user: newUser,
        isAuthenticated: true,
        isLoading: false,
        isDemo: false,
      });

      toast.success(`Welcome to Shopmatic, ${name}!`);
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      const message = error instanceof Error ? error.message : 'Registration failed';
      toast.error(message);
      throw error;
    }
  };

  const loginDemo = () => {
    setAuthState({
      user: DEMO_USER,
      isAuthenticated: true,
      isLoading: false,
      isDemo: true,
    });

    // Don't save demo session to localStorage
    toast.success('Welcome to the Shopmatic demo!', {
      description: 'You can explore all features. Data will not be saved.',
    });
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isDemo: false,
    });
    toast.success('Logged out successfully');
  };

  const updateProfile = async (updates: Partial<User>): Promise<void> => {
    if (!authState.user) {
      throw new Error('No user logged in');
    }

    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      const updatedUser = { ...authState.user, ...updates };
      
      if (!authState.isDemo) {
        await saveSession(updatedUser);
      }

      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
        isLoading: false,
      }));

      toast.success('Profile updated successfully');
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      const message = error instanceof Error ? error.message : 'Profile update failed';
      toast.error(message);
      throw error;
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if user exists
    const userExists = MOCK_USERS.some(u => u.email === email);
    
    if (!userExists) {
      throw new Error('No account found with this email address');
    }

    // In real app, would send reset email
    toast.success('Password reset link sent to your email!');
  };

  const contextValue: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    loginDemo,
    updateProfile,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={contextValue}>
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