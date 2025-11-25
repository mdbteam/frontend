import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { Search, Trash2, ShieldCheck, Ban, User } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { InfoDialog } from '../components/ui/InfoDialog';

// --- 1. INTERFACES (Adiós 'any') ---
interface AdminUser {
  id: number;
  nombres: string;
  primer_apellido: string;
  email: string;
  rol: 'cliente' | 'prestador' | 'admin' | 'hibrido';
  estado: 'activo' | 'suspendido' | 'pendiente';
  fecha_registro: string;
  foto_url?: string;
}

// --- 2. API CLIENT (Auth Service para gestión de usuarios) ---
const apiAuth = axios.create({
  baseURL: 'https://auth-service-1-8301.onrender.com', // Ajusta si tus usuarios están en otro servicio
});

// --- 3. FETCHERS TIPADOS ---
const fetchAllUsers = async (token: string | null, search: string) => {
  if (!token) throw new Error("No token");
  
  // Pasamos el genérico <AdminUser[]> para que TS sepa qué devuelve
  const { data } = await apiAuth.get<AdminUser[]>('/users', { 
    headers: { Authorization: `Bearer ${token}` },
    params: { q: search || undefined } // Asumiendo que tu backend soporta filtro 'q'
  });
  return data;
};

const updateUserStatus = async ({ id, status, token }: { id: number, status: string, token: string | null }) => {
  if (!token) throw new Error("No token");
  return apiAuth.patch(`/users/${id}/status`, { estado: status }, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export default function AdministratorListPage() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [modalInfo, setModalInfo] = useState<{ isOpen: boolean; title: string; description: string; type: 'success' | 'error' | 'info' }>({
    isOpen: false, title: '', description: '', type: 'info'
  });

  // Query tipada explícitamente: <AdminUser[], Error>
  const { data: users, isLoading, error } = useQuery<AdminUser[], Error>({
    queryKey: ['adminUsers', searchTerm],
    queryFn: () => fetchAllUsers(token, searchTerm),
    enabled: !!token,
  });

  const statusMutation = useMutation({
    mutationFn: updateUserStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      setModalInfo({ isOpen: true, title: 'Éxito', description: 'Estado de usuario actualizado.', type: 'success' });
    },
    onError: (err: unknown) => { // Usamos 'unknown' en lugar de 'any'
        let msg = "No se pudo actualizar.";
        if (err instanceof AxiosError) msg = err.response?.data?.detail || msg;
        setModalInfo({ isOpen: true, title: 'Error', description: msg, type: 'error' });
    }
  });

  const handleStatusChange = (id: number, newStatus: 'activo' | 'suspendido') => {
    statusMutation.mutate({ id, status: newStatus, token });
  };

  const getRoleBadgeColor = (rol: string) => {
    switch (rol.toLowerCase()) {
        case 'admin': return 'bg-purple-900/50 text-purple-300 border-purple-700';
        case 'prestador': return 'bg-amber-900/50 text-amber-300 border-amber-700';
        default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-8 text-slate-200 font-sans">
      <InfoDialog isOpen={modalInfo.isOpen} onClose={() => setModalInfo({ ...modalInfo, isOpen: false })} title={modalInfo.title} description={modalInfo.description} type={modalInfo.type} />

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Gestión de Usuarios</h1>
            <p className="text-slate-400 mt-1">Administra cuentas, roles y permisos.</p>
          </div>
          
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
            <Input 
                placeholder="Buscar por nombre o email..." 
                className="pl-10 bg-slate-900 border-slate-800 text-white focus:ring-cyan-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {isLoading && <div className="text-center py-20 text-cyan-400">Cargando usuarios...</div>}
        
        {/* Manejo de Error Tipado */}
        {error && (
            <div className="bg-red-900/20 border border-red-800 text-red-300 p-6 rounded-lg text-center">
                Error al cargar lista: {error.message}
            </div>
        )}

        {!isLoading && !error && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950 text-slate-400 uppercase font-bold">
                  <tr>
                    <th className="px-6 py-4">Usuario</th>
                    <th className="px-6 py-4">Rol</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4">Registro</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {users?.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
                            {user.foto_url ? (
                                <img src={user.foto_url} alt={user.nombres} className="h-full w-full object-cover" />
                            ) : (
                                <User className="text-slate-500" size={20} />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-white">{user.nombres} {user.primer_apellido}</div>
                            <div className="text-slate-500 text-xs">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold border ${getRoleBadgeColor(user.rol)} uppercase`}>
                            {user.rol}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`flex items-center gap-2 ${user.estado === 'activo' ? 'text-green-400' : 'text-red-400'}`}>
                            <div className={`w-2 h-2 rounded-full ${user.estado === 'activo' ? 'bg-green-500' : 'bg-red-500'}`} />
                            {user.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {new Date(user.fecha_registro).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                            {user.estado === 'activo' ? (
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handleStatusChange(user.id, 'suspendido')}
                                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                    title="Suspender Usuario"
                                >
                                    <Ban size={18} />
                                </Button>
                            ) : (
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handleStatusChange(user.id, 'activo')}
                                    className="text-green-400 hover:text-green-300 hover:bg-green-900/20"
                                    title="Activar Usuario"
                                >
                                    <ShieldCheck size={18} />
                                </Button>
                            )}
                            <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-slate-500 hover:text-white"
                                title="Eliminar (Próximamente)"
                            >
                                <Trash2 size={18} />
                            </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {users?.length === 0 && (
                <div className="p-8 text-center text-slate-500">
                    No se encontraron usuarios que coincidan con la búsqueda.
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}