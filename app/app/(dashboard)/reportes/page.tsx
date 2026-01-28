import { Metadata } from "next";
import { getClosedShifts, getCurrentShiftReport, getSalesOverview, getDailyShiftsHistory } from "@/lib/actions/reports";
import { getCurrentUserProfile } from "@/lib/actions/config";
import { ShiftReportViewer, SalesOverview, LiveShiftView, DailySalesHistory } from "@/components/reports";
import { EmptyState } from "@/components/ui/empty-state";
import { BarChart3 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = {
  title: "Reportes | Control Panadería",
  description: "Análisis financiero y reportes del negocio",
};

export default async function ReportsPage() {
  const [shifts, currentReport, salesOverview, dailyShifts, userProfile] = await Promise.all([
    getClosedShifts(30),
    getCurrentShiftReport(),
    getSalesOverview(),
    getDailyShiftsHistory(60),
    getCurrentUserProfile(),
  ]);

  const hasData = shifts.length > 0 || dailyShifts.length > 0;
  const userRole = userProfile?.role || 'vendedor';

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

      <Tabs defaultValue="live" className="space-y-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="live">🟢 Turno Activo</TabsTrigger>
          <TabsTrigger value="history">📆 Historial</TabsTrigger>
          <TabsTrigger value="overview">📊 Resumen</TabsTrigger>
          <TabsTrigger value="shifts">📋 Por Turno</TabsTrigger>
        </TabsList>

        {/* Vista del turno activo en tiempo real */}
        <TabsContent value="live" className="space-y-6">
          <LiveShiftView userRole={userRole} />
        </TabsContent>

        {/* Historial diario de turnos y ventas */}
        <TabsContent value="history" className="space-y-6">
          <DailySalesHistory 
            userRole={userRole} 
            initialShifts={dailyShifts} 
          />
        </TabsContent>

        {/* Resumen semanal y mensual */}
        <TabsContent value="overview" className="space-y-6">
          {!hasData ? (
            <EmptyState
              icon={BarChart3}
              title="Sin datos de reportes"
              description="Completa tu primer turno para ver los reportes de ventas y utilidades"
            />
          ) : (
            <SalesOverview 
              initialWeekly={salesOverview.weekly}
              initialMonthly={salesOverview.monthly}
            />
          )}
        </TabsContent>

        {/* Vista detallada por turno */}
        <TabsContent value="shifts">
          {!hasData ? (
            <EmptyState
              icon={BarChart3}
              title="Sin datos de reportes"
              description="Completa tu primer turno para ver los reportes de ventas y utilidades"
            />
          ) : (
            <ShiftReportViewer 
              shifts={shifts}
              currentShiftReport={currentReport}
              userRole={userRole}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
