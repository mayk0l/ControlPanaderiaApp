import { cn, formatMoney } from '@/lib/utils';

interface ReportCardProps {
  title: string;
  children: React.ReactNode;
  accentColor?: 'orange' | 'blue' | 'green' | 'red' | 'slate';
  className?: string;
}

const accentColors = {
  orange: 'border-t-orange-500',
  blue: 'border-t-primary',
  green: 'border-t-success',
  red: 'border-t-destructive',
  slate: 'border-t-slate-500',
};

export function ReportCard({ 
  title, 
  children, 
  accentColor = 'blue',
  className 
}: ReportCardProps) {
  return (
    <div className={cn(
      "bg-card rounded-2xl border p-6 border-t-4",
      accentColors[accentColor],
      className
    )}>
      <h2 className="text-lg font-bold mb-4">{title}</h2>
      {children}
    </div>
  );
}

interface ReportLineItemProps {
  label: string;
  value: number;
  type?: 'income' | 'expense' | 'neutral' | 'result';
  isSubtotal?: boolean;
}

export function ReportLineItem({ 
  label, 
  value, 
  type = 'neutral',
  isSubtotal = false 
}: ReportLineItemProps) {
  const colors = {
    income: 'text-success',
    expense: 'text-destructive',
    neutral: 'text-foreground',
    result: value >= 0 ? 'text-success' : 'text-destructive',
  };

  return (
    <div className={cn(
      "flex justify-between items-center py-2",
      isSubtotal && "border-t border-border pt-3 mt-1 font-bold"
    )}>
      <span className={cn(
        "text-sm",
        isSubtotal ? "font-bold" : "text-muted-foreground"
      )}>
        {label}
      </span>
      <span className={cn(
        "font-mono text-sm",
        colors[type],
        isSubtotal && "text-base"
      )}>
        {type === 'expense' && value > 0 && '-'}
        {formatMoney(Math.abs(value))}
      </span>
    </div>
  );
}

interface ReportSummaryProps {
  ventaPan: number;
  gastosPan: number;
  gananciaPan: number;
  ventaNoPan: number;
  cogsNoPan: number;
  gastosNoPan: number;
  gananciaNoPan: number;
  gastosGeneral: number;
  utilidadNeta: number;
}

export function ReportSummary({
  ventaPan,
  gastosPan,
  gananciaPan,
  ventaNoPan,
  cogsNoPan,
  gastosNoPan,
  gananciaNoPan,
  gastosGeneral,
  utilidadNeta,
}: ReportSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Línea PAN */}
      <ReportCard title="Línea PAN" accentColor="orange">
        <div className="space-y-1">
          <ReportLineItem 
            label="Venta de pan (estimada)" 
            value={ventaPan} 
            type="income" 
          />
          <ReportLineItem 
            label="Gastos de pan" 
            value={gastosPan} 
            type="expense" 
          />
          <ReportLineItem 
            label="Ganancia PAN" 
            value={gananciaPan} 
            type="result"
            isSubtotal 
          />
        </div>
      </ReportCard>

      {/* Línea PRODUCTOS */}
      <ReportCard title="Línea PRODUCTOS" accentColor="blue">
        <div className="space-y-1">
          <ReportLineItem 
            label="Ventas productos" 
            value={ventaNoPan} 
            type="income" 
          />
          <ReportLineItem 
            label="Costo productos (COGS)" 
            value={cogsNoPan} 
            type="expense" 
          />
          <ReportLineItem 
            label="Gastos operativos" 
            value={gastosNoPan} 
            type="expense" 
          />
          <ReportLineItem 
            label="Ganancia PRODUCTOS" 
            value={gananciaNoPan} 
            type="result"
            isSubtotal 
          />
        </div>
      </ReportCard>

      {/* Consolidado */}
      <ReportCard title="Consolidado" accentColor="green" className="md:col-span-2 lg:col-span-1">
        <div className="space-y-1">
          <ReportLineItem 
            label="Ganancia PAN" 
            value={gananciaPan} 
            type="income" 
          />
          <ReportLineItem 
            label="Ganancia PRODUCTOS" 
            value={gananciaNoPan} 
            type="income" 
          />
          <ReportLineItem 
            label="Gastos generales" 
            value={gastosGeneral} 
            type="expense" 
          />
          <ReportLineItem 
            label="UTILIDAD NETA" 
            value={utilidadNeta} 
            type="result"
            isSubtotal 
          />
        </div>
      </ReportCard>
    </div>
  );
}
