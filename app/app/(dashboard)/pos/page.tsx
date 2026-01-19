import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Shift, Product, Category } from "@/lib/types/database";
import { BandejaCounter, SalesTerminal } from "@/components/pos";
import { EmptyState } from "@/components/ui/empty-state";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { Clock } from "lucide-react";
import { getSalesByShift } from "@/lib/actions/sales";

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

  // Obtener productos y categorías
  const [productsResult, categoriesResult, salesResult] = await Promise.all([
    supabase
      .from("products")
      .select(`*, category:categories(*)`)
      .eq("is_active", true)
      .order("name"),
    supabase
      .from("categories")
      .select("*")
      .order("name"),
    getSalesByShift(shift.id),
  ]);

  const products = (productsResult.data || []) as ProductWithCategory[];
  const categories = (categoriesResult.data || []) as Category[];
  const sales = salesResult || [];
  
  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

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

      <div className="space-y-8">
        {/* Contador de bandejas + Resumen */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <BandejaCounter shift={shift} />
          
          <DashboardCard title="📊 Resumen del Turno" borderColor="green" className="lg:col-span-2">
            <div className="grid grid-cols-3 gap-4 py-4">
              <div className="text-center p-4 bg-muted/50 rounded-xl">
                <p className="text-xs text-muted-foreground font-medium mb-1">Ventas NO PAN</p>
                <p className="text-2xl font-bold">{sales.length}</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-xl">
                <p className="text-xs text-muted-foreground font-medium mb-1">Total NO PAN</p>
                <p className="text-2xl font-bold text-success">{formatCurrency(totalSales)}</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-xl">
                <p className="text-xs text-muted-foreground font-medium mb-1">Caja Inicial</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(shift.opening_cash)}</p>
              </div>
            </div>
          </DashboardCard>
        </div>
        
        {/* Terminal de ventas */}
        <SalesTerminal
          shift={shift}
          products={products}
          categories={categories}
        />
      </div>
    </div>
  );
}
