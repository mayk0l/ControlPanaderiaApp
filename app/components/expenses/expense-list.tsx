"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { deleteExpense } from "@/lib/actions/expenses";
import { Expense, ExpenseOrigin } from "@/lib/types/database";
import { useRouter } from "next/navigation";
import { Trash2, Receipt } from "lucide-react";

interface ExpenseListProps {
  expenses: Expense[];
  showHistorical?: boolean;
}

const ORIGIN_CONFIG: Record<ExpenseOrigin, { label: string; emoji: string; variant: "default" | "secondary" | "warning" }> = {
  GENERAL: { label: "Caja", emoji: "💵", variant: "default" },
  PAN: { label: "Pan", emoji: "🍞", variant: "warning" },
  NO_PAN: { label: "No Pan", emoji: "📦", variant: "secondary" },
};

export function ExpenseList({ expenses, showHistorical = false }: ExpenseListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("es-CL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDelete = (expenseId: string) => {
    if (!confirm("¿Estás seguro de eliminar este gasto?")) return;
    
    startTransition(async () => {
      await deleteExpense(expenseId);
      router.refresh();
    });
  };

  // Calcular totales por origen
  const totalGeneral = expenses
    .filter((e) => e.origin === "GENERAL")
    .reduce((sum, e) => sum + e.amount, 0);
  const totalPan = expenses
    .filter((e) => e.origin === "PAN")
    .reduce((sum, e) => sum + e.amount, 0);
  const totalNoPan = expenses
    .filter((e) => e.origin === "NO_PAN")
    .reduce((sum, e) => sum + e.amount, 0);
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <DashboardCard 
      title={showHistorical ? "📋 Historial de Gastos" : "📋 Gastos del Turno"} 
      borderColor="default"
    >
      {/* Resumen */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="p-3 bg-muted/50 rounded-xl text-center">
          <p className="text-xs text-muted-foreground mb-1">💵 Caja</p>
          <p className="font-bold text-destructive">{formatCurrency(totalGeneral)}</p>
        </div>
        <div className="p-3 bg-muted/50 rounded-xl text-center">
          <p className="text-xs text-muted-foreground mb-1">🍞 Pan</p>
          <p className="font-bold text-warning">{formatCurrency(totalPan)}</p>
        </div>
        <div className="p-3 bg-muted/50 rounded-xl text-center">
          <p className="text-xs text-muted-foreground mb-1">📦 No Pan</p>
          <p className="font-bold">{formatCurrency(totalNoPan)}</p>
        </div>
        <div className="p-3 bg-destructive/10 rounded-xl text-center border border-destructive/20">
          <p className="text-xs text-muted-foreground mb-1">Total</p>
          <p className="font-bold text-destructive">{formatCurrency(total)}</p>
        </div>
      </div>

      {/* Lista */}
      {expenses.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Sin gastos"
          description="No hay gastos registrados en este turno"
        />
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {expenses.map((expense) => {
            const config = ORIGIN_CONFIG[expense.origin as ExpenseOrigin];
            return (
              <div
                key={expense.id}
                className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors"
              >
                <span className="text-2xl">{config.emoji}</span>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{expense.description}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">
                      {formatTime(expense.created_at)}
                    </span>
                    <Badge variant={config.variant} className="text-[10px]">
                      {config.label}
                    </Badge>
                  </div>
                </div>
                
                <p className="font-bold text-destructive whitespace-nowrap">
                  -{formatCurrency(expense.amount)}
                </p>
                
                {!showHistorical && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleDelete(expense.id)}
                    disabled={isPending}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </DashboardCard>
  );
}
