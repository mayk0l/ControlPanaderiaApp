'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Shift, Expense, Sale, SaleItem, ReportData, PeriodSalesReport, WeeklyProductSummary } from '@/lib/types/database';

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
  
  // Buscar cualquier turno abierto (sin filtrar por fecha)
  const { data: shift, error } = await supabase
    .from('shifts')
    .select('*')
    .eq('status', 'OPEN')
    .order('opened_at', { ascending: false })
    .limit(1)
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

// =============================================
// REPORTES SEMANALES Y MENSUALES
// =============================================

/**
 * Obtiene las fechas de inicio y fin de la semana actual (lunes a domingo)
 */
function getWeekRange(date: Date = new Date()): { start: string; end: string } {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajusta para que lunes sea el primer día
  
  const monday = new Date(d.setDate(diff));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  
  return {
    start: monday.toISOString().split('T')[0],
    end: sunday.toISOString().split('T')[0],
  };
}

/**
 * Obtiene las fechas de inicio y fin del mes actual
 */
function getMonthRange(date: Date = new Date()): { start: string; end: string } {
  const year = date.getFullYear();
  const month = date.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  return {
    start: firstDay.toISOString().split('T')[0],
    end: lastDay.toISOString().split('T')[0],
  };
}

/**
 * Obtiene el reporte de ventas para un período específico
 */
export async function getPeriodSalesReport(
  periodType: 'week' | 'month',
  customDate?: Date
): Promise<PeriodSalesReport | null> {
  const supabase = await createClient();
  
  const dateRange = periodType === 'week' 
    ? getWeekRange(customDate) 
    : getMonthRange(customDate);
  
  // Obtener todos los turnos cerrados del período
  const { data: shifts, error: shiftsError } = await supabase
    .from('shifts')
    .select('*')
    .eq('status', 'CLOSED')
    .gte('date', dateRange.start)
    .lte('date', dateRange.end)
    .order('date', { ascending: true });
  
  if (shiftsError) {
    console.error('Error fetching shifts for period:', shiftsError);
    return null;
  }
  
  if (!shifts || shifts.length === 0) {
    return {
      period_start: dateRange.start,
      period_end: dateRange.end,
      total_bandejas: 0,
      venta_pan: 0,
      venta_no_pan: 0,
      total_ventas: 0,
      total_turnos: 0,
    };
  }
  
  // Calcular totales
  let totalBandejas = 0;
  let ventaPan = 0;
  let ventaNoPan = 0;
  
  shifts.forEach((shift: Shift) => {
    totalBandejas += shift.bandejas_sacadas || 0;
    ventaNoPan += shift.ventas_no_pan || 0;
    
    // Calcular venta de pan basada en bandejas
    const config = shift.config_snapshot || { kilos_por_bandeja: 20, precio_por_kilo: 1100 };
    ventaPan += (shift.bandejas_sacadas || 0) * config.kilos_por_bandeja * config.precio_por_kilo;
  });
  
  return {
    period_start: dateRange.start,
    period_end: dateRange.end,
    total_bandejas: totalBandejas,
    venta_pan: ventaPan,
    venta_no_pan: ventaNoPan,
    total_ventas: ventaPan + ventaNoPan,
    total_turnos: shifts.length,
  };
}

/**
 * Obtiene el resumen diario de ventas de la semana para un producto específico o todos
 */
