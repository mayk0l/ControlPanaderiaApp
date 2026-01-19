"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Expense, ExpenseOrigin } from "@/lib/types/database";

export type ExpenseActionResult = {
  success: boolean;
  data?: Expense;
  error?: string;
};

/**
 * Crear un nuevo gasto
 */
export async function createExpense(
  shiftId: string,
  description: string,
  amount: number,
  origin: ExpenseOrigin
): Promise<ExpenseActionResult> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "No autenticado" };
  }

  // Verificar que el turno está abierto
  const { data: shift, error: shiftError } = await supabase
    .from("shifts")
    .select("id")
    .eq("id", shiftId)
    .eq("opened_by", user.id)
    .eq("status", "OPEN")
    .single();

  if (shiftError || !shift) {
    return { success: false, error: "Turno no encontrado o cerrado" };
  }

  // Crear el gasto
  const { data, error } = await supabase
    .from("expenses")
    .insert({
      shift_id: shiftId,
      description: description,
      amount: amount,
      origin: origin,
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/gastos");
  revalidatePath("/pos");
  revalidatePath("/reportes");
  
  return { success: true, data: data as Expense };
}

/**
 * Obtener gastos del turno actual
 */
export async function getExpensesByShift(shiftId: string): Promise<Expense[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("shift_id", shiftId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching expenses:", error);
    return [];
  }

  return data as Expense[];
}

/**
 * Eliminar un gasto
 */
export async function deleteExpense(expenseId: string): Promise<ExpenseActionResult> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "No autenticado" };
  }

  // Verificar que el gasto pertenece a un turno del usuario
  const { data: expense, error: expenseError } = await supabase
    .from("expenses")
    .select(`
      id,
      shift:shifts!inner(opened_by, status)
    `)
    .eq("id", expenseId)
    .single();

  if (expenseError || !expense) {
    return { success: false, error: "Gasto no encontrado" };
  }

  const shiftData = expense.shift as unknown as { opened_by: string; status: string };
  if (shiftData.opened_by !== user.id || shiftData.status !== "OPEN") {
    return { success: false, error: "No tienes permiso para eliminar este gasto" };
  }

  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", expenseId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/gastos");
  revalidatePath("/pos");
  revalidatePath("/reportes");
  
  return { success: true };
}
