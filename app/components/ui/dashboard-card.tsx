import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface DashboardCardProps {
  children: ReactNode;
  title?: string;
  className?: string;
  action?: ReactNode;
  borderColor?: "default" | "orange" | "blue" | "green" | "red";
}

const borderColors = {
  default: "",
  orange: "border-t-4 border-t-orange-500",
  blue: "border-t-4 border-t-primary",
  green: "border-t-4 border-t-success",
  red: "border-t-4 border-t-destructive",
};

export function DashboardCard({ 
  children, 
  title, 
  className = "", 
  action,
  borderColor = "default"
}: DashboardCardProps) {
  return (
    <div 
      className={cn(
        "bg-card rounded-2xl shadow-sm border p-4 md:p-6 transition-colors",
        borderColors[borderColor],
        className
      )}
    >
      {(title || action) && (
        <div className="flex justify-between items-center mb-4">
          {title && (
            <h3 className="text-lg font-bold text-foreground tracking-tight">
              {title}
            </h3>
          )}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
