import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { FaSpinner } from 'react-icons/fa';

interface Categoria {
  id: string;
  nombre: string;
  slug: string;
  icono?: string; 
}

const fetchCategorias = async () => {
  const { data } = await axios.get<Categoria[]>('/api/categorias');
  return data;
};

const iconMap: Record<string, string> = {
  gasfiteria: '🔧',
  electricidad: '💡',
  carpinteria: '🪚',
  pintura: '🎨',
  jardineria: '🌿',
  limpieza: '🧼',
  otros: '🚚',
};

export function FeaturedCategories() {
  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['categorias'],
    queryFn: fetchCategorias,
  });

  return (
    <section className="bg-slate-800 py-8 lg:py-16">
      <div className="mx-auto max-w-screen-xl px-4">
        <h2 className="mb-8 text-center text-3xl font-extrabold text-white">
          Explora por Categoría
        </h2>
        
        {isLoading && (
          <div className="flex justify-center text-cyan-400">
            <FaSpinner className="animate-spin text-3xl" />
          </div>
        )}
        {error && (
          <div className="text-center text-red-400">
            No se pudieron cargar las categorías.
          </div>
        )}
        {categories && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-7">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/prestadores?categoria=${category.slug}`}
                className="block rounded-lg border border-slate-700 bg-slate-900 p-6 text-center shadow-lg transition-transform hover:-translate-y-1 hover:shadow-cyan-500/20"
              >
                <div className="text-4xl">{category.icono || iconMap[category.slug] || '💼'}</div>
                <h3 className="mt-2 font-semibold text-slate-200">{category.nombre}</h3>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}