'use client';

import { useState, useEffect } from 'react';
import { getProductsSoldDetail, getShiftWithDetails } from '@/lib/actions/reports';
import { formatMoney } from '@/lib/utils';
import { DashboardCard } from '@/components/ui/dashboard-card';
import { LoadingSpinner } from '@/components/ui/loading';
import { 
  Package, ShoppingBag, TrendingUp, Clock, 
  Receipt, DollarSign 
} from 'lucide-react';

interface ProductDetail {
  product_id: string;
  product_name: string;
  price: number;
  cost: number;
  quantity: number;
  subtotal: number;
  profit: number;
}

interface ShiftDetailViewProps {
  shiftId: string;
}

export function ShiftDetailView({ shiftId }: ShiftDetailViewProps) {
  const [products, setProducts] = useState<ProductDetail[]>([]);
  const [shiftData, setShiftData] = useState<{
    salesCount: number;
    expensesCount: number;
    totalExpenses: number;
    expenses: Array<{ description: string; amount: number; origin: string; created_at: string }>;
    sales: Array<{ id: string; total: number; created_at: string; sold_by_name?: string | null }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [productsData, detailsData] = await Promise.all([
        getProductsSoldDetail(shiftId),
        getShiftWithDetails(shiftId),
      ]);
      
      setProducts(productsData);
      
      if (detailsData) {
        const totalExpenses = detailsData.expenses.reduce((sum, e) => sum + e.amount, 0);
        setShiftData({
          salesCount: detailsData.sales.length,
          expensesCount: detailsData.expenses.length,
          totalExpenses,
          expenses: detailsData.expenses,
          sales: detailsData.sales,
        });
      }
      
      setLoading(false);
    }
    
    loadData();
  }, [shiftId]);

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
        <span className="ml-2 text-muted-foreground">Cargando detalles...</span>
      </div>
    );
  }

  const totalProductsSold = products.reduce((sum, p) => sum + p.quantity, 0);
  const totalRevenue = products.reduce((sum, p) => sum + p.subtotal, 0);
  const totalProfit = products.reduce((sum, p) => sum + p.profit, 0);

  return (
    <div className="space-y-6">
      {/* Resumen rápido */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <ShoppingBag size={16} />
            <span className="text-xs font-medium">Ventas</span>
          </div>
          <p className="text-2xl font-black">{shiftData?.salesCount || 0}</p>
          <p className="text-xs text-muted-foreground">transacciones</p>
        </div>
        
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Package size={16} />
            <span className="text-xs font-medium">Productos</span>
          </div>
          <p className="text-2xl font-black">{totalProductsSold}</p>
          <p className="text-xs text-muted-foreground">unidades vendidas</p>
        </div>
        
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <DollarSign size={16} />
            <span className="text-xs font-medium">Ingresos</span>
          </div>
          <p className="text-2xl font-black text-success">{formatMoney(totalRevenue)}</p>
          <p className="text-xs text-muted-foreground">en productos</p>
        </div>
        
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TrendingUp size={16} />
            <span className="text-xs font-medium">Utilidad</span>
          </div>
          <p className="text-2xl font-black text-primary">{formatMoney(totalProfit)}</p>
          <p className="text-xs text-muted-foreground">margen bruto</p>
        </div>
      </div>

      {/* Detalle de productos vendidos */}
      <DashboardCard title="📦 Productos Vendidos (No Pan)" borderColor="blue">
        {products.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>No se vendieron productos en este turno</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="pb-3 text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">
                    Cant.
                  </th>
                  <th className="pb-3 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">
                    Precio
                  </th>
                  <th className="pb-3 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">
                    Total
                  </th>
                  <th className="pb-3 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">
                    Utilidad
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.product_id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-3 font-medium">{product.product_name}</td>
                    <td className="py-3 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm">
                        {product.quantity}
                      </span>
                    </td>
                    <td className="py-3 text-right text-sm text-muted-foreground">
                      {formatMoney(product.price)}
                    </td>
                    <td className="py-3 text-right font-bold">
                      {formatMoney(product.subtotal)}
                    </td>
                    <td className="py-3 text-right font-bold text-success">
                      {formatMoney(product.profit)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-muted/50 font-bold">
                  <td className="py-3">Total</td>
                  <td className="py-3 text-center">{totalProductsSold}</td>
                  <td className="py-3"></td>
                  <td className="py-3 text-right">{formatMoney(totalRevenue)}</td>
                  <td className="py-3 text-right text-success">{formatMoney(totalProfit)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </DashboardCard>

      {/* Historial de transacciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ventas del día */}
        <DashboardCard title="🛒 Historial de Ventas" borderColor="green">
          {shiftData?.sales && shiftData.sales.length > 0 ? (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {shiftData.sales.map((sale, idx) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                      <ShoppingBag size={14} className="text-success" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Venta #{shiftData.sales.length - idx}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock size={10} />
                        {formatTime(sale.created_at)}
                        {sale.sold_by_name && (
                          <span className="ml-1 px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[9px] font-bold">
                            {sale.sold_by_name}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-success">{formatMoney(sale.total)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Sin ventas registradas</p>
            </div>
          )}
        </DashboardCard>

        {/* Gastos del día */}
        <DashboardCard title="💸 Gastos Registrados" borderColor="red">
          {shiftData?.expenses && shiftData.expenses.length > 0 ? (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {shiftData.expenses.map((expense, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                      <Receipt size={14} className="text-destructive" />
                    </div>
                    <div>
                      <p className="font-medium text-sm truncate max-w-[150px]">
                        {expense.description}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        <Clock size={10} />
                        {formatTime(expense.created_at)}
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          expense.origin === 'PAN' 
                            ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                            : expense.origin === 'NO_PAN'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {expense.origin === 'PAN' ? 'Pan' : expense.origin === 'NO_PAN' ? 'No Pan' : 'Caja'}
                        </span>
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-destructive">-{formatMoney(expense.amount)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Receipt className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Sin gastos registrados</p>
            </div>
          )}
        </DashboardCard>
      </div>
    </div>
  );
}
