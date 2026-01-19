'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { updatePanConfig } from '@/lib/actions/config';
import type { PanConfig } from '@/lib/types/database';
import { formatMoney } from '@/lib/utils';
import { Save, Calculator } from 'lucide-react';

interface PanConfigFormProps {
  config: PanConfig;
}

export function PanConfigForm({ config }: PanConfigFormProps) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    kilos_por_bandeja: config.kilos_por_bandeja.toString(),
    precio_por_kilo: config.precio_por_kilo.toString(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);

    const kilos = parseFloat(formData.kilos_por_bandeja);
    const precio = parseFloat(formData.precio_por_kilo);

    if (isNaN(kilos) || kilos <= 0) {
      setError('Los kilos por bandeja deben ser un número positivo');
      return;
    }

    if (isNaN(precio) || precio <= 0) {
      setError('El precio por kilo debe ser un número positivo');
      return;
    }

    startTransition(async () => {
      const result = await updatePanConfig({
        kilos_por_bandeja: kilos,
        precio_por_kilo: precio,
      });

      if (!result.success) {
        setError(result.error || 'Error al guardar configuración');
        return;
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  };

  // Cálculo de ejemplo
  const kilos = parseFloat(formData.kilos_por_bandeja) || 0;
  const precio = parseFloat(formData.precio_por_kilo) || 0;
  const ventaPorBandeja = kilos * precio;

  return (
    <div className="bg-card rounded-2xl border p-6">
      <div className="flex items-start gap-3 mb-6">
        <div className="p-2 rounded-lg bg-orange-500/10">
          <Calculator className="w-5 h-5 text-orange-500" />
        </div>
        <div>
          <h2 className="text-lg font-bold">Parámetros de PAN</h2>
          <p className="text-sm text-muted-foreground">
            Configura cómo se calcula el valor del pan por bandeja
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
            {error}
          </div>
        )}

        {saved && (
          <div className="p-3 bg-success/10 text-success text-sm rounded-lg">
            ✓ Configuración guardada correctamente
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField 
            label="Kilos por bandeja" 
            required
            type="number"
            min="0"
            step="0.1"
            value={formData.kilos_por_bandeja}
            onChange={(e) => setFormData({ ...formData, kilos_por_bandeja: e.target.value })}
            placeholder="20"
          />

          <FormField 
            label="Precio por kilo ($)" 
            required
            type="number"
            min="0"
            value={formData.precio_por_kilo}
            onChange={(e) => setFormData({ ...formData, precio_por_kilo: e.target.value })}
            placeholder="1100"
          />
        </div>

        {/* Preview del cálculo */}
        <div className="p-4 bg-muted/50 rounded-xl space-y-2">
          <p className="text-sm text-muted-foreground font-medium">Vista previa del cálculo:</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{formatMoney(ventaPorBandeja)}</span>
            <span className="text-muted-foreground">por bandeja</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {kilos} kg × {formatMoney(precio)}/kg = {formatMoney(ventaPorBandeja)}
          </p>
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full"
        >
          <Save className="w-4 h-4 mr-2" />
          {isPending ? 'Guardando...' : 'Guardar configuración'}
        </Button>
      </form>
    </div>
  );
}
