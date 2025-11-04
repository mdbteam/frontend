import { Link } from 'react-router-dom';

interface PrestadorCardProps {
  readonly id: string;
  readonly nombres: string;
  readonly primer_apellido: string;
  readonly fotoUrl: string;
  readonly oficio: string;
  readonly resumen: string;
  readonly puntuacion: number;
}

function StarRating({ rating }: { readonly rating: number }) {
    const fullStars = Math.round(rating);
    const emptyStars = 5 - fullStars;
    return (
        <div className="flex items-center">
            {[...new Array(fullStars)].map((_, i) => <span key={`full-${i}`} className="text-yellow-400">★</span>)}
            {[...new Array(emptyStars)].map((_, i) => <span key={`empty-${i}`} className="text-slate-600">★</span>)}
        </div>
    );
}

export function PrestadorCard({ id, nombres, primer_apellido, fotoUrl, oficio, resumen, puntuacion }: PrestadorCardProps) {

  const displayName = `${nombres.split(' ')[0]} ${primer_apellido}`;

  return (
    <div className="bg-slate-800/50 rounded-lg backdrop-blur-sm border border-slate-700 hover:border-yellow-400/50 transition-colors duration-300 h-full flex flex-col">
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center space-x-5">
          <div className="relative flex-shrink-0">
            <img 
              className="h-20 w-20 object-cover object-top clip-hexagon" 
              src={fotoUrl} 
              alt={`Foto de ${displayName}`}
            />
            <div className="absolute inset-0 clip-hexagon border-2 border-yellow-400 opacity-50"></div>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-100 font-poppins">
              {displayName}
            </h3>
            <p className="text-sm text-cyan-400 font-mono">{oficio}</p>
            <div className="mt-1 flex items-center">
              <StarRating rating={puntuacion} />
              <span className="text-xs text-slate-400 ml-2">({puntuacion.toFixed(1)})</span>
            </div>
          </div>
        </div>
        <p className="mt-4 text-slate-300 text-sm flex-1">
          {resumen}
        </p>
        <div className="mt-6 text-right">
          {/* --- CORRECCIÓN DE LA RUTA --- */}
          <Link 
            to={`/prestadores/${id}`} 
            className="bg-yellow-400 text-slate-900 font-bold py-2 px-4 rounded-md hover:bg-yellow-300 transition-colors duration-300 text-sm"
          >
            Ver Perfil
          </Link>
        </div>
      </div>
    </div>
  );
}