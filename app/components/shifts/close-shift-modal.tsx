"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { closeShift, getShiftStats } from "@/lib/actions/shifts";
import { Shift, ClosingData } from "@/lib/types/database";
import { 
  DollarSign, 
  Square, 
  TrendingUp, 
  TrendingDown,
  ShoppingCart,
  Receipt,
  Croissant
} from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading";

interface CloseShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  shift: Shift;
}

interface ShiftStatsData {
  salesCount: number;
  expensesCount: number;
  totalSales: number;
  totalExpenses: number;
  gastosCaja: number;
  gastosPan: number;
  gastosNoPan: number;
  ventaPanEstimada: number;
  ventasNoPan: number;
  expectedCash: number;
  netTotal: number;
}

export function CloseShiftModal({ isOpen, onClose, onSuccess, shift }: CloseShiftModalProps) {
  const [countedCash, setCountedCash] = useState("");
  const [panAdjustment, setPanAdjustment] = useState("");
  const [panReason, setPanReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [stats, setStats] = useState<ShiftStatsData | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (isOpen && shift) {
      setLoadingStats(true);
      getShiftStats(shift.id).then((data) => {
        if (data) {
          setStats(data);
        }
        setLoadingStats(false);
      });
    }
  }, [isOpen, shift]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cashAmount = parseFloat(countedCash);
    if (isNaN(cashAmount) || cashAmount < 0) {
      setError("Ingresa un monto válido de efectivo");
      return;
    }

    const adjustment = parseFloat(panAdjustment) || 0;
    const expectedCash = stats?.expectedCash || 0;

    const closingData: ClosingData = {
      pan_adjustment: adjustment,
      pan_reason: panReason,
      counted_cash: cashAmount,
      expected_cash: expectedCash,
      difference: cashAmount - expectedCash,
    };

    startTransition(async () => {
      const result = await closeShift(shift.id, closingData);
      if (result.success) {
        setCountedCash("");
        setPanAdjustment("");
        setPanReason("");
        onSuccess();
        onClose();
      } else {
        setError(result.error || "Error al cerrar turno");
      }
    });
  };

  const difference = stats && countedCash 
    ? parseFloat(countedCash) - stats.expectedCash 
    : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-destructive p-6 text-destructive-foreground">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-full p-2">
              <Square className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Cerrar Turno</h2>
              <p className="text-sm text-destructive-foreground/80">
                Revisa el resumen antes de cerrar
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {loadingStats ? (
            <LoadingSpinner text="Cargando resumen..." />
          ) : stats ? (
            <>
              {/* Resumen del turno */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <ShoppingCart className="h-4 w-4" />
                    <span className="text-xs">Ventas</span>
                  </div>
                  <p className="text-xl font-bold">{stats.salesCount}</p>
                  <p className="text-sm text-success font-medium">
                    {formatCurrency(stats.totalSales)}
                  </p>
                </div>

                <div className="bg-muted/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Receipt className="h-4 w-4" />
                    <span className="text-xs">Gastos</span>
                  </div>
                  <p className="text-xl font-bold">{stats.expensesCount}</p>
                  <p className="text-sm text-destructive font-medium">
                    {formatCurrency(stats.totalExpenses)}
                  </p>
                </div>

                <div className="bg-muted/50 rounded-xl p-4 col-span-2">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Croissant className="h-4 w-4" />
                    <span className="text-xs">Venta Pan Estimada</span>
                  </div>
                  <p className="text-lg font-bold">
                    {formatCurrency(stats.ventaPanEstimada)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {shift.bandejas_sacadas} bandejas
                  </p>
                </div>
              </div>

              {/* Caja esperada */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Efectivo esperado en caja</p>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(stats.expectedCash)}
                    </p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>Inicial: {formatCurrency(shift.opening_cash)}</p>
                    <p>+ Ventas: {formatCurrency(stats.totalSales)}</p>
                    <p>- Gastos Caja: {formatCurrency(stats.gastosCaja)}</p>
                  </div>
                </div>
              </div>

              {/* Input efectivo contado */}
              <div className="relative">
                <div className="absolute left-4 top-[2.5rem] text-muted-foreground">
                  <DollarSign className="h-5 w-5" />
                </div>
                <FormField
                  label="Efectivo contado en caja"
                  type="number"
                  min="0"
                  step="100"
                  value={countedCash}
                  onChange={(e) => setCountedCash(e.target.value)}
                  placeholder="0"
                  className="[&_input]:pl-12 [&_input]:text-2xl [&_input]:font-bold"
                  error={error || undefined}
                />
              </div>

              {/* Diferencia */}
              {countedCash && (
                <div className={`rounded-xl p-4 ${
                  difference === 0 
                    ? "bg-success/10 border border-success/20" 
                    : difference > 0 
                      ? "bg-warning/10 border border-warning/20"
                      : "bg-destructive/10 border border-destructive/20"
                }`}>
                  <div className="flex items-center gap-2">
                    {difference >= 0 ? (
                      <TrendingUp className={`h-5 w-5 ${difference === 0 ? "text-success" : "text-warning"}`} />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-destructive" />
                    )}
                    <span className="font-medium">
                      {difference === 0 
                        ? "Caja cuadrada ✓" 
                        : difference > 0 
                          ? `Sobrante: ${formatCurrency(difference)}`
                          : `Faltante: ${formatCurrency(Math.abs(difference))}`
                      }
                    </span>
                  </div>
                </div>
              )}

              {/* Ajuste de pan (opcional) */}
              <div className="space-y-3 pt-2 border-t">
                <p className="text-sm font-medium text-muted-foreground">
                  Ajuste de pan vendido (opcional)
                </p>
                <FormField
                  label="Ajuste ($)"
                  type="number"
                  step="100"
                  value={panAdjustment}
                  onChange={(e) => setPanAdjustment(e.target.value)}
                  placeholder="0"
                  hint="Positivo = más ventas, Negativo = menos ventas"
                />
                <FormField
                  label="Razón del ajuste"
                  type="text"
                  value={panReason}
                  onChange={(e) => setPanReason(e.target.value)}
                  placeholder="Ej: Pan devuelto, pan regalado..."
                />
              </div>
            </>
          ) : (
            <p className="text-center text-muted-foreground">No se pudo cargar el resumen</p>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="destructive"
              className="flex-1"
              disabled={isPending || loadingStats}
            >
              {isPending ? "Cerrando..." : "Cerrar Turno"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
