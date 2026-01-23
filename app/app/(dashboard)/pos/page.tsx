import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Shift, Product, Category } from "@/lib/types/database";
import { POSTerminal } from "@/components/pos/pos-terminal";
import { ShiftPanel } from "@/components/pos/shift-panel";
import { getPanConfig } from "@/lib/actions/config";
import { getShiftStats } from "@/lib/actions/shifts";

export const metadata: Metadata = {
  title: "Terminal de Venta | Control Panadería",
  description: "Punto de venta para registrar ventas y producción de pan",
};

interface ProductWithCategory extends Product {
  category: Category | null;
}

export default async function POSPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Obtener turno activo del usuario actual
  const { data: currentShift } = await supabase
    .from("shifts")
    .select("*")
    .eq("opened_by", user.id)
    .eq("status", "OPEN")
    .order("opened_at", { ascending: false })
    .limit(1)
    .single();

  const shift = currentShift as Shift | null;

  // Obtener productos, categorías y configuración de pan
  const [productsResult, categoriesResult, panConfig] = await Promise.all([
    supabase
      .from("products")
      .select(`*, category:categories(*)`)
      .eq("is_active", true)
      .order("name"),
    supabase
      .from("categories")
      .select("*")
      .order("name"),
    getPanConfig(),
  ]);

  const products = (productsResult.data || []) as ProductWithCategory[];
  const categories = (categoriesResult.data || []) as Category[];
  
  // Obtener estadísticas del turno si existe
  const stats = shift ? await getShiftStats(shift.id) : null;

  return (
    <div className="animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="text-center md:text-left">
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
        </div>
        {shift && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-[10px] tracking-widest shadow-sm border ${
            shift.status === 'OPEN' 
              ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800' 
              : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800'
          }`}>
            <div className={`w-2 h-2 rounded-full ${shift.status === 'OPEN' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            {shift.status === 'OPEN' ? `TURNO: ${shift.opened_by_name?.toUpperCase() || 'ACTIVO'}` : 'TURNO CERRADO'}
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-20 md:pb-0">
        {/* Columna Izquierda: Catálogo y Carrito */}
        <POSTerminal
          shift={shift}
          products={products}
          categories={categories}
        />

        {/* Columna Derecha: Bandejas y Panel de Turno */}
        <ShiftPanel
          shift={shift}
          panConfig={panConfig}
          stats={stats}
        />
      </div>
    </div>
  );
}
