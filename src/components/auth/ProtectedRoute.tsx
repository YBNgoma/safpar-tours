import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  adminOnly?: boolean;
}

/**
 * Protected route wrapper that requires authentication
 * Optionally can require admin privileges
 */
export default function ProtectedRoute({ 
  children, 
  redirectTo = '/api/auth/signin',
  adminOnly = false 
}: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading

    if (!session) {
      router.replace(redirectTo);
      return;
    }

    // Check for admin role if required
    if (adminOnly) {
      // You can customize this logic based on your Auth0 user roles/metadata
      const userEmail = session.user?.email;
      const isAdmin = userEmail?.includes('admin') || userEmail === 'admin@safpar.com';
      
      if (!isAdmin) {
        router.replace('/unauthorized');
        return;
      }
    }
  }, [session, status, router, redirectTo, adminOnly]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-8">Please sign in to access this page.</p>
          <button
            onClick={() => router.push('/api/auth/signin')}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (adminOnly) {
    const userEmail = session.user?.email;
    const isAdmin = userEmail?.includes('admin') || userEmail === 'admin@safpar.com';
    
    if (!isAdmin) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-8">You don't have permission to access this page.</p>
            <button
              onClick={() => router.push('/')}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded"
            >
              Go Home
            </button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}