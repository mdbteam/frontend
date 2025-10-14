import { useState, useEffect } from 'react';
import type { ProviderRequest } from '../../data/mockAdminData'; 
import { mockProviderRequests } from '../../data/mockAdminData';
import RequestsTable from '../../components/admin/RequestsTable';
import ActionPanel from '../../components/admin/ActionPanel';
import {ProfileHeader} from '../../components/profile/ProfileHeader';
import { ServiceCard } from '../../components/profile/ServiceCard'; 
import PortfolioItem from '../../components/profile/PortfolioItem';

const AdminDashboardPage: React.FC = () => {
  const [requests, setRequests] = useState<ProviderRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ProviderRequest | null>(null);

  useEffect(() => {
    setRequests(mockProviderRequests);
  }, []);

  const handleSelectRequest = (request: ProviderRequest) => {
    setSelectedRequest(request);
  };

  const handleGoBack = () => {
    setSelectedRequest(null);
  };

  const handleApprove = (id: string) => {
    alert(`Perfil ${id} aprobado.`);
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Aprobado' } : r));
    setSelectedRequest(null);
  };

  const handleReject = (id: string) => {
    alert(`Perfil ${id} rechazado.`);
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Rechazado' } : r));
    setSelectedRequest(null);
  };

  return (
    // SOLUCIÓN: Ajustamos el padding y el color de fondo ya es heredado.
    <div className="p-4 sm:p-8 min-h-screen">
      <header className="mb-8">
        {/* SOLUCIÓN: Cambiamos los colores del texto para que sean visibles y consistentes. */}
        <h1 
          className="text-4xl font-bold text-white font-poppins"
          style={{ textShadow: '0 0 15px rgba(234, 179, 8, 0.4)' }}
        >
          Dashboard de Aprobación
        </h1>
        <p className="text-slate-400 mt-2">Revisa, aprueba o rechaza las solicitudes de los agentes.</p>
      </header>

      <main>
        {!selectedRequest ? (
          // El componente RequestsTable probablemente necesite ser adaptado también.
          <RequestsTable requests={requests} onSelectRequest={handleSelectRequest} />
        ) : (
          <div>
            {/* SOLUCIÓN: Ajustamos el color del botón "Volver". */}
            <button onClick={handleGoBack} className="mb-6 text-cyan-400 hover:text-cyan-300 font-semibold">
              &larr; Volver al Dashboard
            </button>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* SOLUCIÓN: Cambiamos el fondo blanco por uno oscuro y semitransparente. */}
              <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700 p-6 rounded-lg space-y-8">
                <ProfileHeader
                    nombres={selectedRequest.providerName}
                    primer_apellido={""}
                    oficio={selectedRequest.serviceCategory}
                    fotoUrl={selectedRequest.profileData.avatarUrl}
                    resumen={selectedRequest.profileData.description}
                    estaVerificado={selectedRequest.status === 'Aprobado'}
                />

                <div>
                  {/* SOLUCIÓN: Cambiamos el color del texto de la sección. */}
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
                  {/* SOLUCIÓN: Cambiamos el color del texto de la sección. */}
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
                {/* El componente ActionPanel probablemente necesite ser adaptado también. */}
                <ActionPanel 
                  request={selectedRequest}
                  onApprove={handleApprove}
                  onReject={handleReject}
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