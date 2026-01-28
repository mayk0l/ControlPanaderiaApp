'use client';

import { useState, useEffect, useTransition } from 'react';
import type { Shift, ReportData } from '@/lib/types/database';
import { calculateShiftReport } from '@/lib/actions/reports';
import { formatChileDate } from '@/lib/utils';
import { ShiftSelector } from './shift-selector';
import { ReportSummary } from './report-card';
import { ShiftDetailView } from './shift-detail-view';
import { LoadingSpinner } from '@/components/ui/loading';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ShiftReportViewerProps {
  shifts: Shift[];
  currentShiftReport?: ReportData | null;
}

export function ShiftReportViewer({ shifts }: ShiftReportViewerProps) {
  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(
    shifts.length > 0 ? shifts[0].id : null
  );
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [showDetails, setShowDetails] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (selectedShiftId) {
      startTransition(async () => {
        const data = await calculateShiftReport(selectedShiftId);
        setReportData(data);
      });
    }
  }, [selectedShiftId]);

  const handleSelectShift = (shiftId: string) => {
    setSelectedShiftId(shiftId);
  };

  const selectedShift = shifts.find(s => s.id === selectedShiftId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar con selector de turnos */}
      <div className="lg:col-span-1">
        <ShiftSelector 
          shifts={shifts}
          selectedId={selectedShiftId}
          onSelect={handleSelectShift}
        />
      </div>

      {/* Contenido principal */}
      <div className="lg:col-span-3">
        {isPending ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner />
            <span className="ml-2 text-muted-foreground">Cargando reporte...</span>
          </div>
        ) : reportData ? (
          <div className="space-y-6">
            {/* Header del reporte */}
            {selectedShift && (
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">
                    Reporte del {formatChileDate(selectedShift.date + 'T12:00:00', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      timeZone: 'America/Santiago'
                    })}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Turno abierto por {selectedShift.opened_by_name || 'Usuario'} • 
                    {selectedShift.bandejas_sacadas} bandejas producidas
                  </p>
                </div>
              </div>
            )}

            {/* Resumen del reporte */}
            <ReportSummary
              ventaPan={reportData.venta_pan}
              gastosPan={reportData.gastos_pan}
              gananciaPan={reportData.ganancia_pan}
              ventaNoPan={reportData.venta_no_pan}
              cogsNoPan={reportData.cogs_no_pan}
              gastosNoPan={reportData.gastos_no_pan}
              gananciaNoPan={reportData.ganancia_no_pan}
              gastosGeneral={reportData.gastos_general}
              utilidadNeta={reportData.utilidad_neta}
            />

            {/* Botón para expandir/colapsar detalles */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-muted/50 hover:bg-muted rounded-xl transition-colors text-sm font-medium"
            >
              {showDetails ? (
                <>
                  <ChevronUp size={18} />
                  Ocultar Detalles
                </>
              ) : (
                <>
                  <ChevronDown size={18} />
                  Ver Detalles del Turno
                </>
              )}
            </button>

            {/* Detalles del turno */}
            {showDetails && selectedShiftId && (
              <ShiftDetailView shiftId={selectedShiftId} />
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            Selecciona un turno para ver su reporte
          </div>
        )}
      </div>
    </div>
  );
}
