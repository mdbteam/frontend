import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useAuthStore } from '../../store/authStore';
import { FaSpinner, FaEye, FaCalendarAlt, FaBriefcase } from 'react-icons/fa';

// Importamos el Modal y su tipo
import { ReviewApplicationModal, type PostulacionDetalle } from '../../components/admin/ReviewApplicationModal'; 
import { InfoDialog } from '../../components/ui/InfoDialog';
import { Button } from '../../components/ui/button';

// --- 1. CONFIGURACIÓN API ---
// URL Base directa al servicio (sin /api extra, según tu documentación)
const api = axios.create({ 
  baseURL: 'https://provider-service-mjuj.onrender.com' 
});

// Interfaz que refleja lo que llega en el array de /pendientes
interface PostulacionResumenApi {
  id_postulacion: number;
  id_usuario: number;
  nombres: string;
  primer_apellido: string;
  correo: string;
  fecha_postulacion: string;
  estado: string;
  // Campos opcionales que podrían venir (o no) en el resumen
  oficio?: string;
  bio?: string;
  direccion?: string;
  telefono?: string;
  archivos_portafolio?: string[];
  archivos_certificados?: string[];
}

// --- 2. FETCHERS Y ACCIONES ---

const fetchPendingRequests = async (token: string | null) => {
  if (!token) throw new Error("No autenticado");
  
  // GET /postulaciones/pendientes
  const { data } = await api.get<PostulacionResumenApi[]>('/postulaciones/pendientes', {
    params: { token }, 
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

// Función unificada para procesar (Aprobar o Rechazar con motivo)
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
    // POST /postulaciones/{id}/aprobar
    return api.post(`/postulaciones/${id}/aprobar`, {}, {
      params: { token },
      headers: { Authorization: `Bearer ${token}` }
    });
  } else {
    // POST /postulaciones/{id}/rechazar
    // Body: { motivo_rechazo: "..." }
    return api.post(`/postulaciones/${id}/rechazar`, 
      { motivo_rechazo: motivo || "No cumple con los requisitos." }, 
      {
        params: { token },
        headers: { Authorization: `Bearer ${token}` }
      }
    );
  }
};

// --- 3. COMPONENTE PRINCIPAL ---
export default function AdminDashboardPage() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  
  // Estado para el modal de revisión
  const [selectedRequest, setSelectedRequest] = useState<PostulacionDetalle | null>(null);
  
  // Estado para el feedback (éxito/error)
  const [modalInfo, setModalInfo] = useState({ isOpen: false, title: "", description: "", type: "success" as "success" | "error" });

  // Query para traer datos
  const { data: postulaciones, isLoading, error } = useQuery({
    queryKey: ['pendingRequests'],
    queryFn: () => fetchPendingRequests(token),
    enabled: !!token,
    retry: 1,
  });

  // Mutación para aprobar/rechazar
  const mutation = useMutation({
    mutationFn: processRequest,
    onSuccess: (_, variables) => {
      // 1. Refrescar lista
      queryClient.invalidateQueries({ queryKey: ['pendingRequests'] });
      // 2. Cerrar modal de revisión
      setSelectedRequest(null);
      // 3. Mostrar éxito
      setModalInfo({
        isOpen: true,
        title: variables.status === 'aprobado' ? 'Solicitud Aprobada' : 'Solicitud Rechazada',
        description: `La acción se ha registrado correctamente en el sistema.`,
        type: 'success'
      });
    },
    onError: (err: unknown) => {
      const error = err as AxiosError;
      console.error("Error API:", error.response?.data || error.message);
      setModalInfo({ 
        isOpen: true, 
        title: 'Error al Procesar', 
        description: `Ocurrió un problema: ${error.response?.status === 404 ? 'Endpoint no encontrado' : 'Error del servidor'}.`, 
        type: 'error' 
      });
    }
  });

  // Handlers que se pasan al Modal
  const handleApprove = (id: number) => {
    mutation.mutate({ id, status: 'aprobado', token });
  };

  const handleReject = (id: number, motivo: string) => {
    mutation.mutate({ id, status: 'rechazado', token, motivo });
  };

  // Preparar datos y abrir modal
  const openReviewModal = (req: PostulacionResumenApi) => {
    const detalle: PostulacionDetalle = {
        ...req,
        // Rellenar datos si la API de lista no los trae completos
        oficio: req.oficio || "No especificado",
        bio: req.bio || "No disponible en la vista previa.",
        direccion: req.direccion || "No disponible",
        telefono: req.telefono || "No disponible",
        archivos_portafolio: req.archivos_portafolio || [],
        archivos_certificados: req.archivos_certificados || []
    };
    setSelectedRequest(detalle);
  };

  return (
    <div className="p-4 sm:p-8 bg-slate-950 min-h-screen">
      
      {/* Modal de Feedback (Éxito/Error) */}
      <InfoDialog 
        isOpen={modalInfo.isOpen} 
        onClose={() => setModalInfo({ ...modalInfo, isOpen: false })} 
        title={modalInfo.title} 
        description={modalInfo.description} 
        type={modalInfo.type} 
      />
      
      {/* Modal de Revisión Detallada */}
      {selectedRequest && (
        <ReviewApplicationModal
          postulacion={selectedRequest}
          isOpen={true}
          onClose={() => setSelectedRequest(null)}
          onApprove={handleApprove}
          onReject={handleReject} // Ahora recibe el motivo del modal
          isProcessing={mutation.isPending}
        />
      )}

      {/* Contenido Principal */}
      <div className="mx-auto max-w-6xl">
        
        {/* Header Dashboard */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white font-poppins [text-shadow:0_0_15px_rgba(234,179,8,0.4)]">
              Panel de Administrador
            </h1>
            <p className="text-slate-400 mt-2">Gestiona las solicitudes de ingreso a la red de prestadores.</p>
          </div>
          <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 shadow-md">
            <span className="text-slate-400 text-sm font-medium">Solicitudes Pendientes:</span>
            <span className="ml-2 text-2xl font-bold text-amber-400">{postulaciones?.length || 0}</span>
          </div>
        </div>
        
        {/* Tabla */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
              Bandeja de Entrada
            </h2>
          </div>
          
          {isLoading && (
            <div className="flex justify-center items-center h-64">
              <FaSpinner className="animate-spin text-amber-400 text-4xl" />
            </div>
          )}
          
          {error && (
            <div className="text-center p-12 text-red-400 bg-red-900/10 m-4 rounded-lg border border-red-900/20">
              <p className="font-bold mb-2">Error de conexión con el servidor.</p>
              <p className="text-sm opacity-80">Verifica tu conexión o los permisos de administrador.</p>
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
                    <th className="p-4 font-medium">Especialidad</th>
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
                            onClick={() => openReviewModal(req)}
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