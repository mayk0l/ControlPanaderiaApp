import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terminal de Venta | Control Panadería",
  description: "Punto de venta para registrar ventas y producción de pan",
};

export default function POSPage() {
  return (
    <div className="animate-fade-in">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
          Terminal de Venta
        </h1>
        <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-[0.3em] mt-1">
          {new Date().toLocaleDateString('es-CL', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
          })}
        </p>
      </header>

      {/* TODO: Implementar POS completo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card rounded-2xl border p-6">
          <h2 className="text-lg font-bold mb-4">Ventas NO PAN</h2>
          <p className="text-muted-foreground">Próximamente: Catálogo de productos y carrito</p>
        </div>
        
        <div className="space-y-8">
          <div className="bg-card rounded-2xl border p-6">
            <h2 className="text-lg font-bold mb-4">Bandejas de PAN</h2>
            <p className="text-muted-foreground">Próximamente: Contador de bandejas</p>
          </div>
          
          <div className="bg-card rounded-2xl border p-6">
            <h2 className="text-lg font-bold mb-4">Panel de Turno</h2>
            <p className="text-muted-foreground">Próximamente: Resumen y apertura/cierre</p>
          </div>
        </div>
      </div>
    </div>
  );
}
