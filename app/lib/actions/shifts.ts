"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Shift, ClosingData } from "@/lib/types/database";

export type ShiftActionResult = {
  success: boolean;
  data?: Shift;
  error?: string;
};

/**
 * Obtener el turno activo actual
 */
export async function getCurrentShift(): Promise<ShiftActionResult> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "No autenticado" };
  }

  const { data, error } = await supabase
    .from("shifts")
    .select("*")
    .eq("opened_by", user.id)
    .eq("status", "OPEN")
    .order("opened_at", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") { // PGRST116 = no rows returned
    return { success: false, error: error.message };
  }

  return { success: true, data: data as Shift || undefined };
}

/**
 * Abrir un nuevo turno
 */
export async function openShift(openingCash: number): Promise<ShiftActionResult> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "No autenticado" };
  }

  // Obtener perfil para el nombre
  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", user.id)
    .single();

  // Verificar que no haya un turno abierto
  const { data: existingShift } = await supabase
    .from("shifts")
    .select("id")
    .eq("opened_by", user.id)
    .eq("status", "OPEN")
    .limit(1)
    .single();

  if (existingShift) {
    return { success: false, error: "Ya hay un turno abierto" };
  }

  // Obtener configuración actual de pan
  const { data: configData } = await supabase
    .from("config")
    .select("value")
    .eq("key", "pan_config")
    .single();

  const { data, error } = await supabase
    .from("shifts")
    .insert({
      opened_by: user.id,
      opened_by_name: profile?.name || "Usuario",
      opening_cash: openingCash,
      status: "OPEN",
      config_snapshot: configData?.value || { kilos_por_bandeja: 3.2, precio_por_kilo: 2000 },
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/pos");
  revalidatePath("/gastos");
  revalidatePath("/reportes");
  
  return { success: true, data: data as Shift };
}

/**
 * Cerrar el turno actual
 */
export async function closeShift(
  shiftId: string,
  closingData: ClosingData
): Promise<ShiftActionResult> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "No autenticado" };
  }

  // Obtener el turno y verificar que pertenece al usuario
  const { data: shift, error: shiftError } = await supabase
    .from("shifts")
    .select("*")
    .eq("id", shiftId)
    .eq("opened_by", user.id)
    .eq("status", "OPEN")
    .single();

  if (shiftError || !shift) {
    return { success: false, error: "Turno no encontrado o ya cerrado" };
  }

  // Actualizar turno con datos de cierre
  const { data, error } = await supabase
    .from("shifts")
    .update({
      closed_at: new Date().toISOString(),
      status: "CLOSED",
      closing_data: closingData,
    })
    .eq("id", shiftId)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/pos");
  revalidatePath("/gastos");
  revalidatePath("/reportes");
  
  return { success: true, data: data as Shift };
}

/**
 * Obtener estadísticas del turno actual
 */
export async function getShiftStats(shiftId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  // Obtener turno
  const { data: shift } = await supabase
    .from("shifts")
    .select("*")
    .eq("id", shiftId)
    .eq("opened_by", user.id)
    .single();

  if (!shift) return null;

  // Ventas del turno
  const { data: sales } = await supabase
    .from("sales")
    .select("id, total")
    .eq("shift_id", shiftId);

  // Gastos del turno
  const { data: expenses } = await supabase
    .from("expenses")
    .select("id, amount, origin")
    .eq("shift_id", shiftId);

  const totalSales = sales?.reduce((sum: number, s: { total: number }) => sum + s.total, 0) || 0;
  const totalExpenses = expenses?.reduce((sum: number, e: { amount: number }) => sum + e.amount, 0) || 0;
  const gastosCaja = expenses?.filter((e: { origin: string }) => e.origin === "GENERAL").reduce((sum: number, e: { amount: number }) => sum + e.amount, 0) || 0;
  const gastosPan = expenses?.filter((e: { origin: string }) => e.origin === "PAN").reduce((sum: number, e: { amount: number }) => sum + e.amount, 0) || 0;
  const gastosNoPan = expenses?.filter((e: { origin: string }) => e.origin === "NO_PAN").reduce((sum: number, e: { amount: number }) => sum + e.amount, 0) || 0;
  
  // Calcular venta de pan estimada
  const configSnapshot = shift.config_snapshot as { kilos_por_bandeja: number; precio_por_kilo: number };
  const kilosPorBandeja = configSnapshot?.kilos_por_bandeja || 3.2;
  const precioPorKilo = configSnapshot?.precio_por_kilo || 2000;
  const ventaPanEstimada = (shift.bandejas_sacadas || 0) * kilosPorBandeja * precioPorKilo;
  
  const expectedCash = shift.opening_cash + totalSales - gastosCaja;

  return {
    shift: shift as Shift,
    salesCount: sales?.length || 0,
    expensesCount: expenses?.length || 0,
    totalSales,
    totalExpenses,
    gastosCaja,
    gastosPan,
    gastosNoPan,
    ventaPanEstimada,
    ventasNoPan: shift.ventas_no_pan || 0,
    expectedCash,
    netTotal: totalSales - totalExpenses,
  };
}
