// =============================================
// TIPOS DE BASE DE DATOS - Control Panadería App
// =============================================
// Generados manualmente basados en schema.sql
// En producción, usar: npx supabase gen types typescript
// =============================================

export type UserRole = 'admin' | 'vendedor';

export type ShiftStatus = 'OPEN' | 'CLOSED';

export type ExpenseOrigin = 'GENERAL' | 'PAN' | 'NO_PAN';

// =============================================
// PERFILES
// =============================================

export interface Profile {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface ProfileInsert {
  id: string;
  name: string;
  username: string;
  role?: UserRole;
}

export interface ProfileUpdate {
  name?: string;
  username?: string;
  role?: UserRole;
}

// =============================================
// CATEGORÍAS
// =============================================

export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface CategoryInsert {
  name: string;
}

export interface CategoryUpdate {
  name?: string;
}

// =============================================
// PRODUCTOS
// =============================================

export interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
  category_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductWithCategory extends Product {
  category_name: string | null;
  margin_percentage: number;
}

export interface ProductInsert {
  name: string;
  price: number;
  cost?: number;
  category_id?: string | null;
  is_active?: boolean;
}

export interface ProductUpdate {
  name?: string;
  price?: number;
  cost?: number;
  category_id?: string | null;
  is_active?: boolean;
}

// =============================================
// CONFIGURACIÓN
// =============================================

export interface PanConfig {
  kilos_por_bandeja: number;
  precio_por_kilo: number;
}

export interface Config {
  id: string;
  key: string;
  value: PanConfig | Record<string, unknown>;
  updated_at: string;
}

// =============================================
// TURNOS (SHIFTS)
// =============================================

export interface ClosingData {
  pan_adjustment: number;
  pan_reason: string;
  counted_cash: number;
  expected_cash: number;
  difference: number;
  final_bandejas?: number;
  bruto_pan?: number;
  bruto_no_pan?: number;
  gastos_caja?: number;
  neto_final?: number;
}

export interface Shift {
  id: string;
  date: string;
  status: ShiftStatus;
  opening_cash: number;
  opened_at: string;
  opened_by: string | null;
  opened_by_name: string | null;
  bandejas_sacadas: number;
  ventas_no_pan: number;
  config_snapshot: PanConfig;
  closed_at: string | null;
  closed_by: string | null;
  closed_by_name: string | null;
  closing_data: ClosingData | null;
  created_at: string;
  updated_at: string;
}

export interface ShiftWithSummary extends Shift {
  gastos_caja: number;
  gastos_pan: number;
  gastos_no_pan: number;
  gastos_general: number;
  venta_pan_estimada: number;
}

export interface ShiftInsert {
  date?: string;
  status?: ShiftStatus;
  opening_cash: number;
  opened_by?: string;
  opened_by_name?: string;
  config_snapshot?: PanConfig;
}

export interface ShiftUpdate {
  status?: ShiftStatus;
  bandejas_sacadas?: number;
  ventas_no_pan?: number;
  closed_at?: string;
  closing_data?: ClosingData;
}

// =============================================
// VENTAS
// =============================================

export interface Sale {
  id: string;
  shift_id: string;
  total: number;
  sold_by: string | null;
  sold_by_name: string | null;
  created_at: string;
}

export interface SaleInsert {
  shift_id: string;
  total: number;
  sold_by?: string;
  sold_by_name?: string;
}

// =============================================
// ITEMS DE VENTA
// =============================================

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string | null;
  product_name: string;
  price: number;
  cost: number;
  quantity: number;
  subtotal: number;
  created_at: string;
}

export interface SaleItemInsert {
  sale_id: string;
  product_id?: string | null;
  product_name: string;
  price: number;
  cost?: number;
  quantity: number;
  subtotal: number;
}

// =============================================
// GASTOS
// =============================================

export interface Expense {
  id: string;
  shift_id: string;
  description: string;
  amount: number;
  origin: ExpenseOrigin;
  from_cash: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExpenseInsert {
  shift_id: string;
  description: string;
  amount: number;
  origin?: ExpenseOrigin;
  from_cash?: boolean;
}

export interface ExpenseUpdate {
  description?: string;
  amount?: number;
  origin?: ExpenseOrigin;
  from_cash?: boolean;
}

// =============================================
// ITEM DEL CARRITO (para el POS, no en DB)
// =============================================

export interface CartItem {
  product_id: string;
  product_name: string;
  price: number;
  cost: number;
  quantity: number;
  subtotal: number;
}

// =============================================
// ESTADÍSTICAS DEL TURNO (calculadas)
// =============================================

export interface ShiftStats {
  bruto_pan: number;
  bruto_no_pan: number;
  gastos_caja: number;
  gastos_total: number;
  cogs: number;
  cash_in_drawer: number;
  neto_final: number;
}

// =============================================
// TIPOS PARA REPORTES
// =============================================

export interface ReportData {
  venta_pan: number;
  gastos_pan: number;
  ganancia_pan: number;
  venta_no_pan: number;
  cogs_no_pan: number;
  gastos_no_pan: number;
  ganancia_no_pan: number;
  gastos_general: number;
  utilidad_neta: number;
}

export type ReportPeriod = 'day' | 'week' | 'month';

// =============================================
// TIPOS PARA REPORTES SEMANALES/MENSUALES
// =============================================

export interface PeriodSalesReport {
  period_start: string;
  period_end: string;
  total_bandejas: number;
  venta_pan: number;
  venta_no_pan: number;
  total_ventas: number;
  total_turnos: number;
}

export interface DailyProductSales {
  date: string;
  product_name: string;
  product_id: string;
  quantity: number;
  subtotal: number;
}

export interface WeeklyProductSummary {
  product_id: string;
  product_name: string;
  daily_sales: {
    date: string;
    day_name: string;
    quantity: number;
    subtotal: number;
  }[];
  total_quantity: number;
  total_subtotal: number;
}
