import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
// --- 1. Importar Iconos ---
import { FaSearch, FaTimesCircle } from 'react-icons/fa';

// (Asumo que importas tu PrestadorCard desde aquí)
// import { PrestadorCard } from '../components/prestadores/PrestadorCard'; 

// --- (La interfaz no cambia) ---
interface Prestador {
  id: string;
  nombres: string;
  primer_apellido: string;
  foto_url?: string;
  descripcion_corta?: string;
  categoria: string;
  comuna: string;
  calificacion_promedio: number;
}

export default function PrestadorListPage() {
  const [allPrestadores, setAllPrestadores] = useState<Prestador[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- 2. Estados Separados para Filtros y Búsqueda ---
  const [searchTerm, setSearchTerm] = useState(''); // Para la barra de búsqueda
  const [filters, setFilters] = useState({
    categoria: '', // '' significa "Todos"
    comuna: '',     // '' significa "Todos"
  });

  // (El useEffect para cargar datos no cambia)
  useEffect(() => {
    const fetchAllPrestadores = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get('/api/prestadores');
        setAllPrestadores(response.data || []); 
      } catch (err) {
        console.error("Error cargando prestadores:", err);
        setError("No se pudieron cargar los agentes. Intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllPrestadores();
  }, []); 

  // (useMemo para opciones únicas no cambia)
  const uniqueCategories = useMemo(() => {
    const categories = allPrestadores.map(p => p.categoria);
    return [...new Set(categories)].sort(); 
  }, [allPrestadores]);

  const uniqueComunas = useMemo(() => {
    const comunas = allPrestadores.map(p => p.comuna);
    return [...new Set(comunas)].sort();
  }, [allPrestadores]);

  // --- 3. Lógica de Filtro Combinada (Búsqueda + Filtros) ---
  const filteredPrestadores = useMemo(() => {
    const lowerCaseSearch = searchTerm.toLowerCase();

    return allPrestadores.filter(prestador => {
      // Filtro 1: Dropdown de Categoría
      if (filters.categoria && prestador.categoria !== filters.categoria) {
        return false;
      }
      // Filtro 2: Dropdown de Comuna
      if (filters.comuna && prestador.comuna !== filters.comuna) {
        return false;
      }
      
      // Filtro 3: Barra de Búsqueda (si no está vacía)
      if (lowerCaseSearch) {
        const fullName = `${prestador.nombres} ${prestador.primer_apellido}`.toLowerCase();
        const category = prestador.categoria.toLowerCase();
        // (Opcional: puedes añadir más campos a la búsqueda, como descripcion_corta)
        
        // Si ninguno de los campos incluye el término de búsqueda, lo descartamos
        if (
          !fullName.includes(lowerCaseSearch) &&
          !category.includes(lowerCaseSearch)
        ) {
          return false;
        }
      }

      // Si pasa todos los filtros, lo incluimos
      return true;
    });
  }, [allPrestadores, filters, searchTerm]); // Ahora depende de los 3

  // --- 4. Nuevos Handlers ---
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  // Handler para la barra de búsqueda
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handler para el botón de limpiar (BUENA UX)
  const clearFilters = () => {
    setSearchTerm('');
    setFilters({ categoria: '', comuna: '' });
  };

  // --- 5. Renderizado (JSX Actualizado) ---
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-white font-poppins mb-8 text-center [text-shadow:0_0_15px_rgba(34,211,238,0.4)]">
        Buscar Agentes
      </h1>

      {/* --- BARRA DE FILTROS MEJORADA --- */}
      <div className="mb-8 p-4 bg-slate-800/50 border border-slate-700 rounded-lg space-y-4">
        
        {/* Fila 1: Búsqueda */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-slate-300 mb-1">
            Buscar por nombre o categoría
          </label>
          <div className="relative">
            <input
              type="text"
              id="search"
              name="search"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Ej: Juan Pérez, Plomería..."
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 pl-10 text-base text-white focus:border-cyan-400 focus:ring-cyan-400"
            />
            {/* Icono de Lupa */}
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          </div>
        </div>
        
        {/* Fila 2: Filtros y Reset */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* Categoría */}
          <div>
            <label htmlFor="categoria" className="block text-sm font-medium text-slate-300 mb-1">
              Categoría
            </label>
            <select
              id="categoria"
              name="categoria"
              value={filters.categoria}
              onChange={handleFilterChange}
              className="w-full h-[46px] rounded-lg border border-slate-700 bg-slate-800 p-3 text-base text-white focus:border-cyan-400 focus:ring-cyan-400"
            >
              <option value="">Todas</option>
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Comuna */}
          <div>
            <label htmlFor="comuna" className="block text-sm font-medium text-slate-300 mb-1">
              Comuna
            </label>
            <select
              id="comuna"
              name="comuna"
              value={filters.comuna}
              onChange={handleFilterChange}
              className="w-full h-[46px] rounded-lg border border-slate-700 bg-slate-800 p-3 text-base text-white focus:border-cyan-400 focus:ring-cyan-400"
            >
              <option value="">Todas</option>
              {uniqueComunas.map(com => (
                <option key={com} value={com}>{com}</option>
              ))}
            </select>
          </div>

          {/* Botón de Limpiar (UX) */}
          <div className="sm:col-span-2 md:col-span-1">
            {/* Label fantasma para alinear verticalmente */}
            <label className="block text-sm font-medium text-slate-300 mb-1 opacity-0">
              Limpiar
            </label>
            <button
              onClick={clearFilters}
              className="w-full h-[46px] flex items-center justify-center gap-2 rounded-lg border border-slate-600 bg-slate-700/50 p-3 text-base text-slate-300 hover:bg-slate-700 hover:border-slate-500 transition-colors"
            >
              <FaTimesCircle />
              <span>Limpiar Filtros</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* --- RESULTADOS --- */}
      {loading && (
        <p className="text-center text-cyan-400">Cargando agentes...</p>
      )}

      {error && (
        <p className="text-center text-red-400">{error}</p>
      )}

      {!loading && !error && (
        <>
          {filteredPrestadores.length > 0 ? (
            <>
              <p className="text-sm text-slate-400 mb-4">
                Mostrando {filteredPrestadores.length} de {allPrestadores.length} agentes.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
                <p className="text-slate-400 col-span-full">
                  (Aquí irían tus `PrestadorCard`. Descomenta la línea de arriba.)
                </p>
              </div>
            </>
          ) : (
            <p className="text-center text-slate-400 text-lg p-8 bg-slate-800/50 rounded-lg">
              No se encontraron agentes que coincidan con tu búsqueda.
            </p>
          )}
        </>
      )}
    </div>
  );
}