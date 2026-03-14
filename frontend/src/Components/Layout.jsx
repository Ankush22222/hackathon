import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Package, ArrowDownToLine, Truck, ArrowRightLeft, ClipboardList, History, Settings, LogOut, User } from 'lucide-react';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/receipts', label: 'Receipts', icon: ArrowDownToLine },
  { to: '/deliveries', label: 'Deliveries', icon: Truck },
  { to: '/transfers', label: 'Transfers', icon: ArrowRightLeft },
  { to: '/adjustments', label: 'Adjustments', icon: ClipboardList },
  { to: '/move-history', label: 'Move History', icon: History },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-slate-200 flex flex-col">
        <div className="px-5 py-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold tracking-tight">CoreInventory</h2>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {links.map(l => (
            <NavLink key={l.to} to={l.to} end className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-slate-100 font-medium text-slate-900' : 'text-slate-600 hover:bg-slate-50'}`
            }>
              <l.icon size={18} />
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-slate-200 space-y-1">
          <NavLink to="/profile" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
            <User size={18} /> {user?.name || 'Profile'}
          </NavLink>
          <button onClick={logout} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 w-full">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 bg-[hsl(240,5%,98%)]">
        <Outlet />
      </main>
    </div>
  );
}
