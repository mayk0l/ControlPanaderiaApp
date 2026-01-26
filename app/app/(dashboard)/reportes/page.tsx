import { Metadata } from "next";
import { getClosedShifts, getCurrentShiftReport, getSalesOverview } from "@/lib/actions/reports";
import { ShiftReportViewer, SalesOverview } from "@/components/reports";
import { EmptyState } from "@/components/ui/empty-state";
import { BarChart3 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = {
  title: "Reportes | Control Panadería",
  description: "Análisis financiero y reportes del negocio",
};

export default async function ReportsPage() {
  const [shifts, currentReport, salesOverview] = await Promise.all([
    getClosedShifts(30),
    getCurrentShiftReport(),
    getSalesOverview(),
  ]);

  const hasData = shifts.length > 0;

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

      {!hasData ? (
        <EmptyState
          icon={BarChart3}
          title="Sin datos de reportes"
          description="Completa tu primer turno para ver los reportes de ventas y utilidades"
        />
      ) : (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="overview">Resumen General</TabsTrigger>
            <TabsTrigger value="shifts">Por Turno</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <SalesOverview 
              initialWeekly={salesOverview.weekly}
              initialMonthly={salesOverview.monthly}
            />
          </TabsContent>

          <TabsContent value="shifts">
            <ShiftReportViewer 
              shifts={shifts}
              currentShiftReport={currentReport}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