export async function getWeeklyProductSummary(
  customDate?: Date
): Promise<WeeklyProductSummary[]> {
  const supabase = await createClient();
  const dateRange = getWeekRange(customDate);
  
  // Obtener todos los turnos cerrados de la semana
  const { data: shifts, error: shiftsError } = await supabase
    .from('shifts')
    .select('id, date')
    .eq('status', 'CLOSED')
    .gte('date', dateRange.start)
    .lte('date', dateRange.end);
  
  if (shiftsError || !shifts || shifts.length === 0) {
    return [];
  }
  
  const shiftIds = shifts.map(s => s.id);
  
  // Obtener todas las ventas de esos turnos
  const { data: salesData, error: salesError } = await supabase
    .from('sales')
    .select(`
      id,
      shift_id,
      sale_items (
        product_id,
        product_name,
        quantity,
        subtotal
      )
    `)
    .in('shift_id', shiftIds);
  
  if (salesError || !salesData) {
    console.error('Error fetching sales for week:', salesError);
    return [];
  }
  
  // Crear mapa de shift_id a fecha
  const shiftDateMap = new Map(shifts.map(s => [s.id, s.date]));
  
  // Agrupar ventas por producto y día
  const productDailyMap = new Map<string, Map<string, { quantity: number; subtotal: number }>>();
  const productNameMap = new Map<string, string>();
  
  salesData.forEach((sale: { id: string; shift_id: string; sale_items?: { product_id: string; product_name: string; quantity: number; subtotal: number }[] }) => {
    const date = shiftDateMap.get(sale.shift_id);
    if (!date || !sale.sale_items) return;
    
    sale.sale_items.forEach((item) => {
      if (!item.product_id) return;
      
      productNameMap.set(item.product_id, item.product_name);
      
      if (!productDailyMap.has(item.product_id)) {
        productDailyMap.set(item.product_id, new Map());
      }
      
      const dailyMap = productDailyMap.get(item.product_id)!;
      const current = dailyMap.get(date) || { quantity: 0, subtotal: 0 };
      dailyMap.set(date, {
        quantity: current.quantity + item.quantity,
        subtotal: current.subtotal + item.subtotal,
      });
    });
  });
  
  // Generar array de días de la semana
  const weekDays: { date: string; day_name: string }[] = [];
  const startDate = new Date(dateRange.start + 'T12:00:00');
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    weekDays.push({
      date: d.toISOString().split('T')[0],
      day_name: dayNames[d.getDay()],
    });
  }
  
  // Construir resultado
  const result: WeeklyProductSummary[] = [];
  
  productDailyMap.forEach((dailyMap, productId) => {
    const dailySales = weekDays.map(day => {
      const sale = dailyMap.get(day.date);
      return {
        date: day.date,
        day_name: day.day_name,
        quantity: sale?.quantity || 0,
        subtotal: sale?.subtotal || 0,
      };
    });
    
    const totalQuantity = dailySales.reduce((acc, d) => acc + d.quantity, 0);
    const totalSubtotal = dailySales.reduce((acc, d) => acc + d.subtotal, 0);
    
    result.push({
      product_id: productId,
      product_name: productNameMap.get(productId) || 'Producto desconocido',
      daily_sales: dailySales,
      total_quantity: totalQuantity,
      total_subtotal: totalSubtotal,
    });
  });
  
  // Ordenar por cantidad total vendida (descendente)
  return result.sort((a, b) => b.total_quantity - a.total_quantity);
}

/**
 * Obtiene reportes de ventas comparativos (semana actual, mes actual)
 */
export async function getSalesOverview() {
  const [weeklyReport, monthlyReport] = await Promise.all([
    getPeriodSalesReport('week'),
    getPeriodSalesReport('month'),
  ]);
  
  return {
    weekly: weeklyReport,
    monthly: monthlyReport,
  };
}

// =============================================
// TURNO ACTIVO Y GESTIÓN DE VENTAS
// =============================================

/**
 * Obtiene el turno abierto actual con todas sus ventas
 */
export async function getOpenShiftWithSales() {
  const supabase = await createClient();
  
  // Buscar cualquier turno abierto (sin filtrar por fecha para permitir turnos que cruzan medianoche)
  const { data: shift, error: shiftError } = await supabase
    .from('shifts')
    .select('*')
    .eq('status', 'OPEN')
    .order('opened_at', { ascending: false })
    .limit(1)
    .single();
  
  if (shiftError || !shift) {
    return null;
  }
  
  // Obtener ventas con items
  const { data: sales } = await supabase
    .from('sales')
    .select(`
      *,
      sale_items (*)
    `)
    .eq('shift_id', shift.id)
    .order('created_at', { ascending: false });
  
  const totalVentas = sales?.reduce((acc, s) => acc + s.total, 0) || 0;
  const totalProductos = sales?.reduce((acc, s) => {
    return acc + (s.sale_items?.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0) || 0);
  }, 0) || 0;
  
  return {
    shift,
    sales: sales || [],
    totalVentas,
    totalProductos,
  };
}

