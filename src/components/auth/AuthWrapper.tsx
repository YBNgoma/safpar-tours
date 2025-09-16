import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { Session } from 'next-auth';

interface AuthWrapperProps {
  children: React.ReactNode;
  session?: Session | null;
}

/**
 * Authentication wrapper component that provides NextAuth session to the entire app
 */
export default function AuthWrapper({ children, session }: AuthWrapperProps) {
  return (
    <SessionProvider session={session} refetchInterval={5 * 60}>
      {children}
    </SessionProvider>
  );
}