import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Control de Gastos | Control Panadería",
  description: "Registro y gestión de gastos del turno",
};

export default function ExpensesPage() {
  return (
    <div className="animate-fade-in">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
          Control de Gastos
        </h1>
        <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-[0.3em] mt-1">
          Gestión de egresos del turno
        </p>
      </header>

      {/* TODO: Implementar gastos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-card rounded-2xl border p-6">
          <h2 className="text-lg font-bold mb-4">Historial de Gastos</h2>
          <p className="text-muted-foreground">Próximamente: Tabla de gastos del turno</p>
        </div>
        
        <div className="bg-card rounded-2xl border p-6">
          <h2 className="text-lg font-bold mb-4">Registrar Gasto</h2>
          <p className="text-muted-foreground">Próximamente: Formulario de gastos</p>
        </div>
      </div>
    </div>
  );
}
