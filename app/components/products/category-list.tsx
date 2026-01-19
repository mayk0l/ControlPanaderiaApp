'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Category } from '@/lib/types/database';
import { createCategory, updateCategory, deleteCategory } from '@/lib/actions/products';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';

interface CategoryListProps {
  categories: Category[];
}

export function CategoryList({ categories }: CategoryListProps) {
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAdd = () => {
    if (!newName.trim()) return;
    
    setError(null);
    startTransition(async () => {
      const result = await createCategory({ name: newName.trim() });
      if (!result.success) {
        setError(result.error || 'Error al crear categoría');
        return;
      }
      setNewName('');
      setIsAdding(false);
    });
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setEditingName(category.name);
    setError(null);
  };

  const handleSave = (categoryId: string) => {
    if (!editingName.trim()) return;
    
    setError(null);
    startTransition(async () => {
      const result = await updateCategory(categoryId, editingName.trim());
      if (!result.success) {
        setError(result.error || 'Error al actualizar categoría');
        return;
      }
      setEditingId(null);
      setEditingName('');
    });
  };

  const handleDelete = (categoryId: string) => {
    if (!confirm('¿Eliminar esta categoría? Solo se puede si no tiene productos.')) return;
    
    setError(null);
    startTransition(async () => {
      const result = await deleteCategory(categoryId);
      if (!result.success) {
        setError(result.error || 'Error al eliminar categoría');
      }
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingName('');
    setIsAdding(false);
    setNewName('');
    setError(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
          Categorías ({categories.length})
        </h3>
        {!isAdding && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAdding(true)}
            disabled={isPending}
          >
            <Plus className="w-4 h-4 mr-1" />
            Nueva
          </Button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-2">
        {/* Formulario para nueva categoría */}
        {isAdding && (
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nombre de categoría"
              className="flex-1 h-8 text-sm"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd();
                if (e.key === 'Escape') handleCancel();
              }}
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-success"
              onClick={handleAdd}
              disabled={isPending || !newName.trim()}
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleCancel}
              disabled={isPending}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Lista de categorías */}
        {categories.length === 0 && !isAdding ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No hay categorías
          </p>
        ) : (
          categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
            >
              {editingId === category.id ? (
                <>
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="flex-1 h-8 text-sm"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSave(category.id);
                      if (e.key === 'Escape') handleCancel();
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-success"
                    onClick={() => handleSave(category.id)}
                    disabled={isPending || !editingName.trim()}
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleCancel}
                    disabled={isPending}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <>
                  <span className="flex-1 font-medium">{category.name}</span>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEdit(category)}
                      disabled={isPending}
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(category.id)}
                      disabled={isPending}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
