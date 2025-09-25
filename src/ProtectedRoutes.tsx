import React from 'react';
import { useAuth, type UserRole } from './hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  requireAuth = true 
}) => {
  const { isAuthenticated, isLoading, hasRole, login } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
    </div>;
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    login();
    return null;
  }

  // If specific role is required but user doesn't have it
  if (requiredRole && isAuthenticated && !hasRole(requiredRole)) {
    // Log out the user and redirect to login
    login();
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute