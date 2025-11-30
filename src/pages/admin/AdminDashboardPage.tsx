import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { Link } from 'react-router-dom'; 
import { FaSpinner, FaEye, FaCalendarAlt, FaBriefcase, FaUsersCog } from 'react-icons/fa';

import { useAuthStore } from '../../store/authStore';
// Importamos el Modal
import { ReviewApplicationModal } from '../../components/admin/ReviewApplicationModal'; 
import { InfoDialog } from '../../components/ui/InfoDialog';
import { Button } from '../../components/ui/button';

// --- 1. CONFIGURACIÓN API ---
const api = axios.create({ 
  baseURL: 'https://provider-service-mjuj.onrender.com' 
});

// Interfaz para la LISTA (Resumen) - Datos ligeros
interface PostulacionResumenApi {
  id_postulacion: number;
  id_usuario: number;
  nombres: string;
  primer_apellido: string;
  correo: string;
  fecha_postulacion: string;
  estado: string;
  oficio?: string; // Si viene, bien. Si no, no pasa nada.
}

// --- FETCHERS ---

const fetchPendingRequests = async (token: string | null) => {
  if (!token) throw new Error("No autenticado");
  const { data } = await api.get<PostulacionResumenApi[]>('/postulaciones/pendientes', {
    params: { token }, 
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

const processRequest = async ({ 
  id, 
  status, 
  token, 
  motivo 
}: { 
  id: number, 
  status: 'aprobado' | 'rechazado', 
  token: string | null, 
  motivo?: string 
}) => {
  
  if (status === 'aprobado') {
    return api.post(`/postulaciones/${id}/aprobar`, {}, {
      params: { token },
      headers: { Authorization: `Bearer ${token}` }
    });
  } else {
    return api.post(`/postulaciones/${id}/rechazar`, 
      { motivo_rechazo: motivo || "No cumple con los requisitos." }, 
      {
        params: { token },
        headers: { Authorization: `Bearer ${token}` }
      }
    );
  }
};

export default function AdminDashboardPage() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  
  // Estado: guardamos solo el ID de la solicitud seleccionada
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [modalInfo, setModalInfo] = useState({ isOpen: false, title: "", description: "", type: "success" as "success" | "error" });

  const { data: postulaciones, isLoading, error } = useQuery({
    queryKey: ['pendingRequests'],
    queryFn: () => fetchPendingRequests(token),
    enabled: !!token,
    retry: 1,
  });

  const mutation = useMutation({
    mutationFn: processRequest,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pendingRequests'] });
      setSelectedRequestId(null);
      setModalInfo({
        isOpen: true,
        title: variables.status === 'aprobado' ? 'Solicitud Aprobada' : 'Solicitud Rechazada',
        description: `La acción se completó correctamente.`,
        type: 'success'
      });
    },
    onError: (err: unknown) => {
      const error = err as AxiosError;
      console.error("Error API:", error.response?.data || error.message);
      setModalInfo({ 
        isOpen: true, 
        title: 'Error', 
        description: `No se pudo procesar la solicitud (Status: ${error.response?.status || 'Desc'}).`, 
        type: 'error' 
      });
    }
  });

  const handleProcess = (id: number, status: 'aprobado' | 'rechazado', motivo?: string) => {
    mutation.mutate({ id, status, token, motivo });
  };

  return (
    <div className="p-4 sm:p-8 bg-slate-950 min-h-screen">
      <InfoDialog isOpen={modalInfo.isOpen} onClose={() => setModalInfo({ ...modalInfo, isOpen: false })} title={modalInfo.title} description={modalInfo.description} type={modalInfo.type} />
      
      {/* MODAL: Ahora solo recibe el ID. 
         Se encarga de buscar los datos completos cuando el Backend esté listo.
      */}
      {selectedRequestId && (
        <ReviewApplicationModal
          postulacionId={selectedRequestId}
          isOpen={true}
          onClose={() => setSelectedRequestId(null)}
          onApprove={(id) => handleProcess(id, 'aprobado')}
          onReject={(id, motivo) => handleProcess(id, 'rechazado', motivo)}
          isProcessing={mutation.isPending}
        />
      )}

      <div className="mx-auto max-w-6xl">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-white font-poppins [text-shadow:0_0_15px_rgba(234,179,8,0.4)]">
              Panel de Administrador
            </h1>
            <p className="text-slate-400 mt-2">Gestiona las solicitudes de ingreso a la red de prestadores.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-stretch sm:items-center">
             
             {/* 🚀 BOTÓN REDISEÑADO: Estilo Premium */}
             <Link to="/admin/usuarios">
                <Button 
                    className="bg-slate-800 text-white border border-slate-700 hover:bg-slate-700 hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all duration-300 w-full sm:w-auto h-12 px-6 flex items-center justify-center gap-3 group"
                >
                    <div className="bg-slate-900 p-1.5 rounded-md group-hover:bg-cyan-950/50 transition-colors">
                        <FaUsersCog className="text-cyan-400 group-hover:text-cyan-300" size={18} />
                    </div>
                    <span className="font-semibold tracking-wide group-hover:text-cyan-100">Gestión de Usuarios</span>
                </Button>
             </Link>

             <div className="bg-slate-800 px-5 py-2 rounded-lg border border-slate-700 shadow-md flex items-center justify-between sm:justify-center gap-3 h-12">
                <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">Pendientes</span>
                <span className="text-2xl font-bold text-amber-400">{postulaciones?.length || 0}</span>
             </div>
          </div>
        </div>
        
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
              Solicitudes Recientes
            </h2>
          </div>
          
          {isLoading && (
            <div className="flex justify-center items-center h-64">
              <FaSpinner className="animate-spin text-amber-400 text-4xl" />
            </div>
          )}
          
          {error && (
            <div className="text-center p-12 text-red-400 bg-red-900/10 m-4 rounded-lg border border-red-900/20">
              <p className="font-bold mb-2">Error de conexión</p>
              <p className="text-sm opacity-80">No se pudieron cargar las solicitudes.</p>
              <Button variant="outline" className="mt-4 border-red-800 text-red-300 hover:bg-red-900/20" onClick={() => queryClient.invalidateQueries({ queryKey: ['pendingRequests'] })}>Reintentar</Button>
            </div>
          )}

          {!isLoading && !error && postulaciones?.length === 0 && (
            <div className="text-center p-16 text-slate-500">
              <div className="text-4xl mb-4">🎉</div>
              <p className="text-lg">¡Todo al día!</p>
              <p className="text-sm">No hay nuevas solicitudes pendientes de revisión.</p>
            </div>
          )}

          {!isLoading && !error && postulaciones && postulaciones.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 text-sm uppercase tracking-wider border-b border-slate-800">
                    <th className="p-4 font-medium">Candidato</th>
                    <th className="p-4 font-medium">Oficio</th>
                    <th className="p-4 font-medium">Fecha</th>
                    <th className="p-4 font-medium text-center">Estado</th>
                    <th className="p-4 font-medium text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {postulaciones.map((req) => (
                    <tr key={req.id_postulacion} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="p-4">
                        <div className="font-medium text-white">{req.nombres} {req.primer_apellido}</div>
                        <div className="text-xs text-slate-500">{req.correo}</div>
                      </td>
                      <td className="p-4">
                        <span className="flex items-center gap-2 text-slate-300 bg-slate-800 px-3 py-1 rounded-full w-fit text-sm border border-slate-700">
                          <FaBriefcase className="text-cyan-500 text-xs" /> 
                          {req.oficio || 'General'}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400 text-sm">
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="text-slate-600" />
                          {new Date(req.fecha_postulacion).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wide">
                          {req.estado}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => setSelectedRequestId(req.id_postulacion)}
                            className="bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-900/20 font-medium transition-all hover:scale-105"
                          >
                            <FaEye className="mr-2" /> Revisar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}