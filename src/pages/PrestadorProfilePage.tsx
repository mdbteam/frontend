// src/pages/PrestadorProfilePage.tsx

import React from 'react';
import { useParams } from 'react-router-dom'; // <-- Hook para leer parámetros de la URL
import { mockPrestadores } from '../data/mockData'; // <-- Importamos todos los prestadores

// Importamos los componentes que ya tenías
import ProfileHeader from '../components/profile/ProfileHeader';
// ... (importa ServiceCard, ReviewCard, etc. si los vas a usar)

function PrestadorProfilePage() {
  // Leemos el parámetro "prestadorId" de la URL
  const { prestadorId } = useParams();

  // Buscamos el prestador correspondiente en nuestros datos de prueba
  const prestador = mockPrestadores.find(p => p.id === prestadorId);

  // Manejo por si no se encuentra el prestador
  if (!prestador) {
    return <div className="p-8 text-center text-red-500">Prestador no encontrado.</div>;
  }

  // Si se encuentra, renderizamos el perfil con sus datos
  return (
    <div className="bg-slate-50 min-h-screen p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <ProfileHeader
          nombre={prestador.nombre}
          oficio={prestador.oficio}
          fotoUrl={prestador.fotoUrl}
          descripcion={prestador.descripcion}
          estaVerificado={true} // Asumiendo que todos están verificados por ahora
        />

        {/* Aquí puedes agregar las otras secciones como Servicios y Reseñas,
            usando los datos de `prestador.servicios` y `prestador.reseñas` */}

      </div>
    </div>
  );
}

export default PrestadorProfilePage;