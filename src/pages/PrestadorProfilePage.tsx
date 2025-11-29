import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { FaSpinner } from 'react-icons/fa';

import { ProfileHeader } from '../components/profile/ProfileHeader';
import { ServiceCard } from '../components/profile/ServiceCard';
import { ReviewCard } from '../components/profile/ReviewCard';
import { RatingSummary } from '../components/profile/RatingSummary';
import { CommentForm } from '../components/profile/CommentForm';

// --- (Definición de tipos basada en tu código) ---
interface PerfilDetalle { biografia: string | null; anos_experiencia: number | null; }
interface Resena { 
  id_valoracion: number; 
  id_autor: number; 
  puntaje: number | null; 
  comentario: string | null; 
  fecha_creacion: string; 
  // Asumimos que la API nos dará el nombre y foto del autor de la reseña
  autor_nombres?: string; 
  autor_foto_url?: string | null;
}
interface Servicio { id: string; nombre: string; precioEstimado: number; }
interface RatingDistributionItem { stars: number; count: number; }

// --- (Interfaz de API actualizada) ---
interface PrestadorPublicoDetalle {
  id_usuario: number;
  nombres: string;
  primer_apellido: string;
  foto_url: string;
  oficios: string[];
  puntuacion_promedio: number;
  trabajos_realizados: number;
  perfil: PerfilDetalle | null;
  estaVerificado: boolean; // Prop que faltaba
  resenas: Resena[];
  servicios: Servicio[]; 
  ratingDistribution: RatingDistributionItem[];
}

const fetchPrestadorProfile = async (id: string | undefined): Promise<PrestadorPublicoDetalle> => {
  if (!id) throw new Error("ID de prestador no válido");
  const { data } = await axios.get(`/api/prestadores/${id}`);
  return data;
};

function ProfileSection({ title, children }: { readonly title: string; readonly children: React.ReactNode }) {
    return (
        <section className="rounded-lg bg-slate-800/50 border border-slate-700 p-6 backdrop-blur-sm">
            <h2 className="mb-4 text-2xl font-bold text-yellow-400 font-poppins">{title}</h2>
            <div className="space-y-4">{children}</div>
        </section>
    );
}

export default function PrestadorProfilePage() {
    const { prestadorId } = useParams<{ prestadorId: string }>();

    const { data: prestador, isLoading, error } = useQuery({
      queryKey: ['prestadorProfile', prestadorId],
      queryFn: () => fetchPrestadorProfile(prestadorId),
    });

    if (isLoading) {
      return (
        <div className="flex justify-center items-center min-h-[50vh]">
          <FaSpinner className="animate-spin text-amber-400 text-4xl" />
        </div>
      );
    }

    if (error || !prestador) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center">
                <h1 className="text-2xl font-bold text-red-500">Prestador no encontrado</h1>
                <p className="mt-2 text-slate-400">No pudimos encontrar el perfil que buscas.</p>
                <Link to="/" className="mt-6 inline-block bg-cyan-500 text-white px-6 py-2 rounded-md font-medium hover:bg-cyan-400">
                    Volver al Inicio
                </Link>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-8">
            <div className="mx-auto max-w-4xl space-y-8">
                
                {/* --- CORRECCIÓN 1: Props de ProfileHeader --- */}
                <ProfileHeader 
                  nombres={prestador.nombres}
                  primer_apellido={prestador.primer_apellido}
                  fotoUrl={prestador.foto_url}
                  oficio={prestador.oficios[0] || 'Profesional'}
                  resumen={prestador.perfil?.biografia || 'El usuario aún no ha agregado un resumen.'}
                  estaVerificado={prestador.estaVerificado}
                />

                {/* Asumimos que la API devuelve 'servicios'. Si no, esta sección no se mostrará. */}
                {prestador.servicios && prestador.servicios.length > 0 && (
                  <ProfileSection title="Servicios Ofrecidos">
                      {prestador.servicios.map(servicio => (
                          <ServiceCard 
                              key={servicio.id} 
                              nombre={servicio.nombre} 
                              precioEstimado={servicio.precioEstimado.toString()} 
                          />
                      ))}
                  </ProfileSection>
                )}

                {/* Asumimos que la API devuelve 'ratingDistribution'. */}
                {prestador.ratingDistribution && (
                  <RatingSummary
                      averageRating={prestador.puntuacion_promedio}
                      totalReviews={prestador.trabajos_realizados}
                      ratingDistribution={prestador.ratingDistribution}
                  />
                )}
                
                <CommentForm />

                {/* --- CORRECCIÓN 2: Props de ReviewCard --- */}
                {prestador.resenas && prestador.resenas.length > 0 && (
                  <ProfileSection title="Comentarios de otros clientes">
                      {prestador.resenas.map(reseña => (
                        <ReviewCard 
                          key={reseña.id_valoracion} 
                          // Usamos 'autor_nombres' si viene, si no, un genérico.
                          autor={reseña.autor_nombres || `Cliente #${reseña.id_autor}`}
                          comentario={reseña.comentario || ''}
                          puntuacion={reseña.puntaje || 0}
                          fotoUrl={reseña.autor_foto_url || undefined} // Pasamos la foto si existe
                        />
                      ))}
                  </ProfileSection>
                )}
            </div>
        </div>
    );
}