// src/pages/PrestadorListPage.tsx

import PrestadorCard from '../components/prestadores/PrestadorCard';
import { mockPrestadores } from '../data/mockData';



function PrestadorListPage() {  
  return (
    <div className="bg-slate-100 min-h-screen p-4 sm:p-8">
      <header className="max-w-7xl mx-auto mb-10">
        <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 text-center">Encuentra tu Prestador Ideal</h1>
        <p className="mt-2 text-lg text-gray-600 text-center">Explora perfiles, revisa calificaciones y contacta al experto que necesitas.</p>
      </header>

      <main className="max-w-7xl mx-auto">  
        {/* Grid para organizar las tarjetas de forma responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {mockPrestadores.map((prestador) => (
            <PrestadorCard
              key={prestador.id}
              id={prestador.id}
              nombre={prestador.nombre}
              fotoUrl={prestador.fotoUrl}
              oficio={prestador.oficio}
              resumen={prestador.resumen}
              puntuacion={prestador.puntuacion}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

export default PrestadorListPage;