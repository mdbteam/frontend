import React from 'react';
import { Link } from 'react-router-dom';


interface PrestadorCardProps {
  readonly id: string;
  readonly nombre: string;
  readonly fotoUrl: string;
  readonly oficio: string;
  readonly resumen: string;
  readonly puntuacion: number;
}

// Componente de Estrellas con la lógica corregida.
function StarRating({ rating }: { readonly rating: number }) {
    // SOLUCIÓN: Se añade la lógica faltante para calcular las estrellas.
    // Esto soluciona "rating no se usa" y "no se encuentra fullStars".
    const fullStars = Math.round(rating);
    const emptyStars = 5 - fullStars;

    return (
        <div className="flex items-center">
            {[...Array(fullStars)].map((_, i) => <span key={`full-${i}`} className="text-yellow-400">★</span>)}
            {[...Array(emptyStars)].map((_, i) => <span key={`empty-${i}`} className="text-slate-600">★</span>)}
        </div>
    );
}

export function PrestadorCard({ id, nombre, fotoUrl, oficio, resumen, puntuacion }: PrestadorCardProps) {
  return (
    <div className="bg-slate-800/50 rounded-lg backdrop-blur-sm border border-slate-700 hover:border-yellow-400/50 transition-colors duration-300">
      <div className="p-6">
        <div className="flex items-center space-x-5">
          <div className="relative flex-shrink-0">
            <img 
              className="h-20 w-20 object-cover clip-hexagon" 
              src={fotoUrl} 
              alt={`Foto de ${nombre}`}
            />
            <div className="absolute inset-0 clip-hexagon border-2 border-yellow-400 opacity-50"></div>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-100 font-poppins">
              {nombre}
            </h3>
            <p className="text-sm text-cyan-400 font-mono">{oficio}</p>
            <div className="mt-1 flex items-center">
              <StarRating rating={puntuacion} />
              <span className="text-xs text-slate-400 ml-2">({puntuacion})</span>
            </div>
          </div>
        </div>
        <p className="mt-4 text-slate-300 text-sm h-10 overflow-hidden">
          {resumen}
        </p>
        <div className="mt-6 text-right">
          <Link 
            to={`/perfil/${id}`} 
            className="bg-yellow-400 text-slate-900 font-bold py-2 px-4 rounded-md hover:bg-yellow-300 transition-colors duration-300 text-sm"
          >
            Ver Perfil
          </Link>
        </div>
      </div>
    </div>
  );
}