"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OpenShiftModal, CloseShiftModal } from "@/components/shifts";
import { Shift } from "@/lib/types/database";
import { Clock, Play, Square } from "lucide-react";
import { useRouter } from "next/navigation";

interface ShiftStatusProps {
  initialShift: Shift | null;
}

export function ShiftStatus({ initialShift }: ShiftStatusProps) {
  const router = useRouter();
  const [shift, setShift] = useState<Shift | null>(initialShift);
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);

  const handleShiftChange = () => {
    router.refresh();
    // Re-fetch shift status
    if (!shift) {
      setShowOpenModal(false);
    } else {
      setShowCloseModal(false);
      setShift(null);
    }
  };

  const formatDuration = (startDate: string) => {
    const start = new Date(startDate);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (!shift) {
    return (
      <>
        <Button 
          onClick={() => setShowOpenModal(true)}
          size="sm"
          className="gap-2"
        >
          <Play className="h-4 w-4" />
          <span className="hidden sm:inline">Abrir Turno</span>
        </Button>

        <OpenShiftModal
          isOpen={showOpenModal}
          onClose={() => setShowOpenModal(false)}
          onSuccess={() => {
            handleShiftChange();
            window.location.reload(); // Force reload to get new shift
          }}
        />
      </>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Badge variant="success" className="gap-1.5 py-1 px-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
          </span>
          <span className="hidden sm:inline">Turno activo</span>
        </Badge>
        
        <div className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>{formatDuration(shift.opened_at)}</span>
        </div>

        <Button 
          onClick={() => setShowCloseModal(true)}
          size="sm"
          variant="outline-destructive"
          className="gap-2"
        >
          <Square className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Cerrar</span>
        </Button>
      </div>

      <CloseShiftModal
        isOpen={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        onSuccess={handleShiftChange}
        shift={shift}
      />
    </>
  );
}
