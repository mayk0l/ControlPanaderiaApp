"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type BandejaActionResult = {
  success: boolean;
  newCount?: number;
  error?: string;
};

/**
 * Incrementar el contador de bandejas del turno actual
 */
export async function incrementBandejas(shiftId: string): Promise<BandejaActionResult> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "No autenticado" };
  }

  // Obtener turno actual
  const { data: shift, error: shiftError } = await supabase
    .from("shifts")
    .select("bandejas_sacadas")
    .eq("id", shiftId)
    .eq("opened_by", user.id)
    .eq("status", "OPEN")
    .single();

  if (shiftError || !shift) {
    return { success: false, error: "Turno no encontrado" };
  }

  const newCount = (shift.bandejas_sacadas || 0) + 1;

  const { error } = await supabase
    .from("shifts")
    .update({ bandejas_sacadas: newCount })
    .eq("id", shiftId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/pos");
  return { success: true, newCount };
}

/**
 * Decrementar el contador de bandejas del turno actual
 */
export async function decrementBandejas(shiftId: string): Promise<BandejaActionResult> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "No autenticado" };
  }

  // Obtener turno actual
  const { data: shift, error: shiftError } = await supabase
    .from("shifts")
    .select("bandejas_sacadas")
    .eq("id", shiftId)
    .eq("opened_by", user.id)
    .eq("status", "OPEN")
    .single();

  if (shiftError || !shift) {
    return { success: false, error: "Turno no encontrado" };
  }

  if ((shift.bandejas_sacadas || 0) <= 0) {
    return { success: false, error: "No hay bandejas para decrementar" };
  }

  const newCount = (shift.bandejas_sacadas || 0) - 1;

  const { error } = await supabase
    .from("shifts")
    .update({ bandejas_sacadas: newCount })
    .eq("id", shiftId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/pos");
  return { success: true, newCount };
}

/**
 * Establecer el contador de bandejas directamente
 */
export async function setBandejas(shiftId: string, count: number): Promise<BandejaActionResult> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "No autenticado" };
  }

  if (count < 0) {
    return { success: false, error: "El contador no puede ser negativo" };
  }

  const { error } = await supabase
    .from("shifts")
    .update({ bandejas_sacadas: count })
    .eq("id", shiftId)
    .eq("opened_by", user.id)
    .eq("status", "OPEN");

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/pos");
  return { success: true, newCount: count };
}
