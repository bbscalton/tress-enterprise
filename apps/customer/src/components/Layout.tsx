import { NavLink, useLocation } from 'react-router-dom';
import { Home, Camera, MessageCircle, FileText, AlertTriangle, LogOut, Siren } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const nav = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/checkin', icon: Camera, label: 'Check In' },
  { to: '/chat', icon: MessageCircle, label: 'Chat' },
  { to: '/documents', icon: FileText, label: 'Docs' },
  { to: '/issues', icon: AlertTriangle, label: 'Issues' },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700">
        <div>
          <h1 className="font-bold text-brand-500">Tress Enterprise</h1>
          <p className="text-xs text-slate-400">Your rental portal</p>
        </div>
        <div className="flex items-center gap-3">
          <NavLink
            to="/emergency"
            className="p-2 bg-red-600 rounded-full hover:bg-red-500 transition-colors"
            title="Emergency"
          >
            <Siren size={18} />
          </NavLink>
          {user?.photoURL ? (
            <img src={user.photoURL} className="w-9 h-9 rounded-full" alt="" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center text-sm font-bold">
              {user?.displayName?.[0]}
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 p-4 overflow-auto">{children}</main>

      <nav className="flex border-t border-slate-700 bg-slate-800">
        {nav.map(({ to, icon: Icon, label }) => {
          const active = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={`flex-1 flex flex-col items-center py-3 text-xs ${
                active ? 'text-brand-500' : 'text-slate-400'
              }`}
            >
              <Icon size={22} />
              <span className="mt-1">{label}</span>
            </NavLink>
          );
        })}
      </nav>

      <button
        onClick={signOut}
        className="hidden"
        id="signout-btn"
      >
        <LogOut size={16} />
      </button>
    </div>
  );
}
