'use client';

import { useState, useTransition } from 'react';
import type { Profile } from '@/lib/types/database';
import { updateUserRole } from '@/lib/actions/config';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ModalPortal } from '@/components/ui/modal-portal';
import { Users, Shield, ShoppingCart, Plus, Key, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UsersListProps {
  users: Profile[];
  currentUserId?: string;
  isAdmin?: boolean;
}

type ModalType = 'create' | 'password' | 'delete' | null;

export function UsersList({ users, currentUserId, isAdmin = false }: UsersListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    username: '',
    role: 'vendedor' as 'admin' | 'vendedor',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRoleChange = (userId: string, newRole: 'admin' | 'vendedor') => {
    startTransition(async () => {
      await updateUserRole(userId, newRole);
    });
  };

  const openCreateModal = () => {
    setFormData({ email: '', password: '', name: '', username: '', role: 'vendedor' });
    setError(null);
    setModalType('create');
  };

  const openPasswordModal = (user: Profile) => {
    setSelectedUser(user);
    setFormData({ ...formData, password: '' });
    setError(null);
    setModalType('password');
  };

  const openDeleteModal = (user: Profile) => {
    setSelectedUser(user);
    setError(null);
    setModalType('delete');
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedUser(null);
    setError(null);
  };

  const handleCreateUser = async () => {
    if (!formData.email || !formData.password || !formData.name || !formData.username) {
      setError('Todos los campos son requeridos');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al crear usuario');
        return;
      }

      closeModal();
      router.refresh();
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!formData.password || formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser?.id,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al cambiar contraseña');
        return;
      }

      closeModal();
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/users?userId=${selectedUser?.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al eliminar usuario');
        return;
      }

      closeModal();
      router.refresh();
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
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
        {isAdmin && (
          <Button onClick={openCreateModal} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Crear Usuario
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="bg-card rounded-2xl border p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-3">
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
          {isAdmin && (
            <Button size="sm" onClick={openCreateModal}>
              <Plus className="w-4 h-4 mr-1" />
              Nuevo
            </Button>
          )}
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
                {isAdmin && (
                  <>
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as 'admin' | 'vendedor')}
                      disabled={isPending || user.id === currentUserId}
                      className="h-8 px-3 rounded-lg border bg-background text-sm disabled:opacity-50"
                    >
                      <option value="admin">Admin</option>
                      <option value="vendedor">Vendedor</option>
                    </select>

                    <button
                      onClick={() => openPasswordModal(user)}
                      className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      title="Cambiar contraseña"
                    >
                      <Key className="w-4 h-4" />
                    </button>

                    {user.id !== currentUserId && (
                      <button
                        onClick={() => openDeleteModal(user)}
                        className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        title="Eliminar usuario"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </>
                )}
                
                {!isAdmin && (
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Crear Usuario */}
      {modalType === 'create' && (
        <ModalPortal>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-card rounded-2xl shadow-2xl border w-full max-w-md overflow-hidden animate-slide-up">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-bold text-lg">Crear Usuario</h3>
                <button onClick={closeModal} className="p-1 hover:bg-muted rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border bg-background"
                    placeholder="Nombre completo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Usuario</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border bg-background"
                    placeholder="nombre_usuario"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border bg-background"
                    placeholder="correo@ejemplo.cl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Contraseña</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border bg-background"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Rol</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'vendedor' })}
                    className="w-full px-3 py-2 rounded-lg border bg-background"
                  >
                    <option value="vendedor">Vendedor</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                {error && (
                  <p className="text-sm text-destructive bg-destructive/10 p-2 rounded-lg">{error}</p>
                )}

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1" onClick={closeModal} disabled={loading}>
                    Cancelar
                  </Button>
                  <Button className="flex-1" onClick={handleCreateUser} disabled={loading}>
                    {loading ? 'Creando...' : 'Crear'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Modal Cambiar Contraseña */}
      {modalType === 'password' && selectedUser && (
        <ModalPortal>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-card rounded-2xl shadow-2xl border w-full max-w-sm overflow-hidden animate-slide-up">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-bold text-lg">Cambiar Contraseña</h3>
                <button onClick={closeModal} className="p-1 hover:bg-muted rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Nueva contraseña para <strong>{selectedUser.name}</strong>
                </p>
                <div>
                  <label className="block text-sm font-medium mb-1">Nueva Contraseña</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border bg-background"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>

                {error && (
                  <p className="text-sm text-destructive bg-destructive/10 p-2 rounded-lg">{error}</p>
                )}

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1" onClick={closeModal} disabled={loading}>
                    Cancelar
                  </Button>
                  <Button className="flex-1" onClick={handleChangePassword} disabled={loading}>
                    {loading ? 'Guardando...' : 'Guardar'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Modal Eliminar Usuario */}
      {modalType === 'delete' && selectedUser && (
        <ModalPortal>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-card rounded-2xl shadow-2xl border w-full max-w-sm overflow-hidden animate-slide-up">
              <div className="bg-destructive p-4 text-destructive-foreground">
                <h3 className="font-bold text-lg">Eliminar Usuario</h3>
              </div>

              <div className="p-4 space-y-4">
                <p className="text-sm">
                  ¿Estás seguro de eliminar a <strong>{selectedUser.name}</strong>?
                </p>
                <p className="text-sm text-muted-foreground">
                  Esta acción no se puede deshacer. El usuario perderá acceso inmediatamente.
                </p>

                {error && (
                  <p className="text-sm text-destructive bg-destructive/10 p-2 rounded-lg">{error}</p>
                )}

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1" onClick={closeModal} disabled={loading}>
                    Cancelar
                  </Button>
                  <Button variant="destructive" className="flex-1" onClick={handleDeleteUser} disabled={loading}>
                    {loading ? 'Eliminando...' : 'Eliminar'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </>
  );
}
