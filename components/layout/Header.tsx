'use client';

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
          <button
            onClick={onLogout}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
