import { Metadata } from "next";
import { getPanConfig, getProfiles } from "@/lib/actions/config";
import { PanConfigForm, UsersList, ThemeSelector } from "@/components/config";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Configuración | Control Panadería",
  description: "Ajustes del sistema y gestión de usuarios",
};

export default async function ConfigPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Obtener perfil para verificar si es admin
  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id)
    .single();
  
  const isAdmin = currentProfile?.role === 'admin';
  
  const [panConfig, users] = await Promise.all([
    getPanConfig(),
    getProfiles(),
  ]);

  return (
    <div className="animate-fade-in">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
          Configuración
        </h1>
        <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-[0.3em] mt-1">
          Ajustes del sistema
        </p>
      </header>

      <div className="space-y-8">
        {/* Apariencia */}
        <ThemeSelector />
        
        {/* Configuración de pan */}
        <PanConfigForm config={panConfig} />
        
        {/* Usuarios */}
        <UsersList users={users} currentUserId={user?.id} isAdmin={isAdmin} />
      </div>
    </div>
  );
}
