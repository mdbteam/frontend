import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Search, Briefcase } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { PrestadorCard } from '../components/prestadores/PrestadorCard';

// --- 🔧 CONFIGURACIÓN DE CATEGORÍAS (OFICIOS) ---
// Nombres exactos según tu Base de Datos (sin tildes en algunos casos)
const CATEGORIAS_POPULARES = [
  'Gasfiteria',
  'Electricidad',
  'Carpinteria',
  'Pintura',
  'Muebleria',
  'Albanileria',
  'Jardineria',
  'Mecanica',
  'Plomeria',
  'Cerrajeria',
  'Servicios de Limpieza',
  'Techado',
  'Reparacion de Electrodomesticos',
  'Instalacion de Aire Acondicionado',
];

// --- INTERFAZ PÚBLICA ---
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

// --- API CLIENT ---
const apiProveedores = axios.create({
  baseURL: 'https://provider-service-mjuj.onrender.com',
});

const fetchPrestadores = async (categoria: string | null, searchTerm: string) => {
  const { data } = await apiProveedores.get<PrestadorResumen[]>('/prestadores', {
    params: {
      q: searchTerm || undefined,
      categoria: categoria || undefined,
    },
  });
  return data;
};

export default function PrestadorListPage() {
  // --- Filtros ---
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [categoriaFilter, setCategoriaFilter] = useState<string | null>(searchParams.get('categoria') || null);

  // Sincronizar URL -> Estado
  useEffect(() => {
    const cat = searchParams.get('categoria');
    const q = searchParams.get('q');
    if (cat !== categoriaFilter) setCategoriaFilter(cat || null);
    if (q !== searchTerm && q !== null) setSearchTerm(q);
  }, [searchParams, categoriaFilter, searchTerm]);

  // Actualizar Filtros
  const updateFilters = (newCategory: string | null, newSearch: string) => {
    setCategoriaFilter(newCategory);
    setSearchTerm(newSearch);
    
    const params: Record<string, string> = {};
    
    if (newCategory) params.categoria = newCategory;
    if (newSearch) params.q = newSearch;
    
    setSearchParams(params);
  };

  // Fetch
  const { data: prestadores, isLoading, error } = useQuery({
    queryKey: ['prestadoresPublicos', categoriaFilter, searchTerm],
    queryFn: () => fetchPrestadores(categoriaFilter, searchTerm),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters(categoriaFilter, searchTerm);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      
      {/* --- HERO SECTION --- */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/30 via-slate-950 to-slate-950 z-0" />
        
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            Encuentra Expertos
          </h1>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Conectamos tus necesidades con profesionales calificados y verificados en tu zona.
          </p>

          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
              <Input 
                type="text" 
                placeholder="¿Qué servicio buscas? (Ej: Gasfiteria)" 
                className="pl-10 bg-slate-900/80 border-slate-700 h-12 text-lg focus:ring-cyan-500 placeholder:text-slate-600 text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button type="submit" className="h-12 px-8 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-lg transition-all hover:scale-105">
              Buscar
            </Button>
          </form>
        </div>
      </section>

      {/* --- LISTADO --- */}
      <main className="max-w-7xl mx-auto px-4 pb-20">
        
        {/* Filtros de Categoría */}
        <div className="flex flex-col items-center mb-8 gap-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 self-start md:self-center">
            <Briefcase className="text-cyan-400" size={24} />
            {categoriaFilter ? `Resultados: ${categoriaFilter}` : 'Todos los Profesionales'}
          </h2>
          
          {/* Botones de Categoría (Wrap para que bajen si son muchos) */}
          <div className="flex gap-2 flex-wrap justify-center">
            <Button 
                variant="outline" 
                size="sm" 
                onClick={() => updateFilters(null, '')} 
                className={!categoriaFilter ? 'bg-cyan-950 border-cyan-500 text-cyan-400' : 'bg-transparent text-slate-400 border-slate-700 hover:border-slate-500'}
            >
              Todos
            </Button>
            
            {CATEGORIAS_POPULARES.map((cat) => (
              <Button 
                key={cat}
                variant="outline" 
                size="sm" 
                onClick={() => updateFilters(cat, '')} 
                className={categoriaFilter === cat ? 'bg-cyan-950 border-cyan-500 text-cyan-400' : 'bg-transparent text-slate-400 border-slate-700 hover:border-slate-500'}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-900/20 border border-red-800 text-red-200 p-6 rounded-lg text-center">
            <p>Ocurrió un error al cargar los profesionales. Intenta recargar la página.</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && prestadores?.length === 0 && (
          <div className="text-center py-20 bg-slate-900/30 rounded-xl border border-slate-800">
            <p className="text-slate-400 text-lg">No se encontraron profesionales en esta categoría.</p>
            <Button variant="link" onClick={() => updateFilters(null, '')} className="mt-4 text-cyan-400">
              Ver todos los profesionales
            </Button>
          </div>
        )}

        {/* Grid de Tarjetas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prestadores?.map((prestador, index) => {
            const idSeguro = prestador.id || prestador.id_usuario || `temp-${index}`;
            const oficioPrincipal = prestador.oficios?.[0] || 'General';
            
            return (
              <PrestadorCard 
                key={idSeguro.toString()}
                id={idSeguro.toString()}
                nombres={prestador.nombres}
                primer_apellido={prestador.primer_apellido}
                fotoUrl={prestador.foto_url || ''}
                oficio={oficioPrincipal}
                resumen={prestador.resumen || `Profesional experto en ${oficioPrincipal}.`}
                puntuacion={prestador.puntuacion_promedio || 0}
              />
            );
          })}
        </div>

      </main>
    </div>
  );
}