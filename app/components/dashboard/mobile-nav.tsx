"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRole } from "@/lib/types";
import { 
  ShoppingCart, 
  Wallet, 
  TrendingUp, 
  Package, 
  Settings 
} from "lucide-react";

interface MobileNavProps {
  role: UserRole;
}

const navItems = [
  { id: 'pos', href: '/pos', label: 'Venta', icon: ShoppingCart, adminOnly: false },
  { id: 'gastos', href: '/gastos', label: 'Gastos', icon: Wallet, adminOnly: true },
  { id: 'reportes', href: '/reportes', label: 'Reportes', icon: TrendingUp, adminOnly: true },
  { id: 'productos', href: '/productos', label: 'Items', icon: Package, adminOnly: true },
  { id: 'config', href: '/config', label: 'Ajustes', icon: Settings, adminOnly: true },
];

export function MobileNav({ role }: MobileNavProps) {
  const pathname = usePathname();

  const filteredItems = navItems.filter(item => 
    !item.adminOnly || role === 'admin'
  );

  return (
    <nav 
      className="
        fixed bottom-0 left-0 right-0 z-50 md:hidden
        bg-card border-t border-border
        p-2 pb-safe
        flex justify-around items-center
        shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]
      "
    >
      {filteredItems.map(item => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <Link
            key={item.id}
            href={item.href}
            className={`
              flex flex-col items-center justify-center w-full py-1 rounded-xl transition-all
              ${isActive 
                ? 'text-primary' 
                : 'text-muted-foreground'
              }
            `}
          >
            <div 
              className={`
                p-1 rounded-lg mb-0.5
                ${isActive ? 'bg-primary/10' : ''}
              `}
            >
              <item.icon 
                size={22} 
                strokeWidth={isActive ? 2.5 : 2} 
              />
            </div>
            <span className="text-[9px] font-bold">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
