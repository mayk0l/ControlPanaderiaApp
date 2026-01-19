'use server';

import { createClient } from '@/lib/supabase/server';
import type { PanConfig } from '@/lib/types/database';
import { revalidatePath } from 'next/cache';

const DEFAULT_PAN_CONFIG: PanConfig = {
  kilos_por_bandeja: 20,
  precio_por_kilo: 1100,
};

/**
 * Obtener la configuración de pan
 */
export async function getPanConfig(): Promise<PanConfig> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('config')
    .select('value')
    .eq('key', 'pan_config')
    .single();

  if (error || !data) {
    console.log('No pan config found, using defaults');
    return DEFAULT_PAN_CONFIG;
  }

  return data.value as PanConfig;
}

/**
 * Actualizar la configuración de pan
 */
export async function updatePanConfig(config: PanConfig): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // Intentar actualizar primero
  const { error: updateError } = await supabase
    .from('config')
    .update({ value: config })
    .eq('key', 'pan_config');

  // Si no existe, insertar
  if (updateError) {
    const { error: insertError } = await supabase
      .from('config')
      .insert({
        key: 'pan_config',
        value: config,
      });

    if (insertError) {
      console.error('Error saving pan config:', insertError);
      return { success: false, error: insertError.message };
    }
  }

  revalidatePath('/config');
  revalidatePath('/pos');
  
  return { success: true };
}

/**
 * Obtener todos los perfiles de usuario
 */
export async function getProfiles() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching profiles:', error);
    return [];
  }

  return data || [];
}

/**
 * Actualizar rol de un usuario
 */
export async function updateUserRole(
  userId: string, 
  role: 'admin' | 'vendedor'
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId);

  if (error) {
    console.error('Error updating user role:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/config');
  
  return { success: true };
}
