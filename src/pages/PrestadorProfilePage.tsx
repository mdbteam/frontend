import React from 'react';
import ProfileHeader from '../components/profile/ProfileHeader';
import ServiceCard from '../components/profile/ServiceCard';
import ReviewCard from '../components/profile/ReviewCard';
import PortfolioItem from '../components/profile/PortfolioItem';

// --- ¡Aquí están nuestros datos de prueba (mock data)! ---
const mockPrestador = {
  id: '1',
  nombreCompleto: 'Juan Pérez',
  oficioPrincipal: 'Gasfitería',
  fotoUrl: 'https://via.placeholder.com/150', // Una imagen de ejemplo
  puntuacionPromedio: 4.8,
  totalReseñas: 62,
  estaVerificado: true,
  descripcion: 'Más de 15 años de experiencia en instalaciones y reparaciones. Trabajo garantizado y con los mejores materiales del mercado.',
  servicios: [
    { id: 's1', nombre: 'Instalación de calefont', precioEstimado: '$50.000' },
    { id: 's2', nombre: 'Reparación de filtraciones', precioEstimado: '$35.000' },
    { id: 's3', nombre: 'Mantención de redes de agua', precioEstimado: '$40.000' },
  ],
  reseñas: [
    { id: 'r1', autor: 'María González', puntuacion: 5, comentario: '¡Excelente servicio! Muy profesional y rápido. Lo recomiendo totalmente.' },
    { id: 'r2', autor: 'Carlos Soto', puntuacion: 4, comentario: 'Buen trabajo, aunque llegó un poco tarde. El problema quedó solucionado.' },
  ],
  trabajos: [
    { id: 't1', title: 'Baño Principal Remodelado', imageUrl: 'https://via.placeholder.com/400x300.png/0000FF/808080?text=Baño' },
    { id: 't2', title: 'Cocina con Isla Central', imageUrl: 'https://via.placeholder.com/400x300.png/FF0000/FFFFFF?text=Cocina' },
    { id: 't3', title: 'Instalación Piso Flotante', imageUrl: 'https://via.placeholder.com/400x300.png/00FF00/000000?text=Piso' },
    ],
  certificados: [
    { id: 'c1', title: 'Certificado SEC', imageUrl: 'https://via.placeholder.com/400x300.png/FFFF00/000000?text=SEC' },
    ]
};
// --- Fin de los datos de prueba ---


// (Aquí irían los imports de los sub-componentes cuando los creemos)
// import ProfileHeader from '../components/profile/ProfileHeader';
// import ServiceCard from '../components/profile/ServiceCard';
// import ReviewCard from '../components/profile/ReviewCard';


function PrestadorProfilePage() {
  const prestador = mockPrestador;

  return (
    <div className="bg-gray-100 min-h-screen">
      <main className="max-w-4xl mx-auto p-4 md:p-8">
        
        {/* Sección 1: Encabezado del Perfil */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <ProfileHeader 
                nombre={prestador.nombreCompleto}
                oficio={prestador.oficioPrincipal}
                fotoUrl={prestador.fotoUrl}
                puntuacion={prestador.puntuacionPromedio}
                estaVerificado={prestador.estaVerificado}
            />
        </div>

        {/* Sección 2: Servicios Ofrecidos */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Servicios</h2>
        {/* Usamos una lista ul para la semántica correcta */}
        <ul className="divide-y divide-gray-200">
            {prestador.servicios.map(servicio => (
            <ServiceCard 
                key={servicio.id} 
                nombre={servicio.nombre} 
                precio={servicio.precioEstimado} 
            />
            ))}
        </ul>
        </div>
        
        {/* Sección 3: Reseñas de Clientes */}
        <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Reseñas ({prestador.totalReseñas})</h2>
        <div className="space-y-6">
            {prestador.reseñas.map(reseña => (
            <ReviewCard
                key={reseña.id}
                autor={reseña.autor}
                puntuacion={reseña.puntuacion}
                comentario={reseña.comentario}
            />
            ))}
        </div>
        </div>

        {/* Sección 4: Portafolio de Trabajos */}
        <div className="bg-white p-6 rounded-lg shadow-md mt-8">
        <h2 className="text-2xl font-semibold mb-4">Trabajos Realizados</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {prestador.trabajos.map(trabajo => (
            <PortfolioItem 
                key={trabajo.id}
                title={trabajo.title}
                imageUrl={trabajo.imageUrl}
            />
            ))}
        </div>
        </div>

        {/* Sección 5: Certificados */}
        <div className="bg-white p-6 rounded-lg shadow-md mt-8">
        <h2 className="text-2xl font-semibold mb-4">Certificados y Acreditaciones</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {prestador.certificados.map(cert => (
            <PortfolioItem 
                key={cert.id}
                title={cert.title}
                imageUrl={cert.imageUrl}
            />
            ))}
        </div>
        </div>

      </main>
    </div>
  );
}

export default PrestadorProfilePage;