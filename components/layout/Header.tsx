'use client';

import { Button } from '@/components/ui/button';

interface HeaderProps {
  userId: string;
  onLogout: () => void;
}

export default function Header({ userId, onLogout }: HeaderProps) {
  return (
    <header className="bg-white shadow border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          JamLoop CMS
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Logged in as: <strong>{userId}</strong>
          </span>
          <Button
            onClick={onLogout}
            variant="destructive"
            size="sm"
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
