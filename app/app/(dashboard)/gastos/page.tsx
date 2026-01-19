import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Shift, Expense } from "@/lib/types/database";
import { ExpenseForm, ExpenseList } from "@/components/expenses";
import { EmptyState } from "@/components/ui/empty-state";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { Clock } from "lucide-react";

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
            Control de Gastos
          </h1>
          <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-[0.3em] mt-1">
            Gestión de egresos del turno
          </p>
        </header>

        <DashboardCard className="max-w-lg mx-auto">
          <EmptyState
            icon={Clock}
            title="No hay turno abierto"
            description="Abre un turno para registrar gastos del día."
          />
        </DashboardCard>
      </div>
    );
  }

  // Obtener gastos del turno
  const { data: expenses } = await supabase
    .from("expenses")
    .select("*")
    .eq("shift_id", shift.id)
    .order("created_at", { ascending: false });

  return (
    <div className="animate-fade-in">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
          Control de Gastos
        </h1>
        <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-[0.3em] mt-1">
          Gestión de egresos del turno
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario */}
        <ExpenseForm shiftId={shift.id} />
        
        {/* Lista de gastos */}
        <div className="lg:col-span-2">
          <ExpenseList expenses={(expenses || []) as Expense[]} />
        </div>
      </div>
    </div>
  );
}