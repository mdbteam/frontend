import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Search } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { PrestadorCard } from '../components/prestadores/PrestadorCard';


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
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState<string | null>(null);

  const { data: prestadores, isLoading, error } = useQuery({
    queryKey: ['prestadores', categoriaFilter, searchTerm],
    queryFn: () => fetchPrestadores(categoriaFilter, searchTerm),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      
      {/* Hero Section con Buscador */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/20 to-slate-950 z-0" />
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            Encuentra Expertos
          </h1>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Conectamos tus necesidades con profesionales calificados y verificados.
          </p>

          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
              <Input 
                type="text" 
                placeholder="¿Qué servicio buscas? (Ej: Gasfitería)" 
                className="pl-10 bg-slate-900/80 border-slate-700 h-12 text-lg focus:ring-cyan-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button type="submit" className="h-12 px-8 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-lg">
              Buscar
            </Button>
          </form>
        </div>
      </section>

      {/* Listado */}
      <main className="max-w-7xl mx-auto px-4 pb-20">
        
        {isLoading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-800 text-red-200 p-6 rounded-lg text-center">
            <p>Ocurrió un error al cargar los profesionales.</p>
          </div>
        )}

        {!isLoading && !error && prestadores?.length === 0 && (
          <div className="text-center py-20 bg-slate-900/50 rounded-xl border border-slate-800">
            <p className="text-slate-400 text-lg">No se encontraron resultados para tu búsqueda.</p>
            <Button variant="link" onClick={() => { setSearchTerm(''); setCategoriaFilter(null); }} className="mt-4 text-cyan-400">
              Ver todos
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prestadores?.map((prestador, index) => {
            // 🛡️ LÓGICA DE PROTECCIÓN (Aquí estaba el error)
            // Buscamos 'id', si no existe 'id_usuario', y si no el índice.
            const idSeguro = prestador.id || prestador.id_usuario || `temp-${index}`;
            
            return (
              <PrestadorCard 
                key={idSeguro.toString()} // .toString() ahora es seguro
                id={idSeguro.toString()}
                nombres={prestador.nombres || 'Profesional'}
                primer_apellido={prestador.primer_apellido || ''}
                fotoUrl={prestador.foto_url || 'https://via.placeholder.com/150'}
                oficio={prestador.oficios?.[0] || 'General'}
                resumen={prestador.resumen || `Experto en ${prestador.oficios?.[0] || 'servicios'}`}
                puntuacion={prestador.puntuacion_promedio || 0}
              />
            );
          })}
        </div>

      </main>
    </div>
  );
}