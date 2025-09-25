// src/hooks/useAuth.ts
import { useAuth0 } from '@auth0/auth0-react';

export type UserRole = 'admin' | 'shop_owner';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export const useAuth = () => {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    loginWithRedirect, 
    logout,
    getAccessTokenSilently 
  } = useAuth0();

  // Extract role from the custom claim
  const getUserRole = (): UserRole => {
    if (!user) return 'shop_owner';
    const roleClaimKey = 'https://yourapp.com/role';
    return (user as any)[roleClaimKey] || 'shop_owner';
  };

  const authUser: AuthUser | null = user ? {
    id: user.sub || '',
    email: user.email || '',
    name: user.name || '',
    role: getUserRole()
  } : null;

  const isAdmin = () => {
    return authUser?.role === 'admin';
  };

  const isShopOwner = () => {
    return authUser?.role === 'shop_owner';
  };

  const hasRole = (role: UserRole) => {
    return authUser?.role === role;
  };

  const login = () => {
    loginWithRedirect({
      appState: {
        returnTo: window.location.pathname
      }
    });
  };

  const logoutUser = () => {
    logout({
      logoutParams: {
        returnTo: window.location.origin
      }
    });
  };

  return {
    user: authUser,
    isAuthenticated,
    isLoading,
    isAdmin,
    isShopOwner,
    hasRole,
    login,
    logout: logoutUser,
    getAccessTokenSilently
  };
};