import { Link } from 'react-router-dom';
import { FaUserCircle, FaStar } from 'react-icons/fa';

interface PrestadorCardProps {
  readonly id: string;
  readonly nombres: string;
  readonly primer_apellido: string;
  readonly fotoUrl?: string | null; // Puede ser opcional o null
  readonly oficio: string;
  readonly resumen: string;
  readonly puntuacion: number;
}

function StarRating({ rating }: { readonly rating: number }) {
  const fullStars = Math.round(rating);
  const emptyStars = 5 - fullStars;
  return (
    <div className="flex items-center text-sm">
      {[...Array(fullStars)].map((_, i) => <span key={`full-${i}`} className="text-yellow-400"><FaStar /></span>)}
      {[...Array(emptyStars)].map((_, i) => <span key={`empty-${i}`} className="text-slate-600"><FaStar /></span>)}
    </div>
  );
}

export function PrestadorCard({ id, nombres, primer_apellido, fotoUrl, oficio, resumen, puntuacion }: PrestadorCardProps) {

  // --- LÓGICA DEFENSIVA ---
  const safeNombre = nombres ? nombres.trim() : "";
  const safeApellido = primer_apellido ? primer_apellido.trim() : "";
  
  // Obtenemos el primer nombre, o "Usuario" si está vacío
  const firstName = safeNombre.split(' ')[0] || "Usuario";
  
  // Construimos el nombre a mostrar. Si todo falla, mostramos "Usuario Chambee"
  const displayName = `${firstName} ${safeApellido}`.trim() || "Usuario Chambee";

  return (
    <div className="bg-slate-800/50 rounded-xl backdrop-blur-sm border border-slate-700 hover:border-yellow-400/50 transition-all duration-300 h-full flex flex-col shadow-lg">
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center space-x-4">
          
          {/* Imagen con Fallback si no hay fotoUrl */}
          <div className="relative flex-shrink-0">
            {fotoUrl ? (
                <>
                    <img 
                        className="h-16 w-16 rounded-full object-cover border-2 border-yellow-400/50" 
                        src={fotoUrl} 
                        alt={`Foto de ${displayName}`}
                    />
                </>
            ) : (
                <div className="h-16 w-16 rounded-full bg-slate-700 border-2 border-slate-600 flex items-center justify-center text-slate-400">
                    <FaUserCircle size={32} />
                </div>
            )}
          </div>

          <div className="flex-1 min-w-0"> {/* min-w-0 ayuda a truncar textos largos */}
            <h3 className="text-lg font-bold text-slate-100 font-poppins truncate" title={displayName}>
              {displayName}
            </h3>
            <p className="text-sm text-cyan-400 font-medium truncate uppercase tracking-wide">
                {oficio || "Oficio no especificado"}
            </p>
            <div className="mt-1 flex items-center">
              <StarRating rating={puntuacion || 0} />
              <span className="text-xs text-slate-400 ml-2 font-mono">
                ({(puntuacion || 0).toFixed(1)})
              </span>
            </div>
          </div>
        </div>

        <p className="mt-4 text-slate-300 text-sm flex-1 leading-relaxed line-clamp-3">
          {resumen || "Este prestador aún no ha agregado una descripción."}
        </p>

        <div className="mt-6 text-right">
          <Link 
            to={`/prestadores/${id}`} 
            className="inline-block bg-yellow-400 text-slate-900 font-bold py-2 px-4 rounded-lg hover:bg-yellow-300 transition-colors duration-300 text-sm shadow-md hover:shadow-yellow-400/20"
          >
            Ver Perfil
          </Link>
        </div>
      </div>
    </div>
  );
}