/**
 * Eliminar una venta (solo admin)
 */
export async function deleteSale(saleId: string) {
  const supabase = await createClient();
  
  // Verificar usuario y rol
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'No autenticado' };
  }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  
  if (profile?.role !== 'admin') {
    return { success: false, error: 'Solo administradores pueden eliminar ventas' };
  }
  
  // Obtener la venta para actualizar el turno
  const { data: sale, error: saleError } = await supabase
    .from('sales')
    .select('shift_id, total')
    .eq('id', saleId)
    .single();
  
  if (saleError || !sale) {
    return { success: false, error: 'Venta no encontrada' };
  }
  
  // Eliminar items de la venta primero
  await supabase
    .from('sale_items')
    .delete()
    .eq('sale_id', saleId);
  
  // Eliminar la venta
  const { error: deleteError } = await supabase
    .from('sales')
    .delete()
    .eq('id', saleId);
  
  if (deleteError) {
    return { success: false, error: deleteError.message };
  }
  
  // Actualizar ventas_no_pan del turno
  const { data: currentShift } = await supabase
    .from('shifts')
    .select('ventas_no_pan')
    .eq('id', sale.shift_id)
    .single();
  
  if (currentShift) {
    await supabase
      .from('shifts')
      .update({ 
        ventas_no_pan: Math.max(0, (currentShift.ventas_no_pan || 0) - sale.total) 
      })
      .eq('id', sale.shift_id);
  }
  
  revalidatePath('/reportes');
  revalidatePath('/pos');
  
  return { success: true };
}

/**
 * Obtiene el historial de turnos por día con sus ventas
 */
export async function getDailyShiftsHistory(limit: number = 30) {
  const supabase = await createClient();
  
  // Obtener todos los turnos (abiertos y cerrados) ordenados por fecha
  const { data: shifts, error } = await supabase
    .from('shifts')
    .select('*')
    .order('date', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching shifts history:', error);
    return [];
  }
  
  return shifts || [];
}

/**
 * Obtiene las ventas de un turno específico con detalles de items
 */
export async function getShiftSalesWithItems(shiftId: string) {
  const supabase = await createClient();
  
  const { data: sales, error } = await supabase
    .from('sales')
    .select(`
      *,
      sale_items (*)
    `)
    .eq('shift_id', shiftId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching shift sales:', error);
    return [];
  }
  
  return sales || [];
}

/**
 * Eliminar un turno completo (solo admin)
 * Esto elimina el turno y todos sus datos asociados (ventas, items, gastos)
 */
export async function deleteShift(shiftId: string) {
  const supabase = await createClient();
  
  // Verificar usuario y rol
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'No autenticado' };
  }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  
  if (profile?.role !== 'admin') {
    return { success: false, error: 'Solo administradores pueden eliminar turnos' };
  }
  
  // Verificar que el turno existe
  const { data: shift, error: shiftError } = await supabase
    .from('shifts')
    .select('id, status, date, opened_by_name')
    .eq('id', shiftId)
    .single();
  
  if (shiftError || !shift) {
    return { success: false, error: 'Turno no encontrado' };
  }
  
  // Obtener todas las ventas del turno
  const { data: sales } = await supabase
    .from('sales')
    .select('id')
    .eq('shift_id', shiftId);
  
  // Eliminar items de todas las ventas
  if (sales && sales.length > 0) {
    const saleIds = sales.map(s => s.id);
    await supabase
      .from('sale_items')
      .delete()
      .in('sale_id', saleIds);
  }
  
  // Eliminar ventas del turno
  await supabase
    .from('sales')
    .delete()
    .eq('shift_id', shiftId);
  
  // Eliminar gastos del turno
  await supabase
    .from('expenses')
    .delete()
    .eq('shift_id', shiftId);
  
  // Eliminar el turno
  const { error: deleteError } = await supabase
    .from('shifts')
    .delete()
    .eq('id', shiftId);
  
  if (deleteError) {
    return { success: false, error: deleteError.message };
  }
  
  revalidatePath('/reportes');
  revalidatePath('/pos');
  revalidatePath('/gastos');
  
  return { success: true };
}