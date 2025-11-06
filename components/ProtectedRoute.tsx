'use client';

import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);

  // Only run on mount to prevent hydration mismatch
  useEffect(() => {
    // This is the recommended pattern for preventing hydration errors in Next.js
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (hasMounted && !isAuthenticated) {
      router.push('/login');
    }
  }, [hasMounted, isAuthenticated, router]);

  // Prevent hydration mismatch by showing consistent loading state
  if (!hasMounted) {
    return <div className="min-h-screen bg-gray-50"></div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
