import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { FaSpinner, FaSearch } from 'react-icons/fa';
import { PrestadorCard } from '../components/prestadores/PrestadorCard'; 

interface Prestador {
  id: string;
  nombres: string;
  primer_apellido: string;
  foto_url: string | null;
  oficios: string[]; 
  resumen: string | null; 
  puntuacion: number | null;
}

const normalizeString = (str: string | null) => {
  if (!str) return null;
  return str
    .toLowerCase()
    .normalize("NFD") 
    .replace(/[\u0300-\u036f]/g, "");
};

const fetchPrestadores = async (categoria: string | null, searchTerm: string) => {
  const categoriaNormalizada = normalizeString(categoria);
  
  const { data } = await axios.get<Prestador[]>('/api/prestadores', {
    params: {
      q: searchTerm || undefined,
      categoria: categoriaNormalizada || undefined,
    }
  });
  return data;
};

export default function PrestadorListPage() {
  const [searchParams] = useSearchParams();
  
  // --- ¡AQUÍ ESTÁ LA CORRECCIÓN! ---
  // Leemos "categoria" (lo que envía el Chatbot y el Home)
  const categoriaFromUrl = searchParams.get('categoria'); 

  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState(categoriaFromUrl || null);

  useEffect(() => {
    // Sincronizamos si la URL cambia
    setCategoriaFilter(searchParams.get('categoria')); 
  }, [searchParams]);

  const { data: prestadores, isLoading, error } = useQuery({
    queryKey: ['prestadores', categoriaFilter, searchTerm],
    queryFn: () => fetchPrestadores(categoriaFilter, searchTerm),
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
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
                value={searchTerm} 
                onChange={handleSearchChange}
                placeholder="Buscar por oficio o nombre (Ej: Plomero)"
                className="w-full px-5 py-3 pr-12 rounded-full bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none">
                <FaSearch className="text-slate-400" />
              </div>
            </div>
            
            {categoriaFilter && (
              <p className="mt-3 text-sm text-slate-400">
                Filtrando por: <span className="font-semibold text-amber-400">{categoriaFilter}</span>
              </p>
            )}
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
          {prestadores && prestadores.length === 0 && (
            <div className="p-8 text-center text-slate-400 bg-slate-800/50 rounded-lg">
              <p>No se encontraron prestadores que coincidan con tu búsqueda.</p>
            </div>
          )}
          {prestadores && prestadores.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {prestadores.map((prestador) => (
                <PrestadorCard
                  key={prestador.id}
                  id={prestador.id}
                  nombres={prestador.nombres}
                  primer_apellido={prestador.primer_apellido}
                  fotoUrl={prestador.foto_url || `https://ui-avatars.com/api/?name=${prestador.nombres}+${prestador.primer_apellido}&background=0A0A0A&color=FFF`}
                  oficio={prestador.oficios?.[0] || 'Profesional'}
                  resumen={prestador.resumen || 'Sin resumen disponible.'}
                  puntuacion={prestador.puntuacion || 0}
                />
              ))}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}