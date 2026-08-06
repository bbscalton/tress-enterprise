import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Car,
  Calendar,
  FileText,
  MapPin,
  MessageCircle,
  CheckSquare,
  LogOut,
  Bell,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const nav = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/fleet', icon: Car, label: 'Fleet' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/rentals', icon: FileText, label: 'Rentals' },
  { to: '/map', icon: MapPin, label: 'Live Map' },
  { to: '/chat', icon: MessageCircle, label: 'Chat' },
  { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-slate-800 border-r border-slate-700 flex-col">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold text-brand-500">Tress Enterprise</h1>
          <p className="text-xs text-slate-400 mt-1">Business Dashboard</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-slate-700'
                }`
              }
            >
              <Icon size={20} />
              <span className="font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 mb-3">
            {user?.photoURL ? (
              <img src={user.photoURL} className="w-10 h-10 rounded-full" alt="" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-sm font-bold">
                {user?.displayName?.[0]}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.displayName}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={signOut} className="btn-secondary w-full flex items-center justify-center gap-2 text-sm py-2">
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700">
          <h1 className="font-bold text-brand-500">Tress Enterprise</h1>
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-2">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {menuOpen && (
          <nav className="lg:hidden bg-slate-800 border-b border-slate-700 p-2">
            {nav.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl ${
                    isActive ? 'bg-brand-600' : 'hover:bg-slate-700'
                  }`
                }
              >
                <Icon size={20} />
                {label}
              </NavLink>
            ))}
            <button onClick={signOut} className="flex items-center gap-3 px-4 py-3 w-full text-left hover:bg-slate-700 rounded-xl">
              <LogOut size={20} /> Sign out
            </button>
          </nav>
        )}

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden flex border-t border-slate-700 bg-slate-800">
          {nav.slice(0, 5).map(({ to, icon: Icon, label }) => {
            const active = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={`flex-1 flex flex-col items-center py-2 text-xs ${
                  active ? 'text-brand-500' : 'text-slate-400'
                }`}
              >
                <Icon size={20} />
                <span className="mt-1">{label.split(' ')[0]}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
