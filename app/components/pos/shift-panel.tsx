'use client';

import { useState, useTransition } from 'react';
import { DashboardCard } from '@/components/ui/dashboard-card';
import { Button } from '@/components/ui/button';
import { Shift, PanConfig } from '@/lib/types/database';
import { updateBandejas, openShift, closeShift } from '@/lib/actions/shifts';
import { formatMoney } from '@/lib/utils';
import { ModalPortal } from '@/components/ui/modal-portal';
import { 
  Plus, Minus, Lock, Unlock, TrendingUp, DollarSign, 
  CheckCircle2, TrendingDown, Square
} from 'lucide-react';

interface ShiftStats {
  salesCount: number;
  expensesCount: number;
  totalSales: number;
  totalExpenses: number;
  gastosCaja: number;
  gastosPan: number;
  gastosNoPan: number;
  gastosGeneral: number;
  brutoPan: number;
  brutoNoPan: number;
  ventasNoPan: number;
  cashInDrawer: number;
  netoFinal: number;
}

interface ShiftPanelProps {
  shift: Shift | null;
  panConfig: PanConfig;
  stats: ShiftStats | null;
}

export function ShiftPanel({ shift, panConfig, stats }: ShiftPanelProps) {
  const [isPending, startTransition] = useTransition();
  const [modalMode, setModalMode] = useState<'open' | 'close' | null>(null);
  const [openingCashInput, setOpeningCashInput] = useState('');
  const [closingData, setClosingData] = useState({
    countedCash: '',
    panAdjustment: '',
    panReason: '',
  });

  const isShiftOpen = shift?.status === 'OPEN';

  // Calcular valores de pan
  const bandejas = shift?.bandejas_sacadas || 0;
  const kilosEstimados = bandejas * panConfig.kilos_por_bandeja;
  const ventaPanEstimada = kilosEstimados * panConfig.precio_por_kilo;

  const handleUpdateBandejas = (newValue: number) => {
    if (!shift) return;
    startTransition(async () => {
      await updateBandejas(shift.id, newValue);
    });
  };

  const handleOpenShift = () => {
    startTransition(async () => {
      const result = await openShift(parseFloat(openingCashInput) || 0);
      if (result.success) {
        setModalMode(null);
        setOpeningCashInput('');
      }
    });
  };

  const handleCloseShift = () => {
    if (!shift) return;
    
    const countedCash = parseFloat(closingData.countedCash) || 0;
    const panAdjustment = parseInt(closingData.panAdjustment) || 0;
    
    startTransition(async () => {
      const result = await closeShift(shift.id, {
        counted_cash: countedCash,
        expected_cash: stats?.cashInDrawer || 0,
        difference: countedCash - (stats?.cashInDrawer || 0),
        pan_adjustment: panAdjustment,
        pan_reason: closingData.panReason,
        final_bandejas: bandejas + panAdjustment,
        bruto_pan: stats?.brutoPan || 0,
        bruto_no_pan: stats?.brutoNoPan || 0,
        gastos_caja: stats?.gastosCaja || 0,
        neto_final: stats?.netoFinal || 0,
      });
      
      if (result.success) {
        setModalMode(null);
        setClosingData({ countedCash: '', panAdjustment: '', panReason: '' });
      }
    });
  };

  const cashDifference = closingData.countedCash 
    ? parseFloat(closingData.countedCash) - (stats?.cashInDrawer || 0)
    : 0;

  return (
    <div className="space-y-8">
      {/* Contador de Bandejas */}
      <div className={`relative ${!isShiftOpen ? 'opacity-50 pointer-events-none' : ''}`}>
        {!isShiftOpen && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/20 backdrop-blur-[1px] rounded-2xl">
            <div className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xl">
              <Lock size={14} /> CAJA CERRADA
            </div>
          </div>
        )}

        <DashboardCard title="Bandejas de PAN" borderColor="orange">
          <div className="flex items-center justify-center gap-8 py-6">
            <button
              onClick={() => handleUpdateBandejas(Math.max(0, bandejas - 1))}
              disabled={!isShiftOpen || isPending}
              className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80 active:scale-90 transition-transform disabled:opacity-50"
            >
              <Minus size={32} />
            </button>

            <div className="text-center">
              <span className="text-7xl font-black text-foreground">{bandejas}</span>
              <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px] mt-2">
                Bandejas
              </p>
            </div>

            <button
              onClick={() => handleUpdateBandejas(bandejas + 1)}
              disabled={!isShiftOpen || isPending}
              className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/90 active:scale-90 transition-transform shadow-lg disabled:opacity-50"
            >
              <Plus size={32} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6 p-4 bg-muted/50 rounded-2xl border border-border">
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                Kilos Est.
              </p>
              <p className="text-xl font-black text-foreground">
                {kilosEstimados.toFixed(1)} <span className="text-sm font-medium">kg</span>
              </p>
            </div>
            <div className="text-center border-l border-border">
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                Venta Est.
              </p>
              <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                {formatMoney(ventaPanEstimada)}
              </p>
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* Panel de Turno */}
      <DashboardCard 
        title="Panel de Turno" 
        className={!isShiftOpen && shift ? "bg-muted/50" : ""}
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground font-medium">Fondo Inicial</span>
            <span className="font-bold text-foreground">
              {formatMoney(shift?.opening_cash || 0)}
            </span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground font-medium">Ventas NO PAN</span>
            <span className="font-bold text-foreground">
              {formatMoney(stats?.brutoNoPan || 0)}
            </span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground font-medium">Ventas PAN (Est.)</span>
            <span className="font-bold text-foreground">
              {formatMoney(stats?.brutoPan || 0)}
            </span>
          </div>

          <div className="flex justify-between items-center text-sm text-destructive">
            <span className="font-medium">Gastos Caja</span>
            <span className="font-bold">-{formatMoney(stats?.gastosCaja || 0)}</span>
          </div>

          <div className="pt-3 border-t border-border space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest">
                Teórico en Caja
              </span>
              <span className="font-black text-foreground text-lg">
                {formatMoney(stats?.cashInDrawer || (shift?.opening_cash || 0))}
              </span>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 shadow-sm">
              <div className="flex justify-between items-center text-emerald-700 dark:text-emerald-300">
                <div className="flex items-center gap-2">
                  <TrendingUp size={20} className="text-emerald-500" />
                  <span className="font-black text-xs uppercase tracking-widest">Utilidad Neta</span>
                </div>
                <span className="text-2xl font-black tracking-tight">
                  {formatMoney(stats?.netoFinal || 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 space-y-3">
            {!shift ? (
              <Button
                className="w-full"
                variant="default"
                onClick={() => setModalMode('open')}
                disabled={isPending}
              >
                <Unlock className="mr-2 h-4 w-4" />
                Abrir Nuevo Turno
              </Button>
            ) : shift.status === 'OPEN' ? (
              <Button
                className="w-full"
                variant="destructive"
                onClick={() => setModalMode('close')}
                disabled={isPending}
              >
                <Lock className="mr-2 h-4 w-4" />
                Realizar Arqueo y Cierre
              </Button>
            ) : (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 p-4 rounded-xl flex items-center gap-3 text-amber-700 dark:text-amber-400">
                <Lock size={20} />
                <div>
                  <p className="font-bold">Turno Cerrado</p>
                  <p className="text-xs">Para operar, inicie un nuevo turno.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DashboardCard>

      {/* Modal Apertura de Turno */}
      {modalMode === 'open' && (
        <ModalPortal>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-card rounded-2xl shadow-2xl border w-full max-w-sm overflow-hidden animate-slide-up">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <DollarSign size={32} />
                </div>
                <h2 className="text-xl font-black text-foreground">Apertura de Turno</h2>
                <p className="text-muted-foreground text-sm">Ingrese fondo inicial</p>
              </div>

              <div className="px-6 pb-6">
                <div className="mb-6 relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">$</span>
                  <input
                    type="number"
                    className="w-full pl-8 pr-4 py-4 bg-muted/50 border border-border rounded-2xl text-2xl font-black text-foreground outline-none focus:ring-2 focus:ring-primary"
                    value={openingCashInput}
                    onChange={(e) => setOpeningCashInput(e.target.value)}
                    placeholder="0"
                    autoFocus
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Button onClick={handleOpenShift} disabled={isPending}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    {isPending ? 'Abriendo...' : 'Abrir Turno'}
                  </Button>
                  <Button variant="outline" onClick={() => setModalMode(null)} disabled={isPending}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Modal Cierre de Turno */}
      {modalMode === 'close' && (
        <ModalPortal>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-card rounded-2xl shadow-2xl border w-full max-w-lg overflow-hidden animate-slide-up max-h-[90vh] overflow-y-auto">
              <div className="bg-destructive p-6 text-destructive-foreground">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 rounded-full p-2">
                    <Square className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Cierre de Turno</h2>
                    <p className="text-sm text-destructive-foreground/80">
                      Arqueo y cierre de caja
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Resumen */}
                <div className="bg-muted/50 p-4 rounded-xl space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs font-bold text-muted-foreground">Fondo Inicial</span>
                    <span className="text-xs font-bold text-foreground">{formatMoney(shift?.opening_cash || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs font-bold text-muted-foreground">Ventas (Est.)</span>
                    <span className="text-xs font-bold text-emerald-600">+{formatMoney((stats?.brutoNoPan || 0) + (stats?.brutoPan || 0))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs font-bold text-muted-foreground">Gastos Caja</span>
                    <span className="text-xs font-bold text-destructive">-{formatMoney(stats?.gastosCaja || 0)}</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between items-center">
                    <span className="font-black text-foreground uppercase text-xs tracking-widest">Esperado</span>
                    <span className="font-black text-foreground text-lg">{formatMoney(stats?.cashInDrawer || 0)}</span>
                  </div>
                </div>

                {/* Input efectivo contado */}
                <div>
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                    Dinero Contado (Real)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">$</span>
                    <input
                      type="number"
                      className="w-full pl-8 pr-4 py-4 bg-muted/50 border border-border rounded-2xl text-2xl font-black text-foreground outline-none focus:ring-2 focus:ring-primary"
                      value={closingData.countedCash}
                      onChange={(e) => setClosingData({ ...closingData, countedCash: e.target.value })}
                      placeholder="0"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Diferencia */}
                {closingData.countedCash && (
                  <div className={`p-3 rounded-xl flex justify-between items-center ${
                    cashDifference === 0 
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' 
                      : cashDifference > 0
                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                  }`}>
                    <div className="flex items-center gap-2">
                      {cashDifference >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                      <span className="font-bold text-xs uppercase tracking-widest">
                        {cashDifference === 0 ? 'Caja Cuadrada' : cashDifference > 0 ? 'Sobrante' : 'Faltante'}
                      </span>
                    </div>
                    <span className="font-black text-lg">{formatMoney(Math.abs(cashDifference))}</span>
                  </div>
                )}

                {/* Ajuste de pan */}
                <div className="space-y-3 pt-2 border-t border-border">
                  <p className="text-sm font-medium text-muted-foreground">
                    Ajuste de pan vendido (opcional)
                  </p>
                  <div>
                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                      Ajuste (+/-)
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl font-bold text-foreground outline-none focus:ring-2 focus:ring-primary"
                      value={closingData.panAdjustment}
                      onChange={(e) => setClosingData({ ...closingData, panAdjustment: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                      Razón del ajuste
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl font-bold text-foreground outline-none focus:ring-2 focus:ring-primary"
                      value={closingData.panReason}
                      onChange={(e) => setClosingData({ ...closingData, panReason: e.target.value })}
                      placeholder="Ej: Pan devuelto, merma..."
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setModalMode(null)}
                    disabled={isPending}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={handleCloseShift}
                    disabled={isPending || !closingData.countedCash}
                  >
                    {isPending ? 'Cerrando...' : 'Cerrar Turno'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
