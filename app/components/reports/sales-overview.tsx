'use client';

import { useState, useEffect, useTransition } from 'react';
import { getSalesOverview, getWeeklyProductSummary } from '@/lib/actions/reports';
import type { PeriodSalesReport, WeeklyProductSummary } from '@/lib/types/database';
import { formatMoney, cn } from '@/lib/utils';
import { 
  Calendar, 
  CalendarDays, 
  TrendingUp, 
  Package, 
  Croissant,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react';

interface SalesOverviewProps {
  initialWeekly?: PeriodSalesReport | null;
  initialMonthly?: PeriodSalesReport | null;
}

function formatDateRange(start: string, end: string): string {
  const startDate = new Date(start + 'T12:00:00');
  const endDate = new Date(end + 'T12:00:00');
  
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  
  return `${startDate.toLocaleDateString('es-CL', options)} - ${endDate.toLocaleDateString('es-CL', options)}`;
}

function PeriodCard({ 
  title, 
  icon: Icon, 
  data, 
  accentColor 
}: { 
  title: string; 
  icon: React.ElementType; 
  data: PeriodSalesReport | null; 
  accentColor: string;
}) {
  if (!data) {
    return (
      <div className="bg-card rounded-2xl border p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={cn("p-2 rounded-xl", accentColor)}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold">{title}</h3>
            <p className="text-xs text-muted-foreground">Sin datos disponibles</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className={cn("p-2 rounded-xl", accentColor)}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold">{title}</h3>
          <p className="text-xs text-muted-foreground">
            {formatDateRange(data.period_start, data.period_end)}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Venta Pan */}
        <div className="p-4 bg-orange-500/10 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Croissant className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
              Venta Pan
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold">{formatMoney(data.venta_pan)}</span>
            <span className="text-sm text-muted-foreground">
              {data.total_bandejas} bandejas
            </span>
          </div>
        </div>

        {/* Venta Productos */}
        <div className="p-4 bg-primary/10 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Venta Productos
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold">{formatMoney(data.venta_no_pan)}</span>
            <span className="text-sm text-muted-foreground">
              {data.total_turnos} turnos
            </span>
          </div>
        </div>

        {/* Total */}
        <div className="p-4 bg-success/10 rounded-xl border-t-2 border-success">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-success" />
            <span className="text-sm font-medium text-success">
              Total Ventas
            </span>
          </div>
          <span className="text-3xl font-black">{formatMoney(data.total_ventas)}</span>
        </div>
      </div>
    </div>
  );
}

function WeeklyProductTable({ data }: { data: WeeklyProductSummary[] }) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay ventas de productos esta semana
      </div>
    );
  }

  // Obtener nombres de días únicos
  const dayHeaders = data[0]?.daily_sales.map(d => d.day_name.slice(0, 3)) || [];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-2 font-semibold">Producto</th>
            {dayHeaders.map((day, idx) => (
              <th key={idx} className="text-center py-3 px-2 font-semibold min-w-[60px]">
                {day}
              </th>
            ))}
            <th className="text-right py-3 px-2 font-semibold">Total</th>
            <th className="text-right py-3 px-2 font-semibold">Monto</th>
          </tr>
        </thead>
        <tbody>
          {data.map((product) => (
            <tr key={product.product_id} className="border-b border-border/50 hover:bg-muted/50">
              <td className="py-3 px-2 font-medium">{product.product_name}</td>
              {product.daily_sales.map((day, idx) => (
                <td 
                  key={idx} 
                  className={cn(
                    "text-center py-3 px-2",
                    day.quantity > 0 ? "text-foreground font-medium" : "text-muted-foreground"
                  )}
                >
                  {day.quantity > 0 ? day.quantity : '-'}
                </td>
              ))}
              <td className="text-right py-3 px-2 font-bold text-primary">
                {product.total_quantity}
              </td>
              <td className="text-right py-3 px-2 font-mono text-success">
                {formatMoney(product.total_subtotal)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-muted/30 font-bold">
            <td className="py-3 px-2">Total</td>
            {dayHeaders.map((_, idx) => {
              const dayTotal = data.reduce((acc, p) => acc + p.daily_sales[idx].quantity, 0);
              return (
                <td key={idx} className="text-center py-3 px-2">
                  {dayTotal > 0 ? dayTotal : '-'}
                </td>
              );
            })}
            <td className="text-right py-3 px-2">
              {data.reduce((acc, p) => acc + p.total_quantity, 0)}
            </td>
            <td className="text-right py-3 px-2 font-mono text-success">
              {formatMoney(data.reduce((acc, p) => acc + p.total_subtotal, 0))}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export function SalesOverview({ initialWeekly, initialMonthly }: SalesOverviewProps) {
  const [weeklyData, setWeeklyData] = useState<PeriodSalesReport | null>(initialWeekly || null);
  const [monthlyData, setMonthlyData] = useState<PeriodSalesReport | null>(initialMonthly || null);
  const [productSummary, setProductSummary] = useState<WeeklyProductSummary[]>([]);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  useEffect(() => {
    if (!initialWeekly || !initialMonthly) {
      startTransition(async () => {
        const { weekly, monthly } = await getSalesOverview();
        setWeeklyData(weekly);
        setMonthlyData(monthly);
      });
    }
  }, [initialWeekly, initialMonthly]);

  const handleToggleProductDetail = async () => {
    if (!showProductDetail && productSummary.length === 0) {
      setIsLoadingProducts(true);
      try {
        const summary = await getWeeklyProductSummary();
        setProductSummary(summary);
      } finally {
        setIsLoadingProducts(false);
      }
    }
    setShowProductDetail(!showProductDetail);
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Cargando resumen de ventas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold">Resumen de Ventas</h2>
        <p className="text-sm text-muted-foreground">
          Comparativa semanal y mensual • Pan vs Productos
        </p>
      </div>

      {/* Cards de período */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PeriodCard
          title="Esta Semana"
          icon={CalendarDays}
          data={weeklyData}
          accentColor="bg-primary"
        />
        <PeriodCard
          title="Este Mes"
          icon={Calendar}
          data={monthlyData}
          accentColor="bg-orange-500"
        />
      </div>

      {/* Botón para mostrar detalle semanal por producto */}
      <button
        onClick={handleToggleProductDetail}
        disabled={isLoadingProducts}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-muted/50 hover:bg-muted rounded-xl transition-colors text-sm font-medium disabled:opacity-50"
      >
        {isLoadingProducts ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Cargando detalle...
          </>
        ) : showProductDetail ? (
          <>
            <ChevronUp size={18} />
            Ocultar Detalle Semanal por Producto
          </>
        ) : (
          <>
            <ChevronDown size={18} />
            Ver Detalle Semanal por Producto
          </>
        )}
      </button>

      {/* Tabla de detalle semanal por producto */}
      {showProductDetail && (
        <div className="bg-card rounded-2xl border p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Ventas por Producto - Semana Actual
          </h3>
          <WeeklyProductTable data={productSummary} />
        </div>
      )}
    </div>
  );
}
