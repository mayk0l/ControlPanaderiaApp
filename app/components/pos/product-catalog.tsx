"use client";

import { useState } from "react";
import { Product, Category, CartItem } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Package } from "lucide-react";

interface ProductWithCategory extends Product {
  category: Category | null;
}

interface ProductCatalogProps {
  products: ProductWithCategory[];
  categories: Category[];
  onAddToCart: (item: CartItem) => void;
}

export function ProductCatalog({ products, categories, onAddToCart }: ProductCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category_id === selectedCategory)
    : products;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleAddProduct = (product: ProductWithCategory) => {
    const cartItem: CartItem = {
      product_id: product.id,
      product_name: product.name,
      price: product.price,
      cost: product.cost,
      quantity: 1,
      subtotal: product.price,
    };
    onAddToCart(cartItem);
  };

  return (
    <div className="space-y-4">
      {/* Filtro por categorías */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory(null)}
        >
          Todos
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.name}
          </Button>
        ))}
      </div>

      {/* Grilla de productos */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No hay productos disponibles</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => handleAddProduct(product)}
              className={cn(
                "flex flex-col items-center justify-center p-4 rounded-xl border-2",
                "bg-card hover:bg-accent transition-all duration-200",
                "hover:border-primary hover:shadow-md active:scale-95"
              )}
            >
              <div className="text-3xl mb-2">
                {product.category?.name === "Bebidas" ? "🥤" : 
                 product.category?.name === "Dulces" ? "🍬" : 
                 product.category?.name === "Snacks" ? "🍿" : "📦"}
              </div>
              <p className="font-semibold text-sm text-center line-clamp-2 mb-1">
                {product.name}
              </p>
              <p className="text-lg font-bold text-primary">
                {formatCurrency(product.price)}
              </p>
              {product.category && (
                <Badge variant="muted" className="mt-2 text-[10px]">
                  {product.category.name}
                </Badge>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
