'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ProductTable } from './product-table';
import { ProductForm } from './product-form';
import { CategoryList } from './category-list';
import type { Product, Category } from '@/lib/types/database';
import type { ProductWithCategory } from '@/lib/actions/products';
import { Plus, Tags } from 'lucide-react';

interface ProductsManagerProps {
  products: ProductWithCategory[];
  categories: Category[];
}

export function ProductsManager({ products, categories }: ProductsManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showCategories, setShowCategories] = useState(false);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const activeProducts = products.filter(p => p.is_active);
  const inactiveProducts = products.filter(p => !p.is_active);

  return (
    <>
      {/* Header con acciones */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Button
          variant="outline"
          onClick={() => setShowCategories(!showCategories)}
          className={showCategories ? 'bg-muted' : ''}
        >
          <Tags className="w-4 h-4 mr-2" />
          Categorías ({categories.length})
        </Button>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Producto
        </Button>
      </div>

      {/* Contenido */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lista de productos */}
        <div className={`${showCategories ? 'lg:col-span-2' : 'lg:col-span-3'} bg-card rounded-2xl border p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">
              Productos ({activeProducts.length})
            </h2>
            {inactiveProducts.length > 0 && (
              <span className="text-sm text-muted-foreground">
                {inactiveProducts.length} inactivos
              </span>
            )}
          </div>
          <ProductTable products={products} onEdit={handleEdit} />
        </div>

        {/* Panel de categorías */}
        {showCategories && (
          <div className="bg-card rounded-2xl border p-6 animate-fade-in">
            <CategoryList categories={categories} />
          </div>
        )}
      </div>

      {/* Modal de formulario */}
      {showForm && (
        <ProductForm
          categories={categories}
          product={editingProduct}
          onClose={handleClose}
        />
      )}
    </>
  );
}
