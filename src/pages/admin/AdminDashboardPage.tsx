import { useState } from 'react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';

import type { Postulacion } from '../../types/adminTypes';
import RequestsTable from '../../components/admin/RequestsTable';
import ActionPanel from '../../components/admin/ActionPanel';
import { ProfileHeader } from '../../components/profile/ProfileHeader';
import { ServiceCard } from '../../components/profile/ServiceCard';
import PortfolioItem from '../../components/profile/PortfolioItem';
import { FaSpinner } from 'react-icons/fa';

// --- Funciones de API ---

const fetchPendientes = async (token: string | null) => {
  if (!token) throw new Error('No autenticado');
  const { data } = await axios.get<Postulacion[]>('/api/postulaciones/pendientes', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

const approvePostulacion = (id: string, token: string | null) => {
  return axios.post(`/api/postulaciones/${id}/aprobar`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

const rejectPostulacion = (id: string, token: string | null) => {
  return axios.post(`/api/postulaciones/${id}/rechazar`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

const requestModification = (id: string, token: string | null) => {
  return axios.post(`/api/postulaciones/${id}/modificar`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
};


const AdminDashboardPage: React.FC = () => {
  const [selectedRequest, setSelectedRequest] = useState<Postulacion | null>(null);
  const queryClient = useQueryClient();
  const { token } = useAuthStore();

  const { data: requests, isLoading, error } = useQuery({
    queryKey: ['postulacionesPendientes'],
    queryFn: () => fetchPendientes(token),
  });

  // --- CORRECCIÓN: Cambiado Promise<any> a Promise<unknown> ---
  const usePostulacionAction = (mutationFn: (id: string, token: string | null) => Promise<unknown>) => {
    return useMutation({
      mutationFn: (id: string) => mutationFn(id, token),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['postulacionesPendientes'] });
        setSelectedRequest(null);
      },
      onError: (err) => {
        console.error("Error en la acción de admin:", err);
        alert("Ocurrió un error al procesar la solicitud.");
      }
    });
  };

  const approveMutation = usePostulacionAction(approvePostulacion);
  const rejectMutation = usePostulacionAction(rejectPostulacion);
  const modifyMutation = usePostulacionAction(requestModification);

  const handleSelectRequest = (request: Postulacion) => {
    setSelectedRequest(request);
  };

  const handleGoBack = () => {
    setSelectedRequest(null);
  };

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

        {requests && !selectedRequest && (
          <RequestsTable requests={requests} onSelectRequest={handleSelectRequest} />
        )}
        
        {requests && selectedRequest && (
          <div>
            <button onClick={handleGoBack} className="mb-6 text-cyan-400 hover:text-cyan-300 font-semibold">
              &larr; Volver al Dashboard
            </button>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700 p-6 rounded-lg space-y-8">
                <ProfileHeader
                    nombres={selectedRequest.providerName}
                    primer_apellido={""} // TODO: Pedir a backend que añada este campo
                    oficio={selectedRequest.serviceCategory}
                    fotoUrl={selectedRequest.profileData.avatarUrl}
                    resumen={selectedRequest.profileData.description}
                    estaVerificado={selectedRequest.status === 'Aprobado'}
                />

                <div>
                  <h3 className="text-xl font-bold text-yellow-400 mb-4 border-b border-slate-700 pb-2">Servicios Ofrecidos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedRequest.profileData.services.map((service) => (
                      <ServiceCard
                        key={service.title}
                        nombre={service.title}
                        precioEstimado={service.price}
                      />
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-yellow-400 mb-4 border-b border-slate-700 pb-2">Portafolio</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedRequest.profileData.portfolio.map((item) => (
                      <PortfolioItem
                        key={item.title}
                        title={item.title}
                        imageUrl={item.imageUrl}
                        description={item.description}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1">
                <ActionPanel 
                  request={selectedRequest}
                  onApprove={approveMutation.mutate}
                  onReject={rejectMutation.mutate}
                  onRequestModification={modifyMutation.mutate}
                />
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboardPage;