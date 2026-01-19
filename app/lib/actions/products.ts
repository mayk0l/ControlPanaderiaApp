"use server";

import { createClient } from "@/lib/supabase/server";
import { Product, Category, ProductInsert, ProductUpdate, CategoryInsert } from "@/lib/types/database";
import { revalidatePath } from "next/cache";

export type ProductWithCategory = Product & {
  category: Category | null;
};

/**
 * Obtener todos los productos activos con su categoría
 */
export async function getProducts(): Promise<ProductWithCategory[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      category:categories(*)
    `)
    .eq("is_active", true)
    .order("name");

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  return data as ProductWithCategory[];
}

/**
 * Obtener todos los productos (incluyendo inactivos) para admin
 */
export async function getAllProducts(): Promise<ProductWithCategory[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      category:categories(*)
    `)
    .order("is_active", { ascending: false })
    .order("name");

  if (error) {
    console.error("Error fetching all products:", error);
    return [];
  }

  return data as ProductWithCategory[];
}

/**
 * Obtener todas las categorías
 */
export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  return data as Category[];
}

/**
 * Obtener productos por categoría
 */
export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category_id", categoryId)
    .eq("is_active", true)
    .order("name");

  if (error) {
    console.error("Error fetching products by category:", error);
    return [];
  }

  return data as Product[];
}

/**
 * Crear un nuevo producto
 */
export async function createProduct(data: ProductInsert): Promise<{ success: boolean; error?: string; product?: Product }> {
  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from("products")
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error("Error creating product:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/productos");
  revalidatePath("/pos");
  
  return { success: true, product };
}

/**
 * Actualizar un producto existente
 */
export async function updateProduct(
  productId: string, 
  data: ProductUpdate
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("products")
    .update(data)
    .eq("id", productId);

  if (error) {
    console.error("Error updating product:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/productos");
  revalidatePath("/pos");
  
  return { success: true };
}

/**
 * Desactivar un producto (soft delete)
 */
export async function deleteProduct(productId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("products")
    .update({ is_active: false })
    .eq("id", productId);

  if (error) {
    console.error("Error deleting product:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/productos");
  revalidatePath("/pos");
  
  return { success: true };
}

/**
 * Reactivar un producto
 */
export async function restoreProduct(productId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("products")
    .update({ is_active: true })
    .eq("id", productId);

  if (error) {
    console.error("Error restoring product:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/productos");
  revalidatePath("/pos");
  
  return { success: true };
}

// =============================================
// CATEGORÍAS
// =============================================

/**
 * Crear una nueva categoría
 */
export async function createCategory(data: CategoryInsert): Promise<{ success: boolean; error?: string; category?: Category }> {
  const supabase = await createClient();

  const { data: category, error } = await supabase
    .from("categories")
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error("Error creating category:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/productos");
  
  return { success: true, category };
}

/**
 * Actualizar una categoría
 */
export async function updateCategory(
  categoryId: string, 
  name: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("categories")
    .update({ name })
    .eq("id", categoryId);

  if (error) {
    console.error("Error updating category:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/productos");
  
  return { success: true };
}

/**
 * Eliminar una categoría (solo si no tiene productos)
 */
export async function deleteCategory(categoryId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // Verificar si hay productos con esta categoría
  const { count, error: countError } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("category_id", categoryId);

  if (countError) {
    console.error("Error checking category products:", countError);
    return { success: false, error: countError.message };
  }

  if (count && count > 0) {
    return { success: false, error: `No se puede eliminar: hay ${count} productos en esta categoría` };
  }

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", categoryId);

  if (error) {
    console.error("Error deleting category:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/productos");
  
  return { success: true };
}
