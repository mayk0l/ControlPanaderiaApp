import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Productos | Control Panadería",
  description: "Gestión del catálogo de productos",
};

export default function ProductsPage() {
  return (
    <div className="animate-fade-in">
      <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
            Catálogo Maestro
          </h1>
          <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-[0.3em] mt-1">
            Gestión de productos y categorías
          </p>
        </div>
        
        {/* TODO: Botones de acción */}
        <div className="flex gap-3">
          <button className="px-4 py-2 text-sm font-bold border rounded-xl hover:bg-secondary">
            Categorías
          </button>
          <button className="px-4 py-2 text-sm font-bold bg-primary text-primary-foreground rounded-xl">
            Nuevo Producto
          </button>
        </div>
      </header>

      {/* TODO: Implementar productos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-card rounded-2xl border p-6">
          <h2 className="text-lg font-bold mb-4">Lista de Productos</h2>
          <p className="text-muted-foreground">Próximamente: Tabla de productos con márgenes</p>
        </div>
        
        <div className="bg-card rounded-2xl border p-6">
          <h2 className="text-lg font-bold mb-4">Categorías</h2>
          <p className="text-muted-foreground">Próximamente: Lista de categorías</p>
        </div>
      </div>
    </div>
  );
}
