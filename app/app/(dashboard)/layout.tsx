import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { LoadingOverlay } from "@/components/ui/loading";
import { Shift } from "@/lib/types/database";

async function DashboardContent({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Obtener perfil del usuario
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Obtener turno activo del día
  const today = new Date().toISOString().split('T')[0];
  const { data: currentShift } = await supabase
    .from("shifts")
    .select("*")
    .eq("date", today)
    .eq("status", "OPEN")
    .order("opened_at", { ascending: false })
    .limit(1)
    .single();

  return (
    <DashboardShell 
      user={user} 
      profile={profile}
      currentShift={currentShift as Shift | null}
    >
      {children}
    </DashboardShell>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<LoadingOverlay />}>
      <DashboardContent>{children}</DashboardContent>
    </Suspense>
  );
}
