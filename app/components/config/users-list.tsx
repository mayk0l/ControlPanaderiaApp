'use client';

import { useTransition } from 'react';
import type { Profile } from '@/lib/types/database';
import { updateUserRole } from '@/lib/actions/config';
import { Badge } from '@/components/ui/badge';
import { Users, Shield, ShoppingCart } from 'lucide-react';

interface UsersListProps {
  users: Profile[];
  currentUserId?: string;
}

export function UsersList({ users, currentUserId }: UsersListProps) {
  const [isPending, startTransition] = useTransition();

  const handleRoleChange = (userId: string, newRole: 'admin' | 'vendedor') => {
    startTransition(async () => {
      await updateUserRole(userId, newRole);
    });
  };

  if (users.length === 0) {
    return (
      <div className="bg-card rounded-2xl border p-6">
        <div className="flex items-start gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary/10">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Usuarios del Sistema</h2>
            <p className="text-sm text-muted-foreground">
              No hay usuarios registrados
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border p-6">
      <div className="flex items-start gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <Users className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold">Usuarios del Sistema</h2>
          <p className="text-sm text-muted-foreground">
            {users.length} usuario{users.length !== 1 ? 's' : ''} registrado{users.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                {user.role === 'admin' ? (
                  <Shield className="w-5 h-5 text-primary" />
                ) : (
                  <ShoppingCart className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="font-medium">
                  {user.name}
                  {user.id === currentUserId && (
                    <span className="text-xs text-muted-foreground ml-2">(tú)</span>
                  )}
                </p>
                <p className="text-sm text-muted-foreground">@{user.username}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={user.role}
                onChange={(e) => handleRoleChange(user.id, e.target.value as 'admin' | 'vendedor')}
                disabled={isPending || user.id === currentUserId}
                className="h-8 px-3 rounded-lg border bg-background text-sm disabled:opacity-50"
              >
                <option value="admin">Administrador</option>
                <option value="vendedor">Vendedor</option>
              </select>
              
              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                {user.role}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
