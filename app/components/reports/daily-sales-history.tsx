'use client';

import { useState, useEffect, useTransition } from 'react';
import { formatMoney } from '@/lib/utils';
import { DashboardCard } from '@/components/ui/dashboard-card';
import { LoadingSpinner } from '@/components/ui/loading';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, ChevronDown, ChevronRight, Clock, Package, 
  ShoppingBag, Trash2, User, TrendingUp, FileText, X
} from 'lucide-react';
import { 
  getDailyShiftsHistory, 
  getShiftSalesWithItems, 
  deleteSale 
} from '@/lib/actions/reports';
import type { Shift, Sale, SaleItem } from '@/lib/types/database';

interface SaleWithItems extends Sale {
  sale_items: SaleItem[];
}

interface DailySalesHistoryProps {
  userRole?: string;
  initialShifts?: Shift[];
}

export function DailySalesHistory({ userRole = 'vendedor', initialShifts }: DailySalesHistoryProps) {
  const [shifts, setShifts] = useState<Shift[]>(initialShifts || []);
  const [loading, setLoading] = useState(!initialShifts);
  const [expandedShift, setExpandedShift] = useState<string | null>(null);
  const [shiftSales, setShiftSales] = useState<Map<string, SaleWithItems[]>>(new Map());
  const [loadingSales, setLoadingSales] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [selectedSale, setSelectedSale] = useState<SaleWithItems | null>(null);

  useEffect(() => {
    if (!initialShifts) {
      loadShifts();
    }
  }, [initialShifts]);

  const loadShifts = async () => {
    setLoading(true);
    const data = await getDailyShiftsHistory(60);
    setShifts(data);
    setLoading(false);
  };

  const toggleShift = async (shiftId: string) => {
    if (expandedShift === shiftId) {
      setExpandedShift(null);
      return;
    }

    setExpandedShift(shiftId);

    // Cargar ventas si no están cargadas
    if (!shiftSales.has(shiftId)) {
      setLoadingSales(shiftId);
      const sales = await getShiftSalesWithItems(shiftId);
      setShiftSales(prev => new Map(prev).set(shiftId, sales as SaleWithItems[]));
      setLoadingSales(null);
    }
  };

  const handleDeleteSale = async (saleId: string, saleTotal: number, shiftId: string) => {
    if (!confirm(`¿Eliminar esta venta de ${formatMoney(saleTotal)}? Esta acción no se puede deshacer.`)) {
      return;
    }

    startTransition(async () => {
      const result = await deleteSale(saleId);
      if (result.success) {
        // Actualizar ventas localmente
        setShiftSales(prev => {
          const newMap = new Map(prev);
          const currentSales = newMap.get(shiftId) || [];
          newMap.set(shiftId, currentSales.filter(s => s.id !== saleId));
          return newMap;
        });
        setSelectedSale(null);
      } else {
        alert(result.error || 'Error al eliminar la venta');
      }
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-CL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Agrupar turnos por fecha
  const shiftsByDate = shifts.reduce((acc, shift) => {
    if (!acc[shift.date]) {
      acc[shift.date] = [];
    }
    acc[shift.date].push(shift);
    return acc;
  }, {} as Record<string, Shift[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner />
        <span className="ml-2 text-muted-foreground">Cargando historial...</span>
      </div>
    );
  }

  if (shifts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Calendar className="w-16 h-16 mb-4 opacity-30" />
        <h3 className="text-xl font-bold mb-2">Sin historial</h3>
        <p className="text-sm">No hay turnos registrados aún</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">📆 Historial Diario de Turnos</h2>
        <p className="text-sm text-muted-foreground">
          Últimos {shifts.length} turnos
        </p>
      </div>

      {/* Lista de días con turnos */}
      <div className="space-y-4">
        {Object.entries(shiftsByDate).map(([date, dayShifts]) => {
          const totalDayVentas = dayShifts.reduce((sum, s) => sum + (s.ventas_no_pan || 0), 0);
          const totalDayBandejas = dayShifts.reduce((sum, s) => sum + (s.bandejas_sacadas || 0), 0);

          return (
            <div key={date} className="bg-card rounded-xl border overflow-hidden">
              {/* Header del día */}
              <div className="p-4 bg-muted/30 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Calendar size={20} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold capitalize">{formatDate(date)}</h3>
                      <p className="text-xs text-muted-foreground">
                        {dayShifts.length} turno{dayShifts.length > 1 ? 's' : ''} • {totalDayBandejas} bandejas
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-success">{formatMoney(totalDayVentas)}</p>
                    <p className="text-xs text-muted-foreground">en productos</p>
                  </div>
                </div>
              </div>

              {/* Lista de turnos del día */}
              <div className="divide-y divide-border/50">
                {dayShifts.map((shift) => {
                  const isExpanded = expandedShift === shift.id;
                  const sales = shiftSales.get(shift.id) || [];
                  const isLoadingSales = loadingSales === shift.id;
                  
                  // Calcular venta de pan
                  const config = shift.config_snapshot || { kilos_por_bandeja: 20, precio_por_kilo: 1100 };
                  const ventaPan = shift.bandejas_sacadas * config.kilos_por_bandeja * config.precio_por_kilo;

                  return (
                    <div key={shift.id}>
                      {/* Header del turno */}
                      <div 
                        className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                        onClick={() => toggleShift(shift.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {isExpanded ? (
                              <ChevronDown size={20} className="text-muted-foreground" />
                            ) : (
                              <ChevronRight size={20} className="text-muted-foreground" />
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant={shift.status === 'OPEN' ? 'default' : 'secondary'}
                                  className={shift.status === 'OPEN' 
                                    ? 'bg-green-500/20 text-green-600 border-green-500/30' 
                                    : ''}
                                >
                                  {shift.status === 'OPEN' ? 'ABIERTO' : 'CERRADO'}
                                </Badge>
                                <span className="text-sm font-medium">
                                  Abierto por {shift.opened_by_name || 'Usuario'}
                                </span>
                                {shift.closed_by_name && (
                                  <span className="text-xs text-muted-foreground">
                                    • Cerrado por {shift.closed_by_name}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                                <Clock size={12} />
                                {formatTime(shift.opened_at)}
                                {shift.closed_at && (
                                  <span> - {formatTime(shift.closed_at)}</span>
                                )}
                                <span className="mx-1">•</span>
                                <Package size={12} />
                                {shift.bandejas_sacadas} bandejas
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-success">{formatMoney(shift.ventas_no_pan || 0)}</p>
                            <p className="text-xs text-muted-foreground">
                              Pan: {formatMoney(ventaPan)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Detalle del turno expandido */}
                      {isExpanded && (
                        <div className="px-4 pb-4 border-t border-border/50 pt-4 bg-muted/10">
                          {isLoadingSales ? (
                            <div className="flex items-center justify-center py-8">
                              <LoadingSpinner />
                              <span className="ml-2 text-muted-foreground text-sm">
                                Cargando ventas...
                              </span>
                            </div>
                          ) : sales.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                              <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-30" />
                              <p className="text-sm">Sin ventas de productos en este turno</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-muted-foreground">
                                  {sales.length} venta{sales.length > 1 ? 's' : ''} registrada{sales.length > 1 ? 's' : ''}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  Click para ver detalles
                                </span>
                              </div>

                              <div className="grid gap-2">
                                {sales.map((sale, idx) => (
                                  <div 
                                    key={sale.id}
                                    className="flex items-center justify-between p-3 bg-card rounded-xl border cursor-pointer hover:border-primary/50 transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedSale(sale);
                                    }}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                                        <ShoppingBag size={14} className="text-success" />
                                      </div>
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <p className="font-medium text-sm">
                                            Venta #{sales.length - idx}
                                          </p>
                                          {sale.sold_by_name && (
                                            <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                                              {sale.sold_by_name}
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                          <Clock size={10} />
                                          {formatTime(sale.created_at)}
                                          <span className="ml-1">• {sale.sale_items.length} items</span>
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-success">
                                        {formatMoney(sale.total)}
                                      </span>
                                      {userRole === 'admin' && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteSale(sale.id, sale.total, shift.id);
                                          }}
                                          disabled={isPending}
                                          className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50"
                                          title="Eliminar venta"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de detalle de venta */}
      {selectedSale && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedSale(null)}
        >
          <div 
            className="bg-card rounded-2xl border shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h3 className="font-bold">Detalle de Venta</h3>
                <p className="text-xs text-muted-foreground">
                  {formatTime(selectedSale.created_at)}
                  {selectedSale.sold_by_name && ` • ${selectedSale.sold_by_name}`}
                </p>
              </div>
              <button 
                onClick={() => setSelectedSale(null)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[50vh]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-muted-foreground uppercase border-b">
                    <th className="text-left pb-2">Producto</th>
                    <th className="text-center pb-2">Cant.</th>
                    <th className="text-right pb-2">Precio</th>
                    <th className="text-right pb-2">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSale.sale_items.map((item) => (
                    <tr key={item.id} className="border-b border-border/30">
                      <td className="py-3 font-medium">{item.product_name}</td>
                      <td className="py-3 text-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-primary/10 text-primary text-xs font-bold">
                          {item.quantity}
                        </span>
                      </td>
                      <td className="py-3 text-right text-muted-foreground">
                        {formatMoney(item.price)}
                      </td>
                      <td className="py-3 text-right font-bold">
                        {formatMoney(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-bold text-lg">
                    <td colSpan={3} className="pt-3 text-right">Total:</td>
                    <td className="pt-3 text-right text-success">
                      {formatMoney(selectedSale.total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {userRole === 'admin' && (
              <div className="p-4 border-t bg-muted/30">
                <button
                  onClick={() => {
                    const shiftId = shifts.find(s => 
                      shiftSales.get(s.id)?.some(sale => sale.id === selectedSale.id)
                    )?.id;
                    if (shiftId) {
                      handleDeleteSale(selectedSale.id, selectedSale.total, shiftId);
                    }
                  }}
                  disabled={isPending}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  <Trash2 size={16} />
                  Eliminar esta venta
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
