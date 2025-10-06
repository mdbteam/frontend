import React from 'react';
import { PrestadorCard } from '../components/prestadores/PrestadorCard';
import { mockPrestadores } from '../data/mockData';

function PrestadorListPage() {
  return (
    <div className="p-4 sm:p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl font-bold font-poppins text-slate-800">
          Encuentra un Profesional
        </h1>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
      </div>
    </div>
  );
}

export default PrestadorListPage;