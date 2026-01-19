import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reportes | Control Panadería",
  description: "Análisis financiero y reportes del negocio",
};

export default function ReportsPage() {
  return (
    <div className="animate-fade-in">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
          Business Intelligence
        </h1>
        <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-[0.3em] mt-1">
          Análisis y reportes financieros
        </p>
      </header>

      {/* TODO: Implementar reportes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-card rounded-2xl border p-6 border-t-4 border-t-orange-500">
          <h2 className="text-lg font-bold mb-4">Línea PAN</h2>
          <p className="text-muted-foreground">Próximamente: Ventas y utilidad de pan</p>
        </div>
        
        <div className="bg-card rounded-2xl border p-6 border-t-4 border-t-primary">
          <h2 className="text-lg font-bold mb-4">Línea PRODUCTOS</h2>
          <p className="text-muted-foreground">Próximamente: Ventas y utilidad de productos</p>
        </div>
        
        <div className="bg-card rounded-2xl border p-6 border-t-4 border-t-success">
          <h2 className="text-lg font-bold mb-4">Consolidado</h2>
          <p className="text-muted-foreground">Próximamente: Utilidad neta total</p>
        </div>
      </div>
    </div>
  );
}
