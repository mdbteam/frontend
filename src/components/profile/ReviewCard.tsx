
import { FaUserCircle } from 'react-icons/fa';


function StarRating({ rating }: { readonly rating: number }) {
    const fullStars = Math.round(rating);
    const emptyStars = 5 - fullStars;
    return (
        <div className="flex items-center">
            {[...Array(fullStars)].map((_, i) => <span key={`full-${i}`} className="text-yellow-400">★</span>)}
            {[...Array(emptyStars)].map((_, i) => <span key={`empty-${i}`} className="text-slate-600">★</span>)}
        </div>
    );
}

interface ReviewCardProps {
  readonly autor: string;
  readonly puntuacion: number;
  readonly comentario: string;
  readonly fotoUrl?: string;
}

export function ReviewCard({ autor, puntuacion, comentario, fotoUrl }: ReviewCardProps) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-6 relative">
      <div className="absolute top-4 left-5 text-6xl text-slate-700 font-serif opacity-50">
        “
      </div>
      
      <p className="relative z-10 text-slate-300 italic h-24 overflow-hidden">
        {comentario}
      </p>

      <div className="mt-4 flex items-center pt-4 border-t border-slate-700">
       
        {fotoUrl ? (
          <img 
            src={fotoUrl} 
            alt={`Foto de ${autor}`} 
            className="h-10 w-10 rounded-full object-cover" 
          />
        ) : (
          <FaUserCircle className="h-10 w-10 text-slate-500" />
        )}
        <div className="ml-4">
          <p className="font-bold text-slate-200">{autor}</p>
          <StarRating rating={puntuacion} />
        </div>
      </div>
    </div>
  );
}