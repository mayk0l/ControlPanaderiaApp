"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { CartItem, Sale } from "@/lib/types/database";

export type SaleActionResult = {
  success: boolean;
  data?: Sale;
  error?: string;
};

/**
 * Crear una nueva venta
 */
export async function createSale(
  shiftId: string,
  items: CartItem[]
): Promise<SaleActionResult> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "No autenticado" };
  }

  // Obtener perfil para el nombre de quien vende
  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", user.id)
    .single();

  // Verificar que el turno está abierto (cualquier usuario puede vender)
  const { data: shift, error: shiftError } = await supabase
    .from("shifts")
    .select("id")
    .eq("id", shiftId)
    .eq("status", "OPEN")
    .single();

  if (shiftError || !shift) {
    return { success: false, error: "Turno no encontrado o cerrado" };
  }

  // Calcular total
  const total = items.reduce((sum, item) => sum + item.subtotal, 0);

  // Crear la venta con información del vendedor
  const { data: sale, error: saleError } = await supabase
    .from("sales")
    .insert({
      shift_id: shiftId,
      total: total,
      sold_by: user.id,
      sold_by_name: profile?.name || "Usuario",
    })
    .select()
    .single();

  if (saleError || !sale) {
    return { success: false, error: saleError?.message || "Error al crear venta" };
  }

  // Crear items de venta
  const saleItems = items.map((item) => ({
    sale_id: sale.id,
    product_id: item.product_id,
    product_name: item.product_name,
    price: item.price,
    cost: item.cost,
    quantity: item.quantity,
    subtotal: item.subtotal,
  }));

  const { error: itemsError } = await supabase
    .from("sale_items")
    .insert(saleItems);

  if (itemsError) {
    // Si falla, eliminar la venta
    await supabase.from("sales").delete().eq("id", sale.id);
    return { success: false, error: itemsError.message };
  }

  // Actualizar ventas_no_pan del turno
  const { data: currentShift } = await supabase
    .from("shifts")
    .select("ventas_no_pan")
    .eq("id", shiftId)
    .single();

  if (currentShift) {
    await supabase
      .from("shifts")
      .update({ ventas_no_pan: (currentShift.ventas_no_pan || 0) + total })
      .eq("id", shiftId);
  }

  revalidatePath("/pos");
  revalidatePath("/reportes");
  
  return { success: true, data: sale as Sale };
}

/**
 * Obtener ventas del turno actual
 */
export async function getSalesByShift(shiftId: string): Promise<Sale[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sales")
    .select("*")
    .eq("shift_id", shiftId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching sales:", error);
    return [];
  }

  return data as Sale[];
}
