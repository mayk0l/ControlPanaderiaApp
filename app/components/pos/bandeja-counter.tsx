"use client";

import { useState, useTransition, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { incrementBandejas, decrementBandejas } from "@/lib/actions/bandejas";
import { Shift, PanConfig } from "@/lib/types/database";
import { Minus, Plus, Croissant } from "lucide-react";
import { cn } from "@/lib/utils";

interface BandejaCounterProps {
  shift: Shift;
}

export function BandejaCounter({ shift }: BandejaCounterProps) {
  const [count, setCount] = useState(shift.bandejas_sacadas || 0);
  const [isPending, startTransition] = useTransition();
  const pendingOps = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const config = shift.config_snapshot as PanConfig;
  const kilosPorBandeja = config?.kilos_por_bandeja || 3.2;
  const precioPorKilo = config?.precio_por_kilo || 2000;
  
  const kilosTotal = count * kilosPorBandeja;
  const ventaEstimada = kilosTotal * precioPorKilo;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Función para incrementar con update optimista
  const doIncrement = useCallback(() => {
    setCount(prev => prev + 1);
    pendingOps.current++;
    startTransition(async () => {
      const result = await incrementBandejas(shift.id);
      pendingOps.current--;
      if (!result.success && pendingOps.current === 0) {
        // Recargar el valor real si todas las operaciones fallaron
        setCount(shift.bandejas_sacadas || 0);
      }
    });
  }, [shift.id, shift.bandejas_sacadas]);

  // Función para decrementar con update optimista
  const doDecrement = useCallback(() => {
    setCount(prev => {
      if (prev <= 0) return prev;
      return prev - 1;
    });
    if (count <= 0) return;
    
    pendingOps.current++;
    startTransition(async () => {
      const result = await decrementBandejas(shift.id);
      pendingOps.current--;
      if (!result.success && pendingOps.current === 0) {
        setCount(shift.bandejas_sacadas || 0);
      }
    });
  }, [shift.id, shift.bandejas_sacadas, count]);

  // Mantener presionado para agregar/quitar rápido
  const startHold = (action: 'increment' | 'decrement') => {
    // Ejecutar una vez inmediatamente
    if (action === 'increment') {
      doIncrement();
    } else {
      doDecrement();
    }
    
    // Iniciar repetición después de 300ms, cada 100ms
    const startRepeat = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        if (action === 'increment') {
          doIncrement();
        } else {
          doDecrement();
        }
      }, 100);
    }, 300);
    
    intervalRef.current = startRepeat as unknown as NodeJS.Timeout;
  };

  const stopHold = () => {
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  return (
    <DashboardCard 
      title="🍞 Bandejas de Pan" 
      borderColor="orange"
      className="col-span-full lg:col-span-1"
    >
      <div className="flex flex-col items-center py-4">
        {/* Contador principal */}
        <div className="flex items-center gap-6 mb-6">
          <Button
            variant="outline"
            size="xl"
            onMouseDown={() => startHold('decrement')}
            onMouseUp={stopHold}
            onMouseLeave={stopHold}
            onTouchStart={() => startHold('decrement')}
            onTouchEnd={stopHold}
            disabled={count <= 0}
            className="rounded-full h-16 w-16 select-none touch-none"
          >
            <Minus className="h-8 w-8" />
          </Button>
          
          <div className="text-center min-w-[120px]">
            <div className={cn(
              "text-6xl font-black tabular-nums transition-opacity duration-75",
              isPending && pendingOps.current > 2 && "opacity-70"
            )}>
              {count}
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              bandejas
            </p>
          </div>
          
          <Button
            variant="default"
            size="xl"
            onMouseDown={() => startHold('increment')}
            onMouseUp={stopHold}
            onMouseLeave={stopHold}
            onTouchStart={() => startHold('increment')}
            onTouchEnd={stopHold}
            className="rounded-full h-16 w-16 bg-orange-500 hover:bg-orange-600 select-none touch-none"
          >
            <Plus className="h-8 w-8" />
          </Button>
        </div>

        {/* Estadísticas */}
        <div className="w-full grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <Croissant className="h-4 w-4" />
              <span className="text-xs font-medium">Kilos producidos</span>
            </div>
            <p className="text-2xl font-bold">
              {kilosTotal.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">kg</span>
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-muted-foreground mb-1">
              <span className="text-xs font-medium">Venta estimada</span>
            </div>
            <p className="text-2xl font-bold text-success">
              {formatCurrency(ventaEstimada)}
            </p>
          </div>
        </div>

        {/* Info de configuración */}
        <div className="mt-4 text-xs text-muted-foreground text-center">
          <p>
            {kilosPorBandeja} kg/bandeja × {formatCurrency(precioPorKilo)}/kg
          </p>
        </div>
      </div>
    </DashboardCard>
  );
}
