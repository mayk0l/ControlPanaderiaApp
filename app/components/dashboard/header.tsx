"use client";

import { ShiftStatus } from "@/lib/types";

interface HeaderProps {
  shiftStatus?: ShiftStatus;
  shiftUserName?: string;
}

export function Header({ shiftStatus, shiftUserName }: HeaderProps) {
  return (
    <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
      <div className="text-center md:text-left">
        <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-[0.3em] mt-1">
          {new Date().toLocaleDateString('es-CL', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
          })}
        </p>
      </div>
      
      <div className="flex items-center gap-4">
        {shiftStatus && (
          <div 
            className={`
              flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-[10px] tracking-widest shadow-sm border
              ${shiftStatus === 'OPEN' 
                ? 'bg-success/10 text-success border-success/20' 
                : 'bg-destructive/10 text-destructive border-destructive/20'
              }
            `}
          >
            <div 
              className={`
                w-2 h-2 rounded-full
                ${shiftStatus === 'OPEN' 
                  ? 'bg-success animate-pulse-soft' 
                  : 'bg-destructive'
                }
              `}
            />
            {shiftStatus === 'OPEN' 
              ? `TURNO: ${shiftUserName?.toUpperCase() || 'ABIERTO'}` 
              : 'TURNO CERRADO'
            }
          </div>
        )}
      </div>
    </header>
  );
}
