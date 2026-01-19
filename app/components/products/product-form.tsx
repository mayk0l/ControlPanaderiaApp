'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { createProduct, updateProduct } from '@/lib/actions/products';
import type { Product, Category } from '@/lib/types/database';
import { X } from 'lucide-react';

interface ProductFormProps {
  categories: Category[];
  product?: Product | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ProductForm({ categories, product, onClose, onSuccess }: ProductFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: product?.name || '',
    price: product?.price?.toString() || '',
    cost: product?.cost?.toString() || '',
    category_id: product?.category_id || '',
  });

  const isEditing = !!product;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('El nombre es requerido');
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price < 0) {
      setError('El precio debe ser un número válido');
      return;
    }

    const cost = parseFloat(formData.cost) || 0;

    startTransition(async () => {
      const data = {
        name: formData.name.trim(),
        price,
        cost,
        category_id: formData.category_id || null,
      };

      let result;
      if (isEditing && product) {
        result = await updateProduct(product.id, data);
      } else {
        result = await createProduct(data);
      }

      if (!result.success) {
        setError(result.error || 'Error al guardar producto');
        return;
      }

      onSuccess?.();
      onClose();
    });
  };

  const margin = formData.price && formData.cost 
    ? ((parseFloat(formData.price) - parseFloat(formData.cost)) / parseFloat(formData.price) * 100).toFixed(1)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
      <div className="bg-card rounded-2xl border shadow-xl w-full max-w-md mx-4 animate-slide-up">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold">
            {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
              {error}
            </div>
          )}

          <FormField label="Nombre del producto" required>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Empanada de pino"
              autoFocus
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Precio venta ($)" required>
              <Input
                type="number"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0"
              />
            </FormField>

            <FormField label="Costo ($)">
              <Input
                type="number"
                min="0"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                placeholder="0"
              />
            </FormField>
          </div>

          {margin && parseFloat(margin) > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Margen:</span>
              <span className={`font-bold ${parseFloat(margin) >= 30 ? 'text-success' : 'text-warning'}`}>
                {margin}%
              </span>
            </div>
          )}

          <FormField label="Categoría">
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full h-10 px-3 rounded-lg border bg-background text-sm"
            >
              <option value="">Sin categoría</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </FormField>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isPending}
            >
              {isPending ? 'Guardando...' : isEditing ? 'Guardar' : 'Crear'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
