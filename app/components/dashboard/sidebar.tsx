"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { Profile, UserRole } from "@/lib/types";
import { 
  ShoppingCart, 
  Wallet, 
  TrendingUp, 
  Package, 
  Settings, 
  ChevronLeft,
  LogOut
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface SidebarProps {
  role: UserRole;
  user: User;
  profile: Profile | null;
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const navItems = [
  { id: 'pos', href: '/pos', label: 'Venta', icon: ShoppingCart, adminOnly: false },
  { id: 'gastos', href: '/gastos', label: 'Gastos', icon: Wallet, adminOnly: true },
  { id: 'reportes', href: '/reportes', label: 'Reportes', icon: TrendingUp, adminOnly: true },
  { id: 'productos', href: '/productos', label: 'Productos', icon: Package, adminOnly: true },
  { id: 'config', href: '/config', label: 'Ajustes', icon: Settings, adminOnly: true },
];

export function Sidebar({ role, user, profile, isCollapsed, toggleSidebar }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const filteredItems = navItems.filter(item => 
    !item.adminOnly || role === 'admin'
  );

  return (
    <aside 
      className={`
        hidden md:flex flex-col fixed left-0 top-0 z-40 h-screen
        bg-slate-900 text-white shadow-xl
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Logo */}
      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-4'} py-6 mb-4`}>
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg">
              <Package size={20} />
            </div>
            <span className="font-bold text-lg tracking-tight">Panadería</span>
          </div>
        )}
        {isCollapsed && (
          <div className="bg-primary p-2 rounded-lg">
            <Package size={20} />
          </div>
        )}
        <button 
          onClick={toggleSidebar} 
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400"
        >
          <ChevronLeft 
            size={20} 
            className={`transition-transform ${isCollapsed ? 'rotate-180' : ''}`} 
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 px-3">
        {filteredItems.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`
                flex items-center gap-3 w-full p-3 rounded-xl transition-colors
                ${isCollapsed ? 'justify-center' : ''}
                ${isActive 
                  ? 'bg-primary text-white' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }
              `}
              title={item.label}
            >
              <item.icon size={20} />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="mt-auto border-t border-slate-800 pt-6 px-3 pb-6">
        {isCollapsed ? (
          <div className="flex flex-col gap-4 items-center">
            <button 
              onClick={handleLogout}
              className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-colors"
            >
              <LogOut size={20} />
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 px-2 mb-4">
              <div 
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                  ${role === 'admin' ? 'bg-primary' : 'bg-amber-500'}
                `}
              >
                {profile?.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium capitalize truncate">
                  {profile?.name || 'Usuario'}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {profile?.username || user.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl font-bold text-sm bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
            >
              <LogOut size={18} />
              Salir
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
