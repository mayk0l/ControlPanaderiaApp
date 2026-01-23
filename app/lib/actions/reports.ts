'use server';

import { createClient } from '@/lib/supabase/server';
import type { Shift, Expense, Sale, SaleItem, ReportData } from '@/lib/types/database';

/**
 * Obtiene todos los turnos cerrados para reportes
 */
export async function getClosedShifts(limit: number = 30): Promise<Shift[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('shifts')
    .select('*')
    .eq('status', 'CLOSED')
    .order('date', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching closed shifts:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Obtiene un turno específico con todos sus datos relacionados
 */
export async function getShiftWithDetails(shiftId: string) {
  const supabase = await createClient();
  
  // Obtener turno
  const { data: shift, error: shiftError } = await supabase
    .from('shifts')
    .select('*')
    .eq('id', shiftId)
    .single();
  
  if (shiftError || !shift) {
    console.error('Error fetching shift:', shiftError);
    return null;
  }
  
  // Obtener gastos del turno
  const { data: expenses } = await supabase
    .from('expenses')
    .select('*')
    .eq('shift_id', shiftId)
    .order('created_at', { ascending: false });
  
  // Obtener ventas con items
  const { data: sales } = await supabase
    .from('sales')
    .select(`
      *,
      sale_items (*)
    `)
    .eq('shift_id', shiftId)
    .order('created_at', { ascending: false });
  
  return {
    shift,
    expenses: expenses || [],
    sales: sales || [],
  };
}

/**
 * Obtiene el detalle de productos vendidos agrupados
 */
export async function getProductsSoldDetail(shiftId: string) {
  const supabase = await createClient();
  
  // Obtener todos los items vendidos en el turno
  const { data: saleItems } = await supabase
    .from('sale_items')
    .select(`
      product_id,
      product_name,
      price,
      cost,
      quantity,
      subtotal,
      sales!inner(shift_id)
    `)
    .eq('sales.shift_id', shiftId);
  
  if (!saleItems || saleItems.length === 0) {
    return [];
  }
  
  // Agrupar por producto
  const productMap = new Map<string, {
    product_id: string;
    product_name: string;
    price: number;
    cost: number;
    quantity: number;
    subtotal: number;
    profit: number;
  }>();
  
  saleItems.forEach((item) => {
    const existing = productMap.get(item.product_id);
    if (existing) {
      existing.quantity += item.quantity;
      existing.subtotal += item.subtotal;
      existing.profit += (item.price - item.cost) * item.quantity;
    } else {
      productMap.set(item.product_id, {
        product_id: item.product_id,
        product_name: item.product_name,
        price: item.price,
        cost: item.cost,
        quantity: item.quantity,
        subtotal: item.subtotal,
        profit: (item.price - item.cost) * item.quantity,
      });
    }
  });
  
  // Convertir a array y ordenar por cantidad vendida
  return Array.from(productMap.values())
    .sort((a, b) => b.quantity - a.quantity);
}

/**
 * Calcula el reporte de un turno específico
 */
export async function calculateShiftReport(shiftId: string): Promise<ReportData | null> {
  const data = await getShiftWithDetails(shiftId);
  
  if (!data) return null;
  
  const { shift, expenses, sales } = data;
  
  // Calcular venta de pan (bandejas * kilos * precio)
  const config = shift.config_snapshot || { kilos_por_bandeja: 20, precio_por_kilo: 1100 };
  const venta_pan = shift.bandejas_sacadas * config.kilos_por_bandeja * config.precio_por_kilo;
  
  // Calcular gastos por categoría
  let gastos_pan = 0;
  let gastos_no_pan = 0;
  let gastos_general = 0;
  
  expenses.forEach((expense: Expense) => {
    switch (expense.origin) {
      case 'PAN':
        gastos_pan += expense.amount;
        break;
      case 'NO_PAN':
        gastos_no_pan += expense.amount;
        break;
      case 'GENERAL':
      default:
        gastos_general += expense.amount;
    }
  });
  
  // Calcular venta no pan y COGS (costo de bienes vendidos)
  let venta_no_pan = 0;
  let cogs_no_pan = 0;
  
  sales.forEach((sale: Sale & { sale_items?: SaleItem[] }) => {
    if (sale.sale_items) {
      sale.sale_items.forEach((item: SaleItem) => {
        venta_no_pan += item.subtotal;
        cogs_no_pan += item.cost * item.quantity;
      });
    }
  });
  
  // Calcular ganancias
  const ganancia_pan = venta_pan - gastos_pan;
  const ganancia_no_pan = venta_no_pan - cogs_no_pan - gastos_no_pan;
  const utilidad_neta = ganancia_pan + ganancia_no_pan - gastos_general;
  
  return {
    venta_pan,
    gastos_pan,
    ganancia_pan,
    venta_no_pan,
    cogs_no_pan,
    gastos_no_pan,
    ganancia_no_pan,
    gastos_general,
    utilidad_neta,
  };
}

/**
 * Obtiene el resumen del turno actual (si existe)
 */
export async function getCurrentShiftReport() {
  const supabase = await createClient();
  
  const today = new Date().toISOString().split('T')[0];
  
  const { data: shift, error } = await supabase
    .from('shifts')
    .select('*')
    .eq('date', today)
    .single();
  
  if (error || !shift) {
    return null;
  }
  
  return calculateShiftReport(shift.id);
}

/**
 * Obtiene estadísticas rápidas del turno actual para el dashboard
 */
export async function getQuickStats(shiftId: string) {
  const supabase = await createClient();
  
  // Obtener turno
  const { data: shift } = await supabase
    .from('shifts')
    .select('*')
    .eq('id', shiftId)
    .single();
  
  if (!shift) return null;
  
  // Obtener total de ventas
  const { data: sales } = await supabase
    .from('sales')
    .select('total')
    .eq('shift_id', shiftId);
  
  // Obtener total de gastos de caja
  const { data: expenses } = await supabase
    .from('expenses')
    .select('amount, from_cash')
    .eq('shift_id', shiftId)
    .eq('from_cash', true);
  
  const totalVentas = sales?.reduce((acc: number, s: { total: number }) => acc + s.total, 0) || 0;
  const totalGastosCaja = expenses?.reduce((acc: number, e: { amount: number }) => acc + e.amount, 0) || 0;
  
  // Calcular venta de pan estimada
  const config = shift.config_snapshot || { kilos_por_bandeja: 20, precio_por_kilo: 1100 };
  const ventaPanEstimada = shift.bandejas_sacadas * config.kilos_por_bandeja * config.precio_por_kilo;
  
  // Efectivo en caja
  const efectivoEnCaja = shift.opening_cash + totalVentas - totalGastosCaja;
  
  return {
    bandejas: shift.bandejas_sacadas,
    ventaPanEstimada,
    ventasProductos: totalVentas,
    gastosCaja: totalGastosCaja,
    efectivoEnCaja,
  };
}
