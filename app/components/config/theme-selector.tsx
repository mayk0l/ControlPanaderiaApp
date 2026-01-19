'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Evitar problemas de hidratación
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="bg-card rounded-2xl border p-6">
        <h2 className="text-lg font-bold mb-4">Apariencia</h2>
        <div className="h-12 bg-muted/50 rounded-xl animate-pulse" />
      </div>
    );
  }

  const themes = [
    { value: 'light', label: 'Claro', icon: Sun },
    { value: 'dark', label: 'Oscuro', icon: Moon },
    { value: 'system', label: 'Sistema', icon: Monitor },
  ];

  return (
    <div className="bg-card rounded-2xl border p-6">
      <h2 className="text-lg font-bold mb-4">Apariencia</h2>
      
      <div className="flex gap-2">
        {themes.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={cn(
              "flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
              theme === value 
                ? "border-primary bg-primary/5 text-primary"
                : "border-transparent hover:bg-muted/50"
            )}
          >
            <Icon className="w-5 h-5" />
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
