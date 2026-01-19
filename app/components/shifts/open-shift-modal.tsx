"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { openShift } from "@/lib/actions/shifts";
import { DollarSign, Play } from "lucide-react";

interface OpenShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function OpenShiftModal({ isOpen, onClose, onSuccess }: OpenShiftModalProps) {
  const [initialCash, setInitialCash] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amount = parseFloat(initialCash);
    if (isNaN(amount) || amount < 0) {
      setError("Ingresa un monto válido");
      return;
    }

    startTransition(async () => {
      const result = await openShift(amount);
      if (result.success) {
        setInitialCash("");
        onSuccess();
        onClose();
      } else {
        setError(result.error || "Error al abrir turno");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="bg-primary p-6 text-primary-foreground">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-full p-2">
              <Play className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Abrir Turno</h2>
              <p className="text-sm text-primary-foreground/80">
                Ingresa el monto inicial de caja
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              <DollarSign className="h-5 w-5" />
            </div>
            <FormField
              label="Monto inicial de caja"
              type="number"
              min="0"
              step="100"
              value={initialCash}
              onChange={(e) => setInitialCash(e.target.value)}
              placeholder="0"
              className="[&_input]:pl-12 [&_input]:text-2xl [&_input]:font-bold"
              error={error || undefined}
            />
          </div>

          <div className="text-sm text-muted-foreground bg-muted/50 rounded-xl p-4">
            <p>
              <strong>Consejo:</strong> Cuenta el efectivo físico en caja antes de 
              iniciar. Este monto será usado para calcular las diferencias al cierre.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
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
              {isPending ? "Abriendo..." : "Abrir Turno"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
