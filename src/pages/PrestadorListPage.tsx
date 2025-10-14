
import { PrestadorCard } from '../components/prestadores/PrestadorCard'; 
import { mockPrestadores } from '../data/mockData';

function PrestadorListPage() {
  return (
    <div className="bg-slate-900 p-4 sm:p-8 min-h-screen">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl font-bold font-poppins text-slate-100">
          Encuentra un Agente
        </h1>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {mockPrestadores.map((prestador) => (
            <PrestadorCard
              key={prestador.id}
              id={prestador.id}
              nombres={prestador.nombres}
              primer_apellido={prestador.primer_apellido}
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