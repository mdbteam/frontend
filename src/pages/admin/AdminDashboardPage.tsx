import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { FaSpinner } from 'react-icons/fa';

import type { Postulacion } from '../../types/adminTypes'; // <-- Usa el tipo correcto
import RequestsTable from '../../components/admin/RequestsTable'; // <-- Solo importa la tabla

// --- Funciones de API ---
const fetchPendientes = async (token: string | null) => {
  if (!token) throw new Error('No autenticado');
  const { data } = await axios.get<Postulacion[]>('/api/postulaciones/pendientes', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

const AdminDashboardPage: React.FC = () => {
  const { token } = useAuthStore();

  const { data: requests, isLoading, error } = useQuery({
    queryKey: ['postulacionesPendientes'],
    queryFn: () => fetchPendientes(token),
  });

  return (
    <div className="p-4 sm:p-8 min-h-screen">
      <header className="mb-8">
        <h1 
          className="text-4xl font-bold text-white font-poppins"
          style={{ textShadow: '0 0 15px rgba(234, 179, 8, 0.4)' }}
        >
          Dashboard de Aprobación
        </h1>
        <p className="text-slate-400 mt-2">Revisa, aprueba o rechaza las solicitudes de los agentes.</p>
      </header>

      <main>
        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <FaSpinner className="animate-spin text-cyan-400 text-3xl" />
          </div>
        )}
        {error && (
          <div className="p-8 text-center text-red-400 bg-slate-800/50 rounded-lg">
            <p>Error al cargar las postulaciones. El endpoint del backend podría estar fallando.</p>
            <p className="text-sm text-red-500">{(error as Error).message}</p>
          </div>
        )}

        {/* Renderiza la tabla. Toda la lógica de acciones vivirá DENTRO de ella. */}
        {requests && (
          <RequestsTable requests={requests} />
        )}
      </main>
    </div>
  );
};

export default AdminDashboardPage;