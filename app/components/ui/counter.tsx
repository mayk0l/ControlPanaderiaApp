"use client";

import { Button } from "./button";
import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";

interface CounterProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  size?: "sm" | "default" | "lg";
  className?: string;
  disabled?: boolean;
}

export function Counter({
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
  size = "default",
  className,
  disabled = false,
}: CounterProps) {
  const handleDecrement = () => {
    const newValue = value - step;
    if (newValue >= min) {
      onChange(newValue);
    }
  };

  const handleIncrement = () => {
    const newValue = value + step;
    if (newValue <= max) {
      onChange(newValue);
    }
  };

  const sizeClasses = {
    sm: {
      container: "gap-1",
      button: "icon-sm" as const,
      text: "text-lg min-w-[2rem]",
    },
    default: {
      container: "gap-2",
      button: "icon" as const,
      text: "text-xl min-w-[3rem]",
    },
    lg: {
      container: "gap-3",
      button: "icon-lg" as const,
      text: "text-3xl min-w-[4rem] font-bold",
    },
  };

  const sizes = sizeClasses[size];

  return (
    <div
      className={cn(
        "inline-flex items-center",
        sizes.container,
        className
      )}
    >
      <Button
        type="button"
        variant="outline"
        size={sizes.button}
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        aria-label="Disminuir cantidad"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span
        className={cn(
          "text-center font-semibold tabular-nums",
          sizes.text
        )}
      >
        {value}
      </span>
      <Button
        type="button"
        variant="outline"
        size={sizes.button}
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        aria-label="Aumentar cantidad"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
