import React, { useState, useEffect } from 'react';
import type { ProviderRequest } from '../../data/mockAdminData'; 
import { mockProviderRequests } from '../../data/mockAdminData';
import RequestsTable from '../../components/admin/RequestsTable';
import ActionPanel from '../../components/admin/ActionPanel';
import ProfileHeader from '../../components/profile/ProfileHeader';
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
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-100 min-h-screen  text-center">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Aprobaciones</h1>
        <p className="text-gray-600 mt-1">Revisa, aprueba o rechaza las solicitudes de los prestadores de servicios.</p>
      </header>

      <main>
        {!selectedRequest ? (
          <RequestsTable requests={requests} onSelectRequest={handleSelectRequest} />
        ) : (
          <div>
            <button onClick={handleGoBack} className="mb-6 text-indigo-600 hover:text-indigo-900 font-semibold">
              &larr; Volver al Dashboard
            </button>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow space-y-8">
                <ProfileHeader
                    nombre={selectedRequest.providerName}
                    oficio={selectedRequest.serviceCategory}
                    fotoUrl={selectedRequest.profileData.avatarUrl}
                    descripcion={selectedRequest.profileData.description}
                    estaVerificado={selectedRequest.status === 'Aprobado'}
                />

                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Servicios Ofrecidos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedRequest.profileData.services.map((service, index) => (
                      <ServiceCard
                        key={index}
                        // CORRECCIÓN 2: Reemplaza 'propParaElTitulo' y 'propParaElPrecio' 
                        // con los nombres EXACTOS de las props de tu componente ServiceCard.
                        // Ejemplo: si tus props se llaman 'title' y 'price', úsalas aquí.
                        nombre={service.title}
                        precioEstimado={service.price}
                      />
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Portafolio</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedRequest.profileData.portfolio.map((item, index) => (
                      <PortfolioItem
                        key={index}
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