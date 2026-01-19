"use client";

import { Shift } from "@/lib/types/database";
import { ShiftStatus } from "@/components/shifts";

interface HeaderProps {
  currentShift: Shift | null;
}

export function Header({ currentShift }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b px-4 md:px-8 py-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 max-w-7xl mx-auto">
        <div className="text-center md:text-left">
          <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-[0.3em]">
            {new Date().toLocaleDateString('es-CL', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}
          </p>
        </div>
        
        <ShiftStatus initialShift={currentShift} />
      </div>
    </header>
  );
}