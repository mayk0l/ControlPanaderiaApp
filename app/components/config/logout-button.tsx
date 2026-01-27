'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LogOut, Loader2 } from 'lucide-react';

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/auth/login');
      router.refresh();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-2xl border p-6">
      <h2 className="text-lg font-bold mb-4">Sesión</h2>
      
      <button
        onClick={handleLogout}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-xl transition-colors font-medium disabled:opacity-50"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <LogOut className="w-5 h-5" />
        )}
        {isLoading ? 'Cerrando sesión...' : 'Cerrar Sesión'}
      </button>
    </div>
  );
}
