"use server";

import { createClient } from "@/lib/supabase/server";
import { Product, Category } from "@/lib/types/database";

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
