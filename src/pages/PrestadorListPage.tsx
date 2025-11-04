import { useState, useEffect } from 'react';
// 1. Importamos Link y useSearchParams
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { FaSpinner, FaSearch, FaStar } from 'react-icons/fa';

interface Prestador {
  id: string;
  nombres: string;
  primer_apellido: string;
  foto_url: string | null;
  oficios: string[]; // <-- Corregido de 'categorias' a 'oficios'
  resumen: string | null; // <-- Corregido de 'resumen_profesional' a 'resumen'
  puntuacion: number | null; // <-- Corregido de 'anos_experiencia' a 'puntuacion'
}

function PrestadorCard({ prestador }: { prestador: Prestador }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg shadow-lg overflow-hidden transition-all duration-300 h-full">
      <div className="p-6">
        <div className="flex items-center space-x-4">
          <img
            className="h-20 w-20 rounded-full object-cover border-2 border-slate-600"
            src={prestador.foto_url || `https://ui-avatars.com/api/?name=${prestador.nombres}+${prestador.primer_apellido}&background=0d6efd&color=fff`}
            alt={`${prestador.nombres} ${prestador.primer_apellido}`}
          />
          <div>
            <h3 className="text-xl font-bold text-white">
              {prestador.nombres} {prestador.primer_apellido}
            </h3>
            <span className="text-sm font-medium text-cyan-400">
              {prestador.oficios?.[0] || 'Profesional'}
            </span>
          </div>
        </div>
        <p className="text-slate-300 mt-4 text-sm leading-relaxed h-20 overflow-hidden text-ellipsis">
          {prestador.resumen || 'Sin resumen disponible.'}
        </p>
        <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between items-center">
          <span className="flex items-center text-sm text-yellow-400">
            <FaStar className="mr-1" />
            {prestador.puntuacion?.toFixed(1) || 'N/A'}
          </span>
          <span className="text-sm font-medium text-cyan-400 hover:text-cyan-300">
            Ver Perfil →
          </span>
        </div>
      </div>
    </div>
  );
}

// 2. Actualizamos la función de fetching
const fetchPrestadores = async (searchTerm: string, categoria: string | null) => {
  const { data } = await axios.get<Prestador[]>('/api/prestadores', {
    params: {
      q: searchTerm || undefined,
      categoria: categoria || undefined, // <-- Añadimos el nuevo parámetro
    }
  });
  return data;
};

export default function PrestadorListPage() {
  // 3. Leemos los parámetros de la URL
  const [searchParams] = useSearchParams();
  const categoriaFromUrl = searchParams.get('categoria');

  // 4. El estado de la barra de búsqueda ahora se sincroniza con la URL
  const [searchTerm, setSearchTerm] = useState(categoriaFromUrl || '');

  // 5. Sincronizamos el estado si la URL cambia
  useEffect(() => {
    setSearchTerm(categoriaFromUrl || '');
  }, [categoriaFromUrl]);

  // 6. Pasamos ambos términos de búsqueda a useQuery
  const { data, isLoading, error } = useQuery({
    queryKey: ['prestadores', searchTerm, categoriaFromUrl],
    queryFn: () => fetchPrestadores(searchTerm, categoriaFromUrl),
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    // Nota: Esto no actualiza la URL, solo el estado de búsqueda local.
    // Podríamos añadir 'setSearchParams' aquí si quisiéramos que la URL cambie al teclear.
  };

  return (
    <div className="p-4 sm:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white font-poppins [text-shadow:0_0_15px_rgba(34,211,238,0.4)]">
            Encuentra tu Agente
          </h1>
          <p className="mt-2 text-lg text-slate-300">
            Busca profesionales calificados para el trabajo que necesitas.
          </p>
          <div className="mt-6 max-w-lg mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchTerm} // <-- El valor está controlado por el estado
                onChange={handleSearchChange}
                placeholder="Buscar por oficio o nombre (Ej: Plomero)"
                className="w-full px-5 py-3 pr-12 rounded-full bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none">
                <FaSearch className="text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        <div>
          {isLoading && (
            <div className="flex justify-center items-center min-h-[30vh]">
              <FaSpinner className="animate-spin text-cyan-400 text-4xl" />
            </div>
          )}
          {error && (
            <div className="p-8 text-center text-red-400 bg-slate-800/50 rounded-lg">
              <p>Error al cargar los prestadores. Intenta de nuevo más tarde.</p>
            </div>
          )}
          {data && data.length === 0 && (
            <div className="p-8 text-center text-slate-400 bg-slate-800/50 rounded-lg">
              <p>No se encontraron prestadores que coincidan con tu búsqueda.</p>
            </div>
          )}
          {data && data.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.map((prestador) => (
                <Link 
                  to={`/prestadores/${prestador.id}`} 
                  key={prestador.id}
                  className="block transition-transform duration-200 hover:scale-[1.02] hover:shadow-cyan-500/10"
                >
                  <PrestadorCard prestador={prestador} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}