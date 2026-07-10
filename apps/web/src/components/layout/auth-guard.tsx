'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../context/auth-context';
import { LoadingOverlay } from '../ui/button';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isGuestRoute = ['/login', '/register', '/forgot-password', '/reset-password'].includes(pathname);
  const isDashboardRoute = pathname.startsWith('/dashboard') || pathname === '/';

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated && isDashboardRoute) {
      router.replace('/login');
    } else if (isAuthenticated && isGuestRoute) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoading, isGuestRoute, isDashboardRoute, router]);

  if (isLoading) {
    return <LoadingOverlay visible={true} />;
  }

  // Prevent flash of protected UI if user is not authenticated
  if (!isAuthenticated && isDashboardRoute) {
    return <LoadingOverlay visible={true} />;
  }

  // Prevent flash of auth forms if user is already authenticated
  if (isAuthenticated && isGuestRoute) {
    return <LoadingOverlay visible={true} />;
  }

  return <>{children}</>;
}
