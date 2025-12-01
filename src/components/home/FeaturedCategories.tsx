import { Link } from 'react-router-dom';
import * as React from 'react';

import { 
  FaBolt,           
  FaPaintRoller,   
  FaTree,           
  FaKey,           
  FaTruckMoving,    
  FaCar,          
  FaTrash,          
  FaHammer,        
  FaChair          
} from 'react-icons/fa';

import { 
  GiTap,           
  GiBrickWall,     
  GiVacuumCleaner,  
  GiWashingMachine,
} from 'react-icons/gi';

import { 
  MdRoofing,               
  MdMiscellaneousServices  
} from 'react-icons/md';

interface Categoria {
  id_categoria: number;
  nombre: string;
}

const CATEGORIAS_NOMBRES = [
  "Gasfitería", 
  "Electricidad", 
  "Pintura", 
  "Albañilería", 
  "Carpintería",
  "Muebleria",        
  "Jardinería", 
  "Mecánica", 
  "Retiro de Escombros", 
  "Cerrajería", 
  "Reparación de Electrodomésticos",
  "Flete y mudanza",
  "Servicios de Limpieza", 
  "Techado", 
  "Otros"
];

// lista de objetos
const LOCAL_CATEGORIAS: Categoria[] = CATEGORIAS_NOMBRES.map((nombre, index) => ({
  id_categoria: index + 1,
  nombre: nombre
}));

// Mapeo normalizado (Claves en minúsculas y sin tildes para evitar errores)
const categoryIcons: { [key: string]: React.ElementType } = {
  'gasfiteria': GiTap,
  'electricidad': FaBolt,
  'pintura': FaPaintRoller,
  'albanileria': GiBrickWall,
  'carpinteria': FaHammer,
  'muebleria': FaChair,
  'jardineria': FaTree,
  'mecanica': FaCar,
  'retiro de escombros': FaTrash,
  'cerrajeria': FaKey,
  'reparacion de electrodomesticos': GiWashingMachine,
  'flete y mudanza': FaTruckMoving,
  'servicios de limpieza': GiVacuumCleaner,
  'techado': MdRoofing,
  'otros': MdMiscellaneousServices,
};

const getIcon = (name: string | null | undefined) => {
  if (!name) return MdMiscellaneousServices;
  
  // 1. Convertir a minúsculas
  // 2. Quitar tildes (Normalize NFD + Replace regex)
  const cleanName = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  // Búsqueda directa o fallback
  return categoryIcons[cleanName] || MdMiscellaneousServices;
};

export function FeaturedCategories() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      
      {LOCAL_CATEGORIAS.map((cat) => {
        const IconComponent = getIcon(cat.nombre);
        
        return (
          <Link
            key={cat.id_categoria}
            to={`/prestadores?categoria=${encodeURIComponent(cat.nombre)}`} 
            className="group block text-center p-6 bg-slate-800/50 border border-slate-700 rounded-xl transition-all duration-300 hover:bg-slate-700 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-900/20 hover:-translate-y-1"
          >
            <div className="bg-slate-900/50 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 group-hover:bg-amber-400/10 transition-colors">
                <IconComponent className="h-8 w-8 text-amber-400 transition-transform duration-300 group-hover:scale-110 group-hover:text-amber-300" />
            </div>
            <h3 className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors line-clamp-2">
              {cat.nombre}
            </h3>
          </Link>
        );
      })}
    </div>
  );
}