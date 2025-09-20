// src/components/profile/ReviewCard.tsx

import React from 'react';

// Props que necesita la tarjeta de reseña
interface ReviewCardProps {
  autor: string;
  puntuacion: number;
  comentario: string;
}

function ReviewCard({ autor, puntuacion, comentario }: ReviewCardProps) {
  return (
    <div className="border-t border-gray-200 pt-4">
      <div className="flex items-center mb-1">
        <p className="font-bold text-gray-800 mr-2">{autor}</p>
        <div className="text-yellow-500 flex items-center">
          <span>{'★'.repeat(puntuacion)}</span>
          <span className="text-gray-300">{'★'.repeat(5 - puntuacion)}</span>
        </div>
      </div>
      <p className="text-gray-600 italic">"{comentario}"</p>
    </div>
  );
}

export default ReviewCard;