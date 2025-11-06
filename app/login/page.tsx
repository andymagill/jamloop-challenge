'use client';

import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (userId: string) => {
    // LoginForm has already validated credentials, so just store the userId
    localStorage.setItem('jamloop_auth_user', userId);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <LoginForm onLogin={handleLogin} />
    </div>
  );
}
