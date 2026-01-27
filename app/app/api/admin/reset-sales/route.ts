import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Cliente admin con service_role key
function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY no configurada");
  }
  
  return createAdminClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// DELETE - Borrar historial de ventas
export async function DELETE() {
  try {
    // Verificar que el usuario es admin
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    
    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const adminClient = getAdminClient();

    // Contar registros antes de borrar
    const { count: salesCount } = await adminClient
      .from("sales")
      .select("*", { count: "exact", head: true });
    
    const { count: expensesCount } = await adminClient
      .from("expenses")
      .select("*", { count: "exact", head: true });
    
    const { count: shiftsCount } = await adminClient
      .from("shifts")
      .select("*", { count: "exact", head: true });

    // Borrar en orden (respetando foreign keys)
    // 1. Sale items (depende de sales)
    const { error: saleItemsError } = await adminClient
      .from("sale_items")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Truco para borrar todos

    if (saleItemsError) {
      console.error("Error borrando sale_items:", saleItemsError);
    }

    // 2. Sales (depende de shifts)
    const { error: salesError } = await adminClient
      .from("sales")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (salesError) {
      console.error("Error borrando sales:", salesError);
    }

    // 3. Expenses (depende de shifts)
    const { error: expensesError } = await adminClient
      .from("expenses")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (expensesError) {
      console.error("Error borrando expenses:", expensesError);
    }

    // 4. Shifts
    const { error: shiftsError } = await adminClient
      .from("shifts")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (shiftsError) {
      console.error("Error borrando shifts:", shiftsError);
    }

    return NextResponse.json({
      success: true,
      deleted: {
        sales: salesCount || 0,
        expenses: expensesCount || 0,
        shifts: shiftsCount || 0,
      },
    });
  } catch (error) {
    console.error("Error resetting sales data:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
