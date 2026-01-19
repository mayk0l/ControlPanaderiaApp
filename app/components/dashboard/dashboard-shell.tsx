"use client";

import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { Profile, Shift } from "@/lib/types";
import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";
import { Header } from "./header";

interface DashboardShellProps {
  children: React.ReactNode;
  user: User;
  profile: Profile | null;
  currentShift: Shift | null;
}

export function DashboardShell({ children, user, profile, currentShift }: DashboardShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const role = profile?.role || 'vendedor';

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - Desktop */}
      <Sidebar 
        role={role}
        user={user}
        profile={profile}
        isCollapsed={isCollapsed}
        toggleSidebar={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Main Content */}
      <main 
        className={`
          transition-all duration-300 ease-in-out
          pb-24 md:pb-8
          ${isCollapsed ? 'md:pl-20' : 'md:pl-64'}
        `}
      >
        {/* Header con estado del turno */}
        <Header currentShift={currentShift} />

        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileNav role={role} />
    </div>
  );
}
