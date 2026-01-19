'use client';

import type { Shift } from '@/lib/types/database';
import { formatMoney } from '@/lib/utils';
import { cn } from '@/lib/utils';

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
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {shifts.map((shift) => {
          const config = shift.config_snapshot || { kilos_por_bandeja: 20, precio_por_kilo: 1100 };
          const ventaPan = shift.bandejas_sacadas * config.kilos_por_bandeja * config.precio_por_kilo;
          
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
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold">{formatDate(shift.date)}</p>
                  <p className="text-xs text-muted-foreground">
                    {shift.bandejas_sacadas} bandejas • {shift.opened_by_name || 'Sin nombre'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-bold">
                    {formatMoney(ventaPan + shift.ventas_no_pan)}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase">
                    Venta total
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
