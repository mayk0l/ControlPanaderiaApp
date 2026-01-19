'use client';

import { useState, useTransition } from 'react';
import type { Product } from '@/lib/types/database';
import type { ProductWithCategory } from '@/lib/actions/products';
import { deleteProduct, restoreProduct } from '@/lib/actions/products';
import { formatMoney } from '@/lib/utils';
import { Edit2, Trash2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductTableProps {
  products: ProductWithCategory[];
  onEdit: (product: Product) => void;
}

export function ProductTable({ products, onEdit }: ProductTableProps) {
  const [isPending, startTransition] = useTransition();
  const [actionId, setActionId] = useState<string | null>(null);

  const handleDelete = (productId: string) => {
    if (!confirm('¿Desactivar este producto? No aparecerá en el POS.')) return;
    
    setActionId(productId);
    startTransition(async () => {
      await deleteProduct(productId);
      setActionId(null);
    });
  };

  const handleRestore = (productId: string) => {
    setActionId(productId);
    startTransition(async () => {
      await restoreProduct(productId);
      setActionId(null);
    });
  };

  const getMargin = (price: number, cost: number) => {
    if (price === 0) return 0;
    return ((price - cost) / price * 100);
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No hay productos registrados
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
            <th className="pb-3 font-bold">Producto</th>
            <th className="pb-3 font-bold">Categoría</th>
            <th className="pb-3 font-bold text-right">Precio</th>
            <th className="pb-3 font-bold text-right">Costo</th>
            <th className="pb-3 font-bold text-right">Margen</th>
            <th className="pb-3 font-bold text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {products.map((product) => {
            const margin = getMargin(product.price, product.cost);
            const isLoading = isPending && actionId === product.id;

            return (
              <tr 
                key={product.id} 
                className={`group hover:bg-muted/50 transition-colors ${!product.is_active ? 'opacity-50' : ''}`}
              >
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{product.name}</span>
                    {!product.is_active && (
                      <span className="text-[10px] uppercase tracking-wider bg-muted px-2 py-0.5 rounded-full">
                        Inactivo
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3 text-muted-foreground">
                  {product.category?.name || '—'}
                </td>
                <td className="py-3 text-right font-mono">
                  {formatMoney(product.price)}
                </td>
                <td className="py-3 text-right font-mono text-muted-foreground">
                  {formatMoney(product.cost)}
                </td>
                <td className="py-3 text-right">
                  <span className={`font-mono font-bold ${
                    margin >= 40 ? 'text-success' : 
                    margin >= 25 ? 'text-warning' : 
                    'text-destructive'
                  }`}>
                    {margin.toFixed(0)}%
                  </span>
                </td>
                <td className="py-3">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {product.is_active ? (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(product)}
                          disabled={isLoading}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(product.id)}
                          disabled={isLoading}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRestore(product.id)}
                        disabled={isLoading}
                        className="text-success hover:text-success"
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Restaurar
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
