import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentAuth, logoutFromBackend } from '../services/authApi';

export interface User {
  id: string;
  email: string;
  role: string;
  displayName?: string;   // company name or contact name
  avatarUrl?: string;     // optional future profile photo
}

interface AuthContextType {
  user: User | null;
  vendorProfile: any | null;
  login: (token: string, userData: User, profileData?: any) => void;
  logout: () => void;
  updateProfile: (patch: Partial<User>) => void;
  updateVendorProfile: (patch: Partial<any>) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEYS = [
  'auth_token',
  'auth_user',
  'auth_profile',
  'thhiya_signup_draft',
  'thhiya_signup_autosave',
  'thhiya_pending_plan',
  'thhiya_listing_request',
  'thhiya_selected_plan',
];

const clearAuthStorage = () => {
  AUTH_STORAGE_KEYS.forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [vendorProfile, setVendorProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = () => {
    logoutFromBackend().catch(() => undefined);
    clearAuthStorage();
    setUser(null);
    setVendorProfile(null);
  };

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');
    const savedProfile = localStorage.getItem('auth_profile');

    if (!token) {
      setIsLoading(false);
      return;
    }

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        if (savedProfile) setVendorProfile(JSON.parse(savedProfile));
      } catch (e) {
        clearAuthStorage();
      }
    }

    getCurrentAuth()
      .then((response) => {
        if (!response?.authenticated || !response?.user) {
          throw new Error('Unauthenticated');
        }

        const nextUser: User = {
          id: response.user.id,
          email: response.user.email,
          role: response.user.role,
          displayName:
            response.profile?.companyName ||
            response.profile?.contactPerson?.name ||
            response.profile?.firstName,
        };

        setUser(nextUser);
        localStorage.setItem('auth_user', JSON.stringify(nextUser));

        if (response.profile) {
          setVendorProfile(response.profile);
          localStorage.setItem('auth_profile', JSON.stringify(response.profile));
        }
      })
      .catch(() => {
        logout();
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = (token: string, userData: User, profileData?: any) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(userData));
    setUser(userData);
    if (profileData) {
      localStorage.setItem('auth_profile', JSON.stringify(profileData));
      setVendorProfile(profileData);
    }
  };

  const updateProfile = (patch: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...patch };
    setUser(updated);
    localStorage.setItem('auth_user', JSON.stringify(updated));
  };

  const updateVendorProfile = (patch: Partial<any>) => {
    if (!vendorProfile) return;
    const updated = { ...vendorProfile, ...patch };
    setVendorProfile(updated);
    localStorage.setItem('auth_profile', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{
      user,
      vendorProfile,
      login,
      logout,
      updateProfile,
      updateVendorProfile,
      isAuthenticated: !!user,
      isLoading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
