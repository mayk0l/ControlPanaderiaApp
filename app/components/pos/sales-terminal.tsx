"use client";

import { useState, useTransition } from "react";
import { Product, Category, CartItem, Shift } from "@/lib/types/database";
import { ProductCatalog } from "./product-catalog";
import { Cart } from "./cart";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { createSale } from "@/lib/actions/sales";
import { useRouter } from "next/navigation";

interface ProductWithCategory extends Product {
  category: Category | null;
}

interface SalesTerminalProps {
  shift: Shift;
  products: ProductWithCategory[];
  categories: Category[];
}

export function SalesTerminal({ shift, products, categories }: SalesTerminalProps) {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleAddToCart = (item: CartItem) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.product_id === item.product_id);
      
      if (existingIndex >= 0) {
        // Incrementar cantidad si ya existe
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
          subtotal: (updated[existingIndex].quantity + 1) * updated[existingIndex].price,
        };
        return updated;
      }
      
      // Agregar nuevo item
      return [...prev, item];
    });
    setMessage(null);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.product_id === productId
          ? { ...item, quantity, subtotal: quantity * item.price }
          : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product_id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
    setMessage(null);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    startTransition(async () => {
      const result = await createSale(shift.id, cartItems);
      
      if (result.success) {
        setCartItems([]);
        setMessage({ type: "success", text: "¡Venta registrada con éxito!" });
        setTimeout(() => setMessage(null), 3000);
        router.refresh();
      } else {
        setMessage({ type: "error", text: result.error || "Error al procesar venta" });
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Catálogo de productos - 2 columnas */}
      <div className="lg:col-span-2">
        <DashboardCard title="🛒 Productos" borderColor="blue" className="h-full">
          <ProductCatalog
            products={products}
            categories={categories}
            onAddToCart={handleAddToCart}
          />
        </DashboardCard>
      </div>

      {/* Carrito - 1 columna */}
      <div className="lg:col-span-1">
        <DashboardCard title="🧾 Carrito" borderColor="green" className="h-full">
          {message && (
            <div
              className={`mb-4 p-3 rounded-xl text-sm font-medium ${
                message.type === "success"
                  ? "bg-success/10 text-success border border-success/20"
                  : "bg-destructive/10 text-destructive border border-destructive/20"
              }`}
            >
              {message.text}
            </div>
          )}
          <Cart
            items={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onCheckout={handleCheckout}
            isCheckingOut={isPending}
          />
        </DashboardCard>
      </div>
    </div>
  );
}
