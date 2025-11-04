import { Link } from 'react-router-dom';
import { FaPaintBrush, FaTree, FaBolt, FaWrench } from 'react-icons/fa';
import { GiVacuumCleaner, GiTap } from 'react-icons/gi'; 
import { MdRoofing, MdMiscellaneousServices } from 'react-icons/md';
import { BsTools, BsSoundwave } from 'react-icons/bs';
import * as React from 'react';

// Esta es la ESTRUCTURA INTERNA que usa nuestro componente
interface Categoria {
  id_categoria: number;
  nombre: string | null;
}

// 1. Usamos la lista de nombres que me diste
const CATEGORIAS_NOMBRES = [
  "Gasfitería", "Electricidad", "Pintura", "Albañilería", "Carpintería",
  "Jardinería", "Mecánica", "Plomería", "Cerrajería", 
  "Reparación de Electrodomésticos",
  "Instalación de Aire Acondicionado",
  "Servicios de Limpieza", "Techado", "Otro"
];

// 2. La convertimos al formato de objeto que necesita el componente
const LOCAL_CATEGORIAS: Categoria[] = CATEGORIAS_NOMBRES.map((nombre, index) => ({
  id_categoria: index + 1,
  nombre: nombre
}));

// 3. El mapa de íconos completo
const categoryIcons: { [key: string]: React.ElementType } = {
  'default': MdMiscellaneousServices,
  'gasfitería': GiTap,
  'electricidad': FaBolt,
  'pintura': FaPaintBrush,
  'albañilería': FaWrench,
  'carpintería': BsTools,
  'jardinería': FaTree,
  'mecánica': FaWrench,
  'plomería': GiTap,
  'cerrajería': BsTools,
  'reparación': BsSoundwave,
  'instalación': FaWrench,
  'servicios': GiVacuumCleaner,
  'techado': MdRoofing,
  'otro': MdMiscellaneousServices,
};

const getIcon = (name: string | null | undefined) => {
  if (!name) return categoryIcons['default'];
  const key = name.toLowerCase().split(' ')[0];
  return categoryIcons[key] || categoryIcons['default'];
};

// 4. ELIMINAMOS 'useQuery', 'axios' y 'fetchCategorias'.
// Usamos la lista local directamente.
export function FeaturedCategories() {
  
  // Usamos la lista local, sin API.
  const categoriasAMostrar = LOCAL_CATEGORIAS;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
      
      {categoriasAMostrar
        .filter(cat => cat && cat.nombre) 
        .slice(0, 14) 
        .map((cat) => {
          const nombreCat = cat.nombre as string; 
          const IconComponent = getIcon(nombreCat);
          
          return (
            <Link
              key={cat.id_categoria}
              to={`/prestadores?oficio=${encodeURIComponent(nombreCat)}`}
              className="group block text-center p-6 bg-slate-800/50 border border-slate-700 rounded-lg transition-all duration-300 hover:bg-slate-700 hover:border-amber-400"
            >
              <IconComponent className="h-10 w-10 text-amber-400 mx-auto transition-transform group-hover:scale-110" />
              <h3 className="mt-4 text-sm font-semibold text-white truncate">
                {nombreCat}
              </h3>
            </Link>
          );
        })}
    </div>
  );
}