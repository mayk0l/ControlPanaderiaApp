import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Shift, Expense } from "@/lib/types/database";
import { ExpenseForm, ExpenseList } from "@/components/expenses";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Control de Gastos | Control Panadería",
  description: "Registro y gestión de gastos del turno",
};

export default async function ExpensesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Obtener turno activo del usuario
  const { data: currentShift } = await supabase
    .from("shifts")
    .select("*")
    .eq("opened_by", user.id)
    .eq("status", "OPEN")
    .order("opened_at", { ascending: false })
    .limit(1)
    .single();

  const shift = currentShift as Shift | null;

  // Obtener gastos - si hay turno activo, del turno. Si no, los últimos 50 gastos del usuario
  let expenses: Expense[] = [];
  
  if (shift) {
    const { data } = await supabase
      .from("expenses")
      .select("*")
      .eq("shift_id", shift.id)
      .order("created_at", { ascending: false });
    expenses = (data || []) as Expense[];
  } else {
    // Obtener gastos de turnos anteriores del usuario
    const { data: userShifts } = await supabase
      .from("shifts")
      .select("id")
      .eq("opened_by", user.id)
      .order("opened_at", { ascending: false })
      .limit(10);
    
    if (userShifts && userShifts.length > 0) {
      const shiftIds = userShifts.map(s => s.id);
      const { data } = await supabase
        .from("expenses")
        .select("*")
        .in("shift_id", shiftIds)
        .order("created_at", { ascending: false })
        .limit(50);
      expenses = (data || []) as Expense[];
    }
  }

  return (
    <div className="animate-fade-in">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
          Control de Gastos
        </h1>
        <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-[0.3em] mt-1">
          {shift ? "Gestión de egresos del turno" : "Historial de gastos"}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario - solo si hay turno activo */}
        {shift ? (
          <ExpenseForm shiftId={shift.id} />
        ) : (
          <DashboardCard title="Registrar Gasto" borderColor="orange">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-3">
                <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="font-medium text-foreground">Sin turno abierto</p>
              <p className="text-sm text-muted-foreground mt-1">
                Abre un turno en la página de ventas para registrar gastos.
              </p>
            </div>
          </DashboardCard>
        )}
        
        {/* Lista de gastos */}
        <div className="lg:col-span-2">
          <ExpenseList 
            expenses={expenses} 
            showHistorical={!shift}
          />
        </div>
      </div>
    </div>
  );
}