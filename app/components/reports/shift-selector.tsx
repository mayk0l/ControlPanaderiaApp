'use client';

import type { Shift } from '@/lib/types/database';
import { formatMoney } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Clock, User, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

interface ShiftSelectorProps {
  shifts: Shift[];
  selectedId: string | null;
  onSelect: (shiftId: string) => void;
}

export function ShiftSelector({ shifts, selectedId, onSelect }: ShiftSelectorProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('es-CL', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (shifts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay turnos cerrados para mostrar
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border p-4">
      <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
        Historial de turnos
      </h3>
      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {shifts.map((shift) => {
          const config = shift.config_snapshot || { kilos_por_bandeja: 20, precio_por_kilo: 1100 };
          const ventaPan = shift.bandejas_sacadas * config.kilos_por_bandeja * config.precio_por_kilo;
          const closingData = shift.closing_data;
          const difference = closingData?.difference || 0;
          
          return (
            <button
              key={shift.id}
              onClick={() => onSelect(shift.id)}
              className={cn(
                "w-full text-left p-3 rounded-xl border transition-all",
                selectedId === shift.id
                  ? "border-primary bg-primary/5"
                  : "border-transparent hover:bg-muted/50"
              )}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-bold text-foreground">{formatDate(shift.date)}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <User size={10} />
                    <span>{shift.opened_by_name || 'Usuario'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-bold text-foreground">
                    {formatMoney(ventaPan + shift.ventas_no_pan)}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase">
                    Venta total
                  </p>
                </div>
              </div>

              {/* Detalles adicionales */}
              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-border/50">
                <div className="flex items-center gap-1.5 text-xs">
                  <Clock size={10} className="text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {formatTime(shift.opened_at)} - {formatTime(shift.closed_at)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <DollarSign size={10} className="text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Fondo: {formatMoney(shift.opening_cash)}
                  </span>
                </div>
              </div>

              {/* Diferencia de caja */}
              {closingData && (
                <div className={cn(
                  "flex items-center justify-between mt-2 px-2 py-1.5 rounded-lg text-xs",
                  difference === 0 
                    ? "bg-emerald-50 dark:bg-emerald-900/20" 
                    : difference > 0 
                      ? "bg-amber-50 dark:bg-amber-900/20"
                      : "bg-red-50 dark:bg-red-900/20"
                )}>
                  <span className="flex items-center gap-1">
                    {difference >= 0 ? (
                      <TrendingUp size={10} className={difference === 0 ? "text-emerald-600" : "text-amber-600"} />
                    ) : (
                      <TrendingDown size={10} className="text-red-600" />
                    )}
                    <span className={cn(
                      "font-medium",
                      difference === 0 ? "text-emerald-700 dark:text-emerald-400" 
                        : difference > 0 ? "text-amber-700 dark:text-amber-400"
                        : "text-red-700 dark:text-red-400"
                    )}>
                      {difference === 0 ? 'Caja Cuadrada' : difference > 0 ? 'Sobrante' : 'Faltante'}
                    </span>
                  </span>
                  {difference !== 0 && (
                    <span className={cn(
                      "font-bold",
                      difference > 0 ? "text-amber-700 dark:text-amber-400" : "text-red-700 dark:text-red-400"
                    )}>
                      {formatMoney(Math.abs(difference))}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
