'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import { User } from '@/types';
import { auth } from '@/lib/auth';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const currentUser = auth.getCurrentUser();
        if (currentUser) {
          // Refresh user data to get latest info
          const refreshedUser = await auth.refreshUser();
          setUser(refreshedUser);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // If refresh fails, user will be null (logged out)
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Don't show layout for auth pages
  if (pathname.startsWith('/auth')) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar currentPath={pathname} />
      <div className="ml-64">
        <Header user={user} />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
