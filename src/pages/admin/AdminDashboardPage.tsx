import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import { RequestsTable } from '../../components/admin/RequestsTable'; 
import { FaSpinner } from 'react-icons/fa';

interface PostulacionResumen {
  id_postulacion: number;
  id_usuario: number;
  nombres: string;
  primer_apellido: string;
  correo: string;
  fecha_postulacion: string;
  estado: string;
}

const fetchPendingRequests = async (token: string | null) => {
  if (!token) throw new Error("No autenticado");
  const { data } = await axios.get<PostulacionResumen[]>('/api/postulaciones/pendientes', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

export default function AdminDashboardPage() {
  const { token } = useAuthStore();

  const { data: postulaciones, isLoading, error } = useQuery({
    queryKey: ['pendingRequests'],
    queryFn: () => fetchPendingRequests(token),
    enabled: !!token,
  });

  return (
    <div className="p-4 sm:p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold text-white font-poppins mb-8 text-center [text-shadow:0_0_15px_rgba(234,179,8,0.4)]">
          Panel de Administrador
        </h1>
        
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-white mb-6">Solicitudes Pendientes</h2>
          
          {isLoading && (
            <div className="flex justify-center items-center h-40">
              <FaSpinner className="animate-spin text-amber-400 text-3xl" />
            </div>
          )}
          
          {error && (
            <div className="text-center p-8 text-red-400">
              Error al cargar las postulaciones. (El endpoint `/api/postulaciones/pendientes` puede estar fallando).
            </div>
          )}

          {!isLoading && !error && (
            <RequestsTable 
              postulaciones={postulaciones || []} 
              isLoading={isLoading} 
            />
          )}
        </div>

      </div>
    </div>
  );
}