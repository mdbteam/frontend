import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockPrestadores } from '../data/mockData';
import { Button } from 'flowbite-react';
import ProfileHeader from '../components/profile/ProfileHeader';
import {ServiceCard} from '../components/profile/ServiceCard';
import ReviewCard from '../components/profile/ReviewCard';
import {RatingSummary} from '../components/profile/RatingSummary';
import {CommentForm} from '../components/profile/CommentForm';


function ProfileSection({ title, children }: { readonly title: string; readonly children: React.ReactNode }) {
    return (
        <section className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-2xl font-bold text-gray-800">{title}</h2>
            <div className="space-y-4">{children}</div>
        </section>
    );
}

function PrestadorProfilePage() {
    const { prestadorId } = useParams();
    const prestador = mockPrestadores.find(p => p.id === prestadorId);

    if (!prestador) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center">
                <h1 className="text-2xl font-bold text-red-600">Prestador no encontrado</h1>
                <p className="mt-2 text-gray-500">No pudimos encontrar el perfil que buscas.</p>
                <Button as={Link} to="/" color="info" className="mt-6">Volver al Inicio</Button>
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
                    {prestador.reseñas.map(reseña => <ReviewCard averageRating={0} totalReviews={0} ratingDistribution={[]} key={reseña.id} {...reseña} />)}
                </ProfileSection>
            </div>
        </div>
    );
}

export default PrestadorProfilePage;