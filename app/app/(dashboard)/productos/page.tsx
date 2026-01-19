import { Metadata } from "next";
import { getAllProducts, getCategories } from "@/lib/actions/products";
import { ProductsManager } from "@/components/products";

export const metadata: Metadata = {
  title: "Productos | Control Panadería",
  description: "Gestión del catálogo de productos",
};

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    getAllProducts(),
    getCategories(),
  ]);

  return (
    <div className="animate-fade-in">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
          Catálogo Maestro
        </h1>
        <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-[0.3em] mt-1">
          Gestión de productos y categorías
        </p>
      </header>

      <ProductsManager products={products} categories={categories} />
    </div>
  );
}
