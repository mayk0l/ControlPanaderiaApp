'use client';

import { useState } from 'react';
import { Trash2, Loader2, AlertTriangle } from 'lucide-react';

interface ResetDataButtonProps {
  isAdmin: boolean;
}

export function ResetDataButton({ isAdmin }: ResetDataButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isAdmin) return null;

  const handleReset = async () => {
    if (confirmText !== 'BORRAR') {
      setMessage({ type: 'error', text: 'Escribe BORRAR para confirmar' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/reset-sales', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al borrar datos');
      }

      setMessage({ type: 'success', text: `Historial borrado: ${data.deleted.sales} ventas, ${data.deleted.expenses} gastos, ${data.deleted.shifts} turnos` });
      setShowConfirm(false);
      setConfirmText('');
      
      // Refrescar la página después de 2 segundos
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Error desconocido' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-destructive/20 p-6">
      <h2 className="text-lg font-bold mb-2 flex items-center gap-2 text-destructive">
        <AlertTriangle className="w-5 h-5" />
        Zona de Peligro
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        Estas acciones son irreversibles. Úsalas con precaución.
      </p>

      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-xl transition-colors font-medium"
        >
          <Trash2 className="w-5 h-5" />
          Borrar Historial de Ventas
        </button>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-destructive/10 rounded-xl border border-destructive/20">
            <p className="text-sm text-destructive font-medium mb-2">
              ⚠️ Esto eliminará PERMANENTEMENTE:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
              <li>Todas las ventas y sus items</li>
              <li>Todos los gastos</li>
              <li>Todos los turnos</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-2">
              <strong>NO</strong> se eliminarán: productos, categorías, usuarios ni configuración.
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Escribe <span className="text-destructive font-bold">BORRAR</span> para confirmar:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
              placeholder="BORRAR"
              className="mt-1 w-full px-4 py-2 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-destructive"
            />
          </div>

          {message && (
            <p className={`text-sm ${message.type === 'success' ? 'text-success' : 'text-destructive'}`}>
              {message.text}
            </p>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowConfirm(false);
                setConfirmText('');
                setMessage(null);
              }}
              className="flex-1 py-2 px-4 bg-muted hover:bg-muted/80 rounded-xl transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleReset}
              disabled={isLoading || confirmText !== 'BORRAR'}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl transition-colors font-medium disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              {isLoading ? 'Borrando...' : 'Confirmar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
