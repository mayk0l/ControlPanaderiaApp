import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Configuración | Control Panadería",
  description: "Ajustes del sistema y gestión de usuarios",
};

export default function ConfigPage() {
  return (
    <div className="animate-fade-in">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
          Configuración
        </h1>
        <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-[0.3em] mt-1">
          Ajustes del sistema
        </p>
      </header>

      {/* TODO: Implementar configuración */}
      <div className="space-y-8">
        <div className="bg-card rounded-2xl border p-6">
          <h2 className="text-lg font-bold mb-4">Apariencia</h2>
          <p className="text-muted-foreground">Próximamente: Toggle modo oscuro</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-card rounded-2xl border p-6">
            <h2 className="text-lg font-bold mb-4">Parámetros PAN</h2>
            <p className="text-muted-foreground">Próximamente: Kilos por bandeja, precio por kilo</p>
          </div>
          
          <div className="bg-card rounded-2xl border p-6">
            <h2 className="text-lg font-bold mb-4">Agregar Usuario</h2>
            <p className="text-muted-foreground">Próximamente: Formulario de usuarios</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-card rounded-2xl border p-6">
            <h2 className="text-lg font-bold mb-4">Usuarios del Sistema</h2>
            <p className="text-muted-foreground">Próximamente: Tabla de usuarios</p>
          </div>
          
          <div className="bg-card rounded-2xl border p-6">
            <h2 className="text-lg font-bold mb-4">Historial de Turnos</h2>
            <p className="text-muted-foreground">Próximamente: Lista de turnos</p>
          </div>
        </div>
      </div>
    </div>
  );
}
