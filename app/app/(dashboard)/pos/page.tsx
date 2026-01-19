import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Shift } from "@/lib/types/database";
import { BandejaCounter } from "@/components/pos";
import { EmptyState } from "@/components/ui/empty-state";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Terminal de Venta | Control Panadería",
  description: "Punto de venta para registrar ventas y producción de pan",
};

export default async function POSPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Obtener turno activo
  const { data: currentShift } = await supabase
    .from("shifts")
    .select("*")
    .eq("opened_by", user.id)
    .eq("status", "OPEN")
    .order("opened_at", { ascending: false })
    .limit(1)
    .single();

  const shift = currentShift as Shift | null;

  // Si no hay turno abierto, mostrar mensaje
  if (!shift) {
    return (
      <div className="animate-fade-in">
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
            Terminal de Venta
          </h1>
          <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-[0.3em] mt-1">
            {new Date().toLocaleDateString('es-CL', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}
          </p>
        </header>

        <DashboardCard className="max-w-lg mx-auto">
          <EmptyState
            icon={Clock}
            title="No hay turno abierto"
            description="Abre un turno desde el botón en el header para comenzar a registrar ventas y producción."
          />
        </DashboardCard>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
          Terminal de Venta
        </h1>
        <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-[0.3em] mt-1">
          {new Date().toLocaleDateString('es-CL', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
          })}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Columna izquierda: Ventas NO PAN */}
        <DashboardCard title="🛒 Ventas NO PAN" borderColor="blue">
          <p className="text-muted-foreground py-8 text-center">
            Próximamente: Catálogo de productos y carrito
          </p>
        </DashboardCard>
        
        {/* Columna derecha: Pan y resumen */}
        <div className="space-y-8">
          {/* Contador de bandejas */}
          <BandejaCounter shift={shift} />
          
          {/* Resumen del turno */}
          <DashboardCard title="📊 Resumen del Turno" borderColor="green">
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="text-center p-4 bg-muted/50 rounded-xl">
                <p className="text-xs text-muted-foreground font-medium mb-1">Ventas</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-xl">
                <p className="text-xs text-muted-foreground font-medium mb-1">Total</p>
                <p className="text-2xl font-bold text-success">$0</p>
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
