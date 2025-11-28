import { FaUserCircle, FaStar, FaQuoteLeft } from 'react-icons/fa';

// Componente interno para las estrellas
function StarRating({ rating }: { readonly rating: number }) {
    // Aseguramos que el rating esté entre 0 y 5
    const clampedRating = Math.max(0, Math.min(5, Math.round(rating)));
    
    return (
        <div className="flex items-center gap-0.5" aria-label={`Calificación: ${clampedRating} de 5 estrellas`}>
            {[...Array(5)].map((_, i) => (
                <FaStar 
                    key={i} 
                    className={`text-sm ${i < clampedRating ? 'text-amber-400' : 'text-slate-600'}`} 
                />
            ))}
        </div>
    );
}

interface ReviewCardProps {
  readonly autor: string;
  readonly puntuacion: number;
  readonly comentario: string;
  readonly fotoUrl?: string | null; // Aceptamos null también
  readonly fecha?: string; // Nueva prop opcional
}

export function ReviewCard({ autor, puntuacion, comentario, fotoUrl, fecha }: ReviewCardProps) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 relative flex flex-col h-full hover:border-slate-600 transition-colors shadow-lg">
      
      {/* Icono decorativo de cita */}
      <div className="absolute top-4 left-4 text-slate-700/50">
        <FaQuoteLeft size={24} />
      </div>
      
      {/* Contenido del comentario */}
      <div className="relative z-10 mb-6 flex-grow pl-4">
        <p className="text-slate-300 italic text-sm leading-relaxed">
          "{comentario}"
        </p>
      </div>

      {/* Footer de la tarjeta */}
      <div className="mt-auto flex items-center pt-4 border-t border-slate-700/50">
        
        {/* Avatar */}
        <div className="flex-shrink-0">
            {fotoUrl ? (
            <img 
                src={fotoUrl} 
                alt={`Foto de ${autor}`} 
                className="h-10 w-10 rounded-full object-cover border border-slate-600" 
            />
            ) : (
            <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-400">
                <FaUserCircle size={24} />
            </div>
            )}
        </div>

        {/* Info Autor */}
        <div className="ml-3">
          <p className="font-bold text-slate-100 text-sm">{autor}</p>
          <div className="flex items-center gap-2">
            <StarRating rating={puntuacion} />
            {fecha && (
                <>
                    <span className="text-slate-600 text-xs">•</span>
                    <span className="text-slate-500 text-xs">{fecha}</span>
                </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}