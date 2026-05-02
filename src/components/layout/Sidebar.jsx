import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, MapPin, LogOut } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { cn } from '../../utils/cn';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Chatbot AI', href: '/chatbot', icon: MessageSquare },
  { name: 'Places', href: '/places', icon: MapPin },
];

export default function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  return (
    <div className="flex h-full w-64 flex-col glass border-r bg-white/80 dark:bg-zinc-900/80">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-zinc-200 dark:border-zinc-800">
        <span className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
          KawanKampus
        </span>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4">
        <nav className="flex-1 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
                    : 'text-zinc-700 hover:bg-zinc-50 hover:text-indigo-600 dark:text-zinc-300 dark:hover:bg-white/5 dark:hover:text-indigo-400',
                  'group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors'
                )}
              >
                <item.icon
                  className={cn(
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400',
                    'mr-3 h-5 w-5 flex-shrink-0 transition-colors'
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="border-t border-zinc-200 dark:border-zinc-800 p-4">
        <div className="flex items-center w-full justify-between px-3 py-2">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-zinc-900 dark:text-white">
              {user?.name || 'User'}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate w-32">
              {user?.email || 'user@example.com'}
            </span>
          </div>
          <button
            onClick={logout}
            className="text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 transition-colors p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-500/10"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
