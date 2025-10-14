// src/pages/PrestadorProfilePage.tsx
import { useParams, Link } from 'react-router-dom';
import { mockPrestadores } from '../data/mockData';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { ServiceCard } from '../components/profile/ServiceCard';
import { ReviewCard } from '../components/profile/ReviewCard';
import { RatingSummary } from '../components/profile/RatingSummary';
import { CommentForm } from '../components/profile/CommentForm';


function ProfileSection({ title, children }: { readonly title: string; readonly children: React.ReactNode }) {
    return (
        <section className="rounded-lg bg-slate-800/50 border border-slate-700 p-6 backdrop-blur-sm">
            <h2 className="mb-4 text-2xl font-bold text-yellow-400 font-poppins">{title}</h2>
            <div className="space-y-4">{children}</div>
        </section>
    );
}

function PrestadorProfilePage() {
    const { prestadorId } = useParams<{ prestadorId: string }>();
    const prestador = mockPrestadores.find(p => p.id === prestadorId);

    if (!prestador) {
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
                <ProfileHeader {...prestador} />

                <ProfileSection title="Servicios Ofrecidos">
                    {prestador.servicios.map(servicio => <ServiceCard key={servicio.id} {...servicio} />)}
                </ProfileSection>

                <RatingSummary
                    averageRating={prestador.puntuacion}
                    totalReviews={prestador.totalReseñas}
                    ratingDistribution={prestador.ratingDistribution}
                />
                
                <CommentForm />

                <ProfileSection title="Comentarios de otros clientes">
                    {prestador.reseñas.map(reseña => <ReviewCard key={reseña.id} {...reseña} />)}
                </ProfileSection>
            </div>
        </div>
    );
}

export default PrestadorProfilePage;