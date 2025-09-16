'use client';

import React from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { UserIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

/**
 * Login/Logout button component that integrates with NextAuth.js and Auth0
 */
export default function LoginButton() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="animate-pulse">
        <div className="h-10 w-24 bg-gray-300 rounded"></div>
      </div>
    );
  }

  if (session) {
    return (
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <img
            src={session.user?.image || ''}
            alt={session.user?.name || 'User'}
            className="w-8 h-8 rounded-full"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="hidden sm:block">
            <div className="text-sm font-medium text-gray-900">
              {session.user?.name || 'User'}
            </div>
            <div className="text-xs text-gray-500">
              {session.user?.email || ''}
            </div>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
        >
          <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn('auth0', { callbackUrl: '/' })}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
    >
      <UserIcon className="w-4 h-4 mr-2" />
      Sign In
    </button>
  );
}