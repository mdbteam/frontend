import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { Search, Trash2, Ban, User, MoreVertical, Loader2, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

// Componentes UI
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { InfoDialog } from '../components/ui/InfoDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "../components/ui/dialog";


interface AdminUser {
  id: string; 
  id_usuario: number;
  nombres: string;
  primer_apellido: string;
  foto_url: string | null;
  oficios: string[];
  puntuacion_promedio: number;
  resumen: string;
  trabajos_realizados: number;
  genero: string;
  fecha_nacimiento: string;
  email?: string; 
  rol?: string;
  estado?: 'activo' | 'suspendido'; 
}

// API
const api = axios.create({
  baseURL: 'https://provider-service-mjuj.onrender.com', 
});

const fetchAllUsers = async (token: string | null, search: string) => {
  if (!token) throw new Error("No token");
  

  const { data } = await api.get<AdminUser[]>('/prestadores', { 
    headers: { Authorization: `Bearer ${token}` },
    params: { q: search || undefined }
  });
  return data;
};

//  Simulación de eliminación
const deleteUserMock = async ({ id, token }: { id: string, token: string | null }) => {
  // Simular retardo de red
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log(`[MOCK] Eliminando usuario ID: ${id} con token: ${token ? 'OK' : 'MISSING'}`);
  
 
  /* comentado por falta de endpoint
  if (!token) throw new Error("No token");
  await api.delete(`/prestadores/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  */
  
  return true;
};

export default function AdministratorListPage() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);

  const [modalInfo, setModalInfo] = useState<{ isOpen: boolean; title: string; description: string; type: 'success' | 'error' | 'info' }>({
    isOpen: false, title: '', description: '', type: 'info'
  });

  const { data: users, isLoading, error } = useQuery({
    queryKey: ['adminPrestadores', searchTerm],
    queryFn: () => fetchAllUsers(token, searchTerm),
    enabled: !!token,
  });


  const deleteMutation = useMutation({
    mutationFn: deleteUserMock, //diego qlo aacuerdate de cambiar acá igual 
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPrestadores'] });
      
      setUserToDelete(null);
      setModalInfo({ 
        isOpen: true, 
        title: 'Usuario Eliminado', 
        description: 'El usuario ha sido eliminado correctamente (Simulación).', 
        type: 'success' 
      });
    },
    onError: (err: unknown) => {
        const error = err as AxiosError;
        setUserToDelete(null);
        setModalInfo({ 
            isOpen: true, 
            title: 'Error al Eliminar', 
            description: `No se pudo eliminar: ${error.message}`, 
            type: 'error' 
        });
    }
  });

  
  const promptDelete = (id: string, name: string) => {
    setUserToDelete({ id, name });
  };

  
  const confirmDelete = () => {
    if (userToDelete) {
        deleteMutation.mutate({ id: userToDelete.id, token });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-8 text-slate-200 font-sans">
      
      {/* 1. Modal Informativo (Éxito/Error) */}
      <InfoDialog 
        isOpen={modalInfo.isOpen} 
        onClose={() => setModalInfo({ ...modalInfo, isOpen: false })} 
        title={modalInfo.title} 
        description={modalInfo.description} 
        type={modalInfo.type} 
      />

      {/* 2. Modal de Confirmación de Eliminación (Estilo Oscuro) */}
      <Dialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-md">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-400">
                    <AlertTriangle className="h-5 w-5" /> Confirmar Eliminación
                </DialogTitle>
                <DialogDescription className="text-slate-400 pt-2">
                    ¿Estás seguro que deseas eliminar definitivamente al usuario <span className="font-bold text-white">{userToDelete?.name}</span>?
                    <br /><br />
                    <span className="bg-red-950/50 text-red-300 px-2 py-1 rounded text-xs border border-red-900">
                        Esta acción no se puede deshacer.
                    </span>
                </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
                <Button 
                    variant="ghost" 
                    onClick={() => setUserToDelete(null)}
                    className="text-slate-400 hover:text-white"
                >
                    Cancelar
                </Button>
                <Button 
                    onClick={confirmDelete} 
                    className="bg-red-600 hover:bg-red-500 text-white font-bold"
                    disabled={deleteMutation.isPending}
                >
                    {deleteMutation.isPending ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Eliminando...</>
                    ) : (
                        <>Eliminar Usuario</>
                    )}
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="max-w-7xl mx-auto">
        
        {/* Header de la Página */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white font-poppins">Gestión de Prestadores</h1>
            <p className="text-slate-400 mt-1">Administra y elimina perfiles de la plataforma.</p>
          </div>
          
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
            <Input 
                placeholder="Buscar prestador..." 
                className="pl-10 bg-slate-900 border-slate-800 text-white focus:ring-cyan-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Estado de Carga */}
        {isLoading && (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-cyan-400 text-4xl" />
            </div>
        )}
        
        {/* Estado de Error */}
        {error && (
            <div className="bg-red-900/20 border border-red-800 text-red-300 p-6 rounded-lg text-center">
                Error al cargar la lista.
            </div>
        )}

        {/* Tabla de Usuarios */}
        {!isLoading && !error && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-xs tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Profesional</th>
                    <th className="px-6 py-4">Oficios</th>
                    <th className="px-6 py-4">Puntuación</th>
                    <th className="px-6 py-4">Trabajos</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {users?.map((user) => {
                    if (!user) return null;

                    return (
                    <tr key={user.id} className="hover:bg-slate-800/50 transition-colors group">
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
                            <div className="text-slate-500 text-xs">ID: {user.id}</div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                            {user.oficios.map(oficio => (
                                <span key={oficio} className="px-2 py-0.5 bg-slate-800 rounded text-xs text-cyan-300 border border-slate-700">
                                    {oficio}
                                </span>
                            ))}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                         <span className="text-yellow-400 font-bold">{user.puntuacion_promedio.toFixed(1)} ★</span>
                      </td>

                      <td className="px-6 py-4 text-slate-300">
                        {user.trabajos_realizados}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-white">
                              <MoreVertical size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-slate-200">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            
                            {/* Opción Suspender (Deshabilitada visualmente si quieres, o funcional si existe endpoint) */}
                            <DropdownMenuItem disabled className="text-slate-500 cursor-not-allowed">
                                <Ban size={14} className="mr-2" /> Suspender (Próx.)
                            </DropdownMenuItem>
                            
                            {/* Opción Eliminar (Abre el Modal) */}
                            <DropdownMenuItem 
                                onClick={() => promptDelete(user.id, `${user.nombres} ${user.primer_apellido}`)} 
                                className="text-red-400 hover:text-red-300 hover:bg-red-900/20 cursor-pointer focus:bg-red-900/20 focus:text-red-300"
                            >
                                <Trash2 size={14} className="mr-2" /> Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>
            
            {users?.length === 0 && (
                <div className="p-12 text-center text-slate-500">
                    No se encontraron prestadores.
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}