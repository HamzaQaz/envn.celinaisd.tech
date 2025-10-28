import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/button';
import { LayoutDashboard, Settings, History, LogOut } from 'lucide-react';

export function Layout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r shadow-sm">
        <div className="p-4">
          <h2 className="text-xl font-bold mb-6">District Environment</h2>
          <nav className="space-y-2">
            <Link
              to="/"
              className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/history"
              className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <History className="w-5 h-5" />
              <span>History</span>
            </Link>
            <Link
              to="/admin"
              className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span>Admin</span>
            </Link>
          </nav>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
