import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Search, Briefcase, User, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { PrestadorCard } from '../components/prestadores/PrestadorCard';

const CATEGORIAS_POPULARES = [
  'Gasfiteria', 'Electricidad', 'Carpinteria', 'Pintura', 'Muebleria',
  'Albanileria', 'Jardineria', 'Mecanica', 'Retiro de Escombros', 'Cerrajeria',
  'Servicios de Limpieza', 'Techado', 'Reparacion de Electrodomesticos',
  'Flete y Mudanza',
];

interface PrestadorResumen {
  id?: number;
  id_usuario?: number;
  nombres: string;
  primer_apellido: string;
  foto_url: string | null;
  oficios: string[];
  puntuacion_promedio: number;
  resumen?: string;
}

const apiProveedores = axios.create({
  baseURL: 'https://provider-service-mjuj.onrender.com',
});

const fetchPrestadores = async (categoria: string | null, searchTerm: string, genero: string | null) => {
  const { data } = await apiProveedores.get<PrestadorResumen[]>('/prestadores', {
    params: {
      q: searchTerm || undefined,
      categoria: categoria || undefined,
      genero: genero || undefined, 
    },
  });
  return data;
};

export default function PrestadorListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Estado local para manejo fluido del input
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('q') || '');
  
  const categoriaFilter = searchParams.get('categoria');
  const generoFilter = searchParams.get('genero');

  // Sincronizar URL -> Estado local (Si cambia externamente)
  useEffect(() => {
    const qParams = searchParams.get('q');
    if (qParams !== null && qParams !== searchTerm) {
      setSearchTerm(qParams);
    }
  }, [searchParams]);

  const updateFilters = (updates: { categoria?: string | null; q?: string | null; genero?: string | null }) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (updates.categoria !== undefined) {
      if (updates.categoria) newParams.set('categoria', updates.categoria);
      else newParams.delete('categoria');
    }

    if (updates.q !== undefined) {
      if (updates.q) newParams.set('q', updates.q);
      else newParams.delete('q');
    }

    if (updates.genero !== undefined) {
      if (updates.genero) newParams.set('genero', updates.genero);
      else newParams.delete('genero');
    }

    setSearchParams(newParams);
  };

  const { data: prestadores, isLoading, error } = useQuery({
    queryKey: ['prestadoresPublicos', categoriaFilter, searchTerm, generoFilter],
    queryFn: () => fetchPrestadores(categoriaFilter, searchTerm, generoFilter),
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ q: searchTerm });
  };

  const clearSearch = () => {
    setSearchTerm('');
    updateFilters({ q: '' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/30 via-slate-950 to-slate-950 z-0" />
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            Encuentra Expertos
          </h1>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Conectamos tus necesidades con profesionales calificados.
          </p>
          
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto relative">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
              <Input 
                type="text" 
                placeholder="¿Qué buscas? (ej: gasfiter, electricista)" 
                className="pl-10 pr-10 bg-slate-900/80 border-slate-700 h-12 text-lg text-white w-full" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
              {searchTerm && (
                <button 
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white p-1"
                  aria-label="Borrar búsqueda" // 🟢 CORRECCIÓN A11Y
                  title="Borrar búsqueda"       // 🟢 CORRECCIÓN A11Y
                >
                  <X size={18} />
                </button>
              )}
            </div>
            <Button type="submit" className="h-12 px-8 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-lg">
              Buscar
            </Button>
          </form>

        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex flex-col gap-2 items-start">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Briefcase className="text-cyan-400" size={24} />
              {categoriaFilter ? `Expertos en ${categoriaFilter}` : 'Todos los Profesionales'}
            </h2>
            
            {/* Chips de Filtros Activos */}
            <div className="flex flex-wrap gap-2">
                {generoFilter && (
                    <div className="flex items-center gap-2 text-xs font-medium text-amber-400 bg-amber-900/20 px-3 py-1 rounded-full border border-amber-500/30">
                        <User size={12} />
                        Género: {generoFilter}
                        <button 
                            onClick={() => updateFilters({ genero: null })} 
                            className="ml-1 hover:text-white"
                            aria-label="Quitar filtro de género" // 🟢 CORRECCIÓN
                            title="Quitar filtro"                // 🟢 CORRECCIÓN
                        >
                            <X size={12}/>
                        </button>
                    </div>
                )}
                {categoriaFilter && (
                    <div className="flex items-center gap-2 text-xs font-medium text-cyan-400 bg-cyan-900/20 px-3 py-1 rounded-full border border-cyan-500/30">
                        Categoría: {categoriaFilter}
                        <button 
                            onClick={() => updateFilters({ categoria: null })} 
                            className="ml-1 hover:text-white"
                            aria-label="Quitar filtro de categoría" // 🟢 CORRECCIÓN
                            title="Quitar filtro"                   // 🟢 CORRECCIÓN
                        >
                            <X size={12}/>
                        </button>
                    </div>
                )}
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap justify-center max-w-2xl">
            <Button 
                variant="outline" 
                size="sm" 
                onClick={() => updateFilters({ categoria: null })} 
                className={!categoriaFilter ? 'bg-cyan-950 border-cyan-500 text-cyan-400' : 'bg-transparent text-slate-400 border-slate-700 hover:text-slate-200'}
            >
                Todos
            </Button>
            {CATEGORIAS_POPULARES.map((cat) => (
              <Button 
                key={cat} 
                variant="outline" 
                size="sm" 
                onClick={() => updateFilters({ categoria: cat })} 
                className={categoriaFilter === cat ? 'bg-cyan-950 border-cyan-500 text-cyan-400' : 'bg-transparent text-slate-400 border-slate-700 hover:text-slate-200'}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {isLoading && <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div></div>}
        {error && <div className="bg-red-900/20 border border-red-800 text-red-200 p-6 rounded-lg text-center"><p>Error al cargar resultados.</p></div>}
        
        {!isLoading && !error && prestadores?.length === 0 && (
          <div className="text-center py-20 bg-slate-900/30 rounded-xl border border-slate-800">
            <p className="text-slate-400 text-lg">No se encontraron resultados.</p>
            <Button variant="link" onClick={() => { setSearchTerm(''); updateFilters({ categoria: null, q: null, genero: null }); }} className="mt-4 text-cyan-400">
                Limpiar todos los filtros
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prestadores?.map((prestador, index) => {
            const idSeguro = prestador.id || prestador.id_usuario || `temp-${index}`;
            return (
              <PrestadorCard 
                key={idSeguro.toString()}
                id={idSeguro.toString()}
                nombres={prestador.nombres}
                primer_apellido={prestador.primer_apellido}
                fotoUrl={prestador.foto_url || ''}
                oficio={prestador.oficios?.[0] || 'General'}
                resumen={prestador.resumen || `Experto en ${prestador.oficios?.[0] || 'servicios'}.`}
                puntuacion={prestador.puntuacion_promedio || 0}
              />
            );
          })}
        </div>
      </main>
    </div>
  );
}