'use client';

import { useState, useMemo, useTransition } from 'react';
import { DashboardCard } from '@/components/ui/dashboard-card';
import { Button } from '@/components/ui/button';
import { Shift, Product, Category } from '@/lib/types/database';
import { createSale } from '@/lib/actions/sales';
import { Search, Tags, ShoppingCart, X, Lock, CheckCircle2 } from 'lucide-react';
import { formatMoney } from '@/lib/utils';
import { ModalPortal } from '@/components/ui/modal-portal';

interface ProductWithCategory extends Product {
  category: Category | null;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  cost: number;
  qty: number;
}

interface POSTerminalProps {
  shift: Shift | null;
  products: ProductWithCategory[];
  categories: Category[];
}

export function POSTerminal({ shift, products, categories }: POSTerminalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isShiftOpen = shift?.status === 'OPEN';

  // Agrupar productos por categoría
  const groupedProducts = useMemo(() => {
    const filtered = products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const groups: Record<string, ProductWithCategory[]> = {};
    categories.forEach(cat => groups[cat.name] = []);
    groups['Sin Categoría'] = [];
    
    filtered.forEach(product => {
      const catName = product.category?.name || 'Sin Categoría';
      if (!groups[catName]) groups[catName] = [];
      groups[catName].push(product);
    });
    
    return Object.entries(groups).filter(([, items]) => items.length > 0);
  }, [products, categories, searchTerm]);

  const addToCart = (product: ProductWithCategory) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        price: product.price,
        cost: product.cost,
        qty: 1,
      }];
    });
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const processSale = () => {
    if (!shift || cart.length === 0) return;

    startTransition(async () => {
      const items = cart.map(item => ({
        product_id: item.id,
        product_name: item.name,
        price: item.price,
        cost: item.cost,
        quantity: item.qty,
        subtotal: item.price * item.qty,
      }));

      const result = await createSale(shift.id, items);
      
      if (result.success) {
        setCart([]);
        setShowConfirmModal(false);
      }
    });
  };

  return (
    <div className={`relative ${!isShiftOpen ? 'opacity-50 pointer-events-none' : ''}`}>
      {!isShiftOpen && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/20 backdrop-blur-[1px] rounded-2xl">
          <div className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xl">
            <Lock size={14} /> CAJA CERRADA
          </div>
        </div>
      )}

      <DashboardCard title="Ventas NO PAN">
        {/* Buscador */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Buscar producto..."
            disabled={!isShiftOpen}
            className="w-full pl-10 pr-4 py-3 bg-muted/50 border-none rounded-xl outline-none text-foreground placeholder:text-muted-foreground"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Catálogo agrupado */}
        <div className="space-y-8 max-h-[400px] overflow-y-auto pr-2 pb-4">
          {groupedProducts.map(([category, items]) => (
            <div key={category}>
              <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <Tags size={12} className="text-primary" />
                {category}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {items.map(product => (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    disabled={!isShiftOpen}
                    className="p-4 bg-card border border-border rounded-2xl text-left hover:border-primary hover:shadow-md transition-all active:scale-95"
                  >
                    <p className="font-bold text-foreground mb-1 leading-tight text-sm">
                      {product.name}
                    </p>
                    <p className="text-sm text-primary font-black">
                      {formatMoney(product.price)}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ))}
          
          {groupedProducts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron productos
            </div>
          )}
        </div>

        {/* Carrito */}
        <div className="mt-8 border-t border-border pt-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
              <ShoppingCart size={16} /> Carrito ({cartCount})
            </h4>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-[10px] font-black uppercase text-destructive hover:text-destructive/80"
              >
                Limpiar
              </button>
            )}
          </div>

          <div className="space-y-2 mb-6 max-h-32 overflow-y-auto">
            {cart.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center bg-muted/50 p-2.5 rounded-xl border border-border"
              >
                <div className="flex-1">
                  <p className="font-bold text-foreground text-xs">{item.name}</p>
                  <p className="text-[9px] text-muted-foreground font-bold uppercase">
                    {item.qty} UN x {formatMoney(item.price)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-black text-foreground text-sm">
                    {formatMoney(item.qty * item.price)}
                  </span>
                  <button
                    onClick={() => removeFromCart(idx)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {cart.length > 0 && (
            <div className="flex justify-between items-center mb-4 p-3 bg-primary/10 rounded-xl">
              <span className="font-bold text-foreground">Total:</span>
              <span className="text-xl font-black text-primary">{formatMoney(cartTotal)}</span>
            </div>
          )}

          <Button
            className="w-full"
            disabled={cart.length === 0 || !isShiftOpen || isPending}
            onClick={() => setShowConfirmModal(true)}
          >
            Confirmar Venta
          </Button>
        </div>
      </DashboardCard>

      {/* Modal de confirmación */}
      {showConfirmModal && (
        <ModalPortal>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-card rounded-2xl shadow-2xl border w-full max-w-sm overflow-hidden animate-slide-up">
              <div className="bg-primary p-6 text-primary-foreground">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 rounded-full p-2">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Confirmar Venta</h2>
                    <p className="text-sm text-primary-foreground/80">
                      Revisa los productos antes de confirmar
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-bold text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.qty} x {formatMoney(item.price)}</p>
                      </div>
                      <span className="font-bold">{formatMoney(item.qty * item.price)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <span className="font-black text-emerald-700 dark:text-emerald-300">TOTAL</span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {formatMoney(cartTotal)}
                  </span>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowConfirmModal(false)}
                    disabled={isPending}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={processSale}
                    disabled={isPending}
                  >
                    {isPending ? 'Procesando...' : 'Confirmar'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
