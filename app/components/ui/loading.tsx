import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "default" | "lg";
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  default: "h-6 w-6",
  lg: "h-10 w-10",
};

export function LoadingSpinner({
  size = "default",
  className,
  text,
}: LoadingSpinnerProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}

interface LoadingOverlayProps {
  text?: string;
}

export function LoadingOverlay({ text = "Cargando..." }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}

interface LoadingCardProps {
  text?: string;
  className?: string;
}

export function LoadingCard({ text = "Cargando...", className }: LoadingCardProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center py-12 rounded-2xl border bg-card",
        className
      )}
    >
      <LoadingSpinner text={text} />
    </div>
  );
}
