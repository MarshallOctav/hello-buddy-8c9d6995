
import React, { createContext, useContext, useState, useEffect, PropsWithChildren } from 'react';
import { User, AccessLevel, Organization } from '../types';
import { getMe, getToken, removeToken, logout as apiLogout, checkPlanExpiry } from './api';

interface AuthContextType {
  user: User | null;
  organization: Organization | null;
  isLoading: boolean;
  loginUser: (userData: { id: number; name: string; email: string; phone?: string; role?: string; bio?: string; avatar_url?: string; created_at?: string }) => void;
  logout: () => void;
  upgradePlan: (plan: AccessLevel) => void;
  updateProfile: (data: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check plan expiry and update user state
  const checkUserPlanExpiry = async () => {
    try {
      const result = await checkPlanExpiry();
      if (result.success && result.data) {
        const planMap: Record<string, AccessLevel> = {
          'FREE': AccessLevel.FREE,
          'PRO': AccessLevel.PRO,
          'PREMIUM': AccessLevel.PREMIUM,
        };
        
        setUser(prev => prev ? {
          ...prev,
          plan: planMap[result.data.current_plan] || AccessLevel.FREE,
          planExpiresAt: result.data.plan_expires_at || undefined,
        } : null);

        if (result.data.downgraded) {
          console.log('Plan downgraded from', result.data.previous_plan, 'to FREE');
        }
        
        return result.data;
      }
    } catch (error) {
      console.error('Plan expiry check error:', error);
    }
    return null;
  };

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();
      console.log('Checking auth, token exists:', !!token);
      
      if (token) {
        try {
          const result = await getMe();
          console.log('getMe result:', result);
          
          if (result.success && result.user) {
            setUser({
              id: String(result.user.id),
              name: result.user.name,
              email: result.user.email,
              phone: result.user.phone || '',
              role: result.user.role || '',
              bio: result.user.bio || '',
              avatarUrl: result.user.avatar_url || '',
              joinedDate: result.user.created_at ? new Date(result.user.created_at).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) : '',
              plan: AccessLevel.FREE,
            });
            
            // Check plan expiry after user is loaded
            await checkUserPlanExpiry();
          } else if (result.message === 'Unauthenticated.' || result.message === 'Token has expired') {
            // Only remove token if it's actually invalid/expired
            console.log('Token invalid, removing...');
            removeToken();
          }
          // For other errors (network, server errors), keep the token
        } catch (error) {
          console.error('Auth check error:', error);
          // Don't remove token on network errors - might be temporary
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const loginUser = async (userData: { id: number; name: string; email: string; phone?: string; role?: string; bio?: string; avatar_url?: string; created_at?: string }) => {
    setUser({
      id: String(userData.id),
      name: userData.name,
      email: userData.email,
      phone: userData.phone || '',
      role: userData.role || '',
      bio: userData.bio || '',
      avatarUrl: userData.avatar_url || '',
      joinedDate: userData.created_at ? new Date(userData.created_at).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) : '',
      plan: AccessLevel.FREE,
    });
    
    // Check plan expiry after login
    await checkUserPlanExpiry();
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch {
      // Ignore logout API errors
    }
    removeToken();
    setUser(null);
    setOrganization(null);
  };

  const upgradePlan = (plan: AccessLevel) => {
    if (user) {
      setUser({ ...user, plan });
    }
  };

  const updateProfile = (data: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...data });
    }
  };

  const refreshUser = async () => {
    const token = getToken();
    if (token) {
      try {
        const result = await getMe();
        if (result.success && result.user) {
          // First set user data
          setUser({
            id: String(result.user.id),
            name: result.user.name,
            email: result.user.email,
            phone: result.user.phone || '',
            role: result.user.role || '',
            bio: result.user.bio || '',
            avatarUrl: result.user.avatar_url || '',
            joinedDate: result.user.created_at ? new Date(result.user.created_at).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) : '',
            plan: user?.plan || AccessLevel.FREE,
          });
          
          // Then check and update plan status from backend
          await checkUserPlanExpiry();
        }
      } catch {
        // Ignore refresh errors
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, organization, isLoading, loginUser, logout, upgradePlan, updateProfile, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
