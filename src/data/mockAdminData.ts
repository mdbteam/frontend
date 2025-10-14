
export interface ProviderRequest {
  id: string;
  providerName: string;
  rut: string;
  serviceCategory: string;
  submissionDate: string;
  status: 'Pendiente' | 'Aprobado' | 'Rechazado' | 'Requiere Modificación';
  profileData: {
    avatarUrl: string;
    description: string;
    services: { title: string; price: string }[];

    portfolio: { title: string; imageUrl: string; description: string }[];
  };
}


export const mockProviderRequests: ProviderRequest[] = [
  {
    id: 'req-001',
    providerName: 'Juan Pérez',
    rut: '12.345.678-9',
    serviceCategory: 'Plomería',
    submissionDate: '2025-09-25',
    status: 'Pendiente',
    profileData: {
      avatarUrl: 'https://via.placeholder.com/150',
      description: 'Plomero con más de 10 años de experiencia en la comuna.',
      services: [{ title: 'Reparación de cañerías', price: '$25.000' }],

      portfolio: [{ title: 'Cocina Principal', imageUrl: 'https://via.placeholder.com/300', description: 'Trabajo realizado en cocina.' }]
    }
  },
  {
    id: 'req-002',
    providerName: 'María González',
    rut: '15.789.123-K',
    serviceCategory: 'Cuidado de Niños',
    submissionDate: '2025-09-24',
    status: 'Pendiente',
    profileData: {
      avatarUrl: 'https://via.placeholder.com/150',
      description: 'Educadora de párvulos con certificación.',
      services: [{ title: 'Cuidado por hora', price: '$8.000/hr' }],
      portfolio: [] 
    }
  },
  {
    id: 'req-003',
    providerName: 'Carlos Soto',
    rut: '18.456.789-1',
    serviceCategory: 'Electricidad',
    submissionDate: '2025-09-22',
    status: 'Aprobado',
    profileData: {
      avatarUrl: 'https://via.placeholder.com/150',
      description: 'Electricista certificado SEC.',
      services: [{ title: 'Instalación de lámparas', price: '$20.000' }],

      portfolio: [{ title: 'Iluminación LED', imageUrl: 'https://via.placeholder.com/300', description: 'Instalación de iluminación LED.' }]
    }
  },
];