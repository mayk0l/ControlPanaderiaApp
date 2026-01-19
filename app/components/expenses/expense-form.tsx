"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { createExpense } from "@/lib/actions/expenses";
import { ExpenseOrigin } from "@/lib/types/database";
import { useRouter } from "next/navigation";
import { Plus, DollarSign } from "lucide-react";

interface ExpenseFormProps {
  shiftId: string;
}

const EXPENSE_ORIGINS: { value: ExpenseOrigin; label: string; emoji: string; description: string }[] = [
  { 
    value: "GENERAL", 
    label: "Caja", 
    emoji: "💵",
    description: "Sale de la caja del día"
  },
  { 
    value: "PAN", 
    label: "Producción Pan", 
    emoji: "🍞",
    description: "Ingredientes, insumos panadería"
  },
  { 
    value: "NO_PAN", 
    label: "Productos NO PAN", 
    emoji: "📦",
    description: "Compra de mercadería"
  },
];

export function ExpenseForm({ shiftId }: ExpenseFormProps) {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [origin, setOrigin] = useState<ExpenseOrigin>("GENERAL");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!description.trim()) {
      setError("Ingresa una descripción");
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Ingresa un monto válido");
      return;
    }

    startTransition(async () => {
      const result = await createExpense(shiftId, description.trim(), amountNum, origin);
      
      if (result.success) {
        setDescription("");
        setAmount("");
        setOrigin("GENERAL");
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        router.refresh();
      } else {
        setError(result.error || "Error al registrar gasto");
      }
    });
  };

  return (
    <DashboardCard title="➕ Registrar Gasto" borderColor="red">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Selector de origen */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Tipo de gasto
          </label>
          <div className="grid grid-cols-3 gap-2">
            {EXPENSE_ORIGINS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setOrigin(opt.value)}
                className={`p-3 rounded-xl border-2 text-center transition-all ${
                  origin === opt.value
                    ? "border-primary bg-primary/5"
                    : "border-input hover:border-primary/50"
                }`}
              >
                <span className="text-2xl block mb-1">{opt.emoji}</span>
                <span className="text-xs font-medium">{opt.label}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {EXPENSE_ORIGINS.find((o) => o.value === origin)?.description}
          </p>
        </div>

        <FormField
          label="Descripción"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ej: Compra de harina, bebidas..."
          error={error || undefined}
        />

        <div className="relative">
          <div className="absolute left-4 top-[2.25rem] text-muted-foreground">
            <DollarSign className="h-5 w-5" />
          </div>
          <FormField
            label="Monto"
            type="number"
            min="0"
            step="100"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="[&_input]:pl-12"
          />
        </div>

        {success && (
          <div className="p-3 rounded-xl bg-success/10 text-success text-sm font-medium border border-success/20">
            ✓ Gasto registrado correctamente
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isPending}>
          <Plus className="h-4 w-4 mr-2" />
          {isPending ? "Registrando..." : "Registrar Gasto"}
        </Button>
      </form>
    </DashboardCard>
  );
}
