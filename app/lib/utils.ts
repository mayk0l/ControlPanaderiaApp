import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatea un número como moneda chilena (CLP)
 */
export function formatMoney(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// =============================================
// UTILIDADES DE FECHA/HORA PARA CHILE
// =============================================

const CHILE_TIMEZONE = 'America/Santiago';

/**
 * Obtiene la fecha actual en Chile en formato YYYY-MM-DD
 */
export function getChileDateString(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: CHILE_TIMEZONE });
}

/**
 * Obtiene un objeto Date ajustado a la hora de Chile
 */
export function getChileDate(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: CHILE_TIMEZONE }));
}

/**
 * Formatea una fecha ISO a formato legible en español de Chile
 */
export function formatChileDate(dateStr: string, options?: Intl.DateTimeFormatOptions): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: CHILE_TIMEZONE,
  };
  return new Date(dateStr).toLocaleDateString('es-CL', options || defaultOptions);
}

/**
 * Formatea una hora ISO a formato HH:MM en Chile
 */
export function formatChileTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: CHILE_TIMEZONE,
  });
}

/**
 * Formatea fecha y hora completa en Chile
 */
export function formatChileDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('es-CL', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: CHILE_TIMEZONE,
  });
}

// This check can be removed, it is just for tutorial purposes
export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
