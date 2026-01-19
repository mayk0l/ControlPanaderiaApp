import { Metadata } from "next";
import { getClosedShifts, getCurrentShiftReport } from "@/lib/actions/reports";
import { ShiftReportViewer } from "@/components/reports";
import { EmptyState } from "@/components/ui/empty-state";
import { BarChart3 } from "lucide-react";

export const metadata: Metadata = {
  title: "Reportes | Control Panadería",
  description: "Análisis financiero y reportes del negocio",
};

export default async function ReportsPage() {
  const [shifts, currentReport] = await Promise.all([
    getClosedShifts(30),
    getCurrentShiftReport(),
  ]);

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

      {shifts.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="Sin datos de reportes"
          description="Completa tu primer turno para ver los reportes de ventas y utilidades"
        />
      ) : (
        <ShiftReportViewer 
          shifts={shifts}
          currentShiftReport={currentReport}
        />
      )}
    </div>
  );
}
