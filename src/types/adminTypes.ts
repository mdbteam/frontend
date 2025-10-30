
export type ApplicationStatus = 'Pendiente' | 'Aprobado' | 'Rechazado' | 'Requiere Modificación';


interface ProfileService {
  title: string;
  price: string;
}

interface ProfilePortfolioItem {
  title: string;
  imageUrl: string;
  description: string;
}

interface ProfileData {
  avatarUrl: string;
  description: string | null; 
  services: ProfileService[];
  portfolio: ProfilePortfolioItem[];
}

export interface Postulacion {
  id: string;
  providerName: string;
  rut: string;
  serviceCategory: string;
  submissionDate: string;
  status: ApplicationStatus;
  profileData: ProfileData; 
}