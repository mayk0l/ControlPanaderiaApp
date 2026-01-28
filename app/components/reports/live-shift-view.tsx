'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import { formatMoney, formatChileTime, formatChileDate } from '@/lib/utils';
import { DashboardCard } from '@/components/ui/dashboard-card';
import { LoadingSpinner } from '@/components/ui/loading';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingBag, Package, Clock, Trash2, 
  RefreshCw, AlertCircle, TrendingUp, User
} from 'lucide-react';
import { 
  getOpenShiftWithSales, 
  deleteSale 
} from '@/lib/actions/reports';
import type { Shift, Sale, SaleItem } from '@/lib/types/database';

interface SaleWithItems extends Sale {
  sale_items: SaleItem[];
}

interface LiveShiftData {
  shift: Shift;
  sales: SaleWithItems[];
  totalVentas: number;
  totalProductos: number;
}

interface LiveShiftViewProps {
  userRole?: string;
}

export function LiveShiftView({ userRole = 'vendedor' }: LiveShiftViewProps) {
  const [data, setData] = useState<LiveShiftData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [expandedSale, setExpandedSale] = useState<string | null>(null);

  const loadData = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    
    const result = await getOpenShiftWithSales();
    setData(result);
    
    setLoading(false);
    setRefreshing(false);
  }, []);

  // Cargar datos inicialmente
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-refresh cada 10 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      loadData();
    }, 10000);

    return () => clearInterval(interval);
  }, [loadData]);

  const handleRefresh = () => {
    loadData(true);
  };

  const handleDeleteSale = async (saleId: string, saleTotal: number) => {
    if (!confirm(`¿Eliminar esta venta de ${formatMoney(saleTotal)}? Esta acción no se puede deshacer.`)) {
      return;
    }

    startTransition(async () => {
      const result = await deleteSale(saleId);
      if (result.success) {
        // Recargar datos
        loadData();
      } else {
        alert(result.error || 'Error al eliminar la venta');
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner />
        <span className="ml-2 text-muted-foreground">Cargando turno activo...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <AlertCircle className="w-16 h-16 mb-4 opacity-30" />
        <h3 className="text-xl font-bold mb-2">No hay turno abierto</h3>
        <p className="text-sm">Abre un turno desde el POS para ver las ventas en tiempo real</p>
      </div>
    );
  }

  const { shift, sales, totalVentas, totalProductos } = data;

  // Calcular venta de pan estimada
  const config = shift.config_snapshot || { kilos_por_bandeja: 20, precio_por_kilo: 1100 };
  const ventaPanEstimada = shift.bandejas_sacadas * config.kilos_por_bandeja * config.precio_por_kilo;

  return (
    <div className="space-y-6">
      {/* Header del turno activo */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold">🟢 Turno Activo</h2>
            <Badge variant="default" className="bg-green-500/20 text-green-600 border-green-500/30">
              EN CURSO
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Abierto por <strong>{shift.opened_by_name || 'Usuario'}</strong> a las{' '}
            {formatChileTime(shift.opened_at)} • {formatChileDate(shift.date + 'T12:00:00', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              timeZone: 'America/Santiago'
            })}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-xl transition-colors text-sm font-medium disabled:opacity-50"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </div>

      {/* Resumen en tiempo real */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 rounded-xl border border-orange-500/20 p-4">
          <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 mb-1">
            <Package size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Bandejas</span>
          </div>
          <p className="text-3xl font-black">{shift.bandejas_sacadas}</p>
          <p className="text-xs text-muted-foreground mt-1">
            ≈ {formatMoney(ventaPanEstimada)} en pan
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-xl border border-blue-500/20 p-4">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
            <ShoppingBag size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Ventas</span>
          </div>
          <p className="text-3xl font-black">{sales.length}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {totalProductos} productos
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-xl border border-green-500/20 p-4">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1">
            <TrendingUp size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Total No Pan</span>
          </div>
          <p className="text-3xl font-black text-green-600 dark:text-green-400">
            {formatMoney(totalVentas)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">en productos</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-xl border border-purple-500/20 p-4">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-1">
            <Clock size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Caja</span>
          </div>
          <p className="text-3xl font-black">
            {formatMoney(shift.opening_cash)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">apertura</p>
        </div>
      </div>

      {/* Historial de ventas en tiempo real */}
      <DashboardCard 
        title="📋 Historial de Ventas del Turno" 
        borderColor="green"
        className="relative"
      >
        <div className="absolute top-4 right-4 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Actualizando cada 10s
        </div>

        {sales.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <ShoppingBag className="w-16 h-16 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Sin ventas registradas</p>
            <p className="text-sm mt-1">Las ventas aparecerán aquí en tiempo real</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {sales.map((sale, idx) => (
              <div
                key={sale.id}
                className="bg-muted/30 rounded-xl overflow-hidden transition-all"
              >
                {/* Header de la venta */}
                <div 
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setExpandedSale(expandedSale === sale.id ? null : sale.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                      <ShoppingBag size={18} className="text-success" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold">Venta #{sales.length - idx}</p>
                        {sale.sold_by_name && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                            <User size={10} />
                            {sale.sold_by_name}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock size={10} />
                        {formatChileTime(sale.created_at)}
                        <span className="ml-2">• {sale.sale_items.length} items</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-black text-success">
                      {formatMoney(sale.total)}
                    </span>
                    {userRole === 'admin' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSale(sale.id, sale.total);
                        }}
                        disabled={isPending}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50"
                        title="Eliminar venta"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Detalle expandido */}
                {expandedSale === sale.id && (
                  <div className="px-4 pb-4 border-t border-border/50 pt-3">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-xs text-muted-foreground uppercase">
                          <th className="text-left pb-2">Producto</th>
                          <th className="text-center pb-2">Cant.</th>
                          <th className="text-right pb-2">Precio</th>
                          <th className="text-right pb-2">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sale.sale_items.map((item) => (
                          <tr key={item.id} className="border-t border-border/30">
                            <td className="py-2 font-medium">{item.product_name}</td>
                            <td className="py-2 text-center">
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-primary/10 text-primary text-xs font-bold">
                                {item.quantity}
                              </span>
                            </td>
                            <td className="py-2 text-right text-muted-foreground">
                              {formatMoney(item.price)}
                            </td>
                            <td className="py-2 text-right font-bold">
                              {formatMoney(item.subtotal)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </DashboardCard>
    </div>
  );
}
