
export type ApplicationStatus = 'Pendiente' | 'Aprobado' | 'Rechazado' | 'Requiere Modificación' | string;

export interface Postulacion {
  id_postulacion: number;
  id_usuario: number;
  nombres: string;
  primer_apellido: string;
  correo: string;
  fecha_postulacion: string; 
  estado: ApplicationStatus;
}