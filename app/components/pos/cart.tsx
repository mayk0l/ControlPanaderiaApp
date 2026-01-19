"use client";

import { CartItem } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onCheckout: () => void;
  isCheckingOut?: boolean;
}

export function Cart({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
  isCheckingOut = false,
}: CartProps) {
  const total = items.reduce((sum, item) => sum + item.subtotal, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <ShoppingCart className="h-12 w-12 mb-4 opacity-50" />
        <p className="font-medium">Carrito vacío</p>
        <p className="text-sm">Selecciona productos para agregar</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-primary" />
          <span className="font-bold">{itemCount} items</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearCart}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Limpiar
        </Button>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto space-y-3 max-h-[300px]">
        {items.map((item) => (
          <div
            key={item.product_id}
            className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{item.product_name}</p>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(item.price)} c/u
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => {
                  if (item.quantity > 1) {
                    onUpdateQuantity(item.product_id, item.quantity - 1);
                  } else {
                    onRemoveItem(item.product_id);
                  }
                }}
                disabled={isCheckingOut}
              >
                <Minus className="h-3 w-3" />
              </Button>
              
              <span className="w-8 text-center font-bold tabular-nums">
                {item.quantity}
              </span>
              
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => onUpdateQuantity(item.product_id, item.quantity + 1)}
                disabled={isCheckingOut}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            <div className="w-20 text-right">
              <p className="font-bold text-sm">
                {formatCurrency(item.subtotal)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Total y checkout */}
      <div className="mt-4 pt-4 border-t space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-lg font-medium">Total</span>
          <span className="text-2xl font-black text-primary">
            {formatCurrency(total)}
          </span>
        </div>

        <Button
          size="lg"
          className="w-full"
          onClick={onCheckout}
          disabled={isCheckingOut || items.length === 0}
        >
          {isCheckingOut ? "Procesando..." : "Confirmar Venta"}
        </Button>
      </div>
    </div>
  );
}
