import { LoginForm } from "@/components/login-form";
import Image from "next/image";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-orange-500/5 p-4">
      {/* Logo y branding */}
      <div className="mb-8 text-center animate-fade-in">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white shadow-xl shadow-primary/10 mb-4 overflow-hidden border-4 border-amber-500/20">
          <Image
            src="/logo-panaderiaapp.jpeg"
            alt="Control Panadería"
            width={80}
            height={80}
            className="object-contain"
            priority
          />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-foreground">
          Control Panadería
        </h1>
        <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest mt-1">
          Sistema de Gestión
        </p>
      </div>

      {/* Formulario */}
      <div className="w-full max-w-sm animate-slide-up">
        <LoginForm />
      </div>

      {/* Footer */}
      <p className="mt-8 text-xs text-muted-foreground">
        © 2026 Control Panadería. Todos los derechos reservados.
      </p>
    </div>
  );
}
