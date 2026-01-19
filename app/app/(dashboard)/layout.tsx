import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Shift } from "@/lib/types/database";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  // Obtener turno activo
  const { data: currentShift } = await supabase
    .from("shifts")
    .select("*")
    .eq("user_id", user.id)
    .is("closed_at", null)
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
