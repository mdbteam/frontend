// src/components/prestadores/PrestadorCard.tsx

import { Button, Card } from 'flowbite-react';
import { Link } from 'react-router-dom';

interface PrestadorCardProps {
  // ... (la interfaz no cambia)
  readonly id: string;
  readonly nombre: string;
  readonly fotoUrl: string;
  readonly oficio: string;
  readonly resumen: string;
  readonly puntuacion: number;
}

function StarRating({ rating }: { readonly rating: number }) {
  // ... (el componente de estrellas no cambia)
  const fullStars = Math.round(rating);
  const emptyStars = 5 - fullStars;
  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <span key={`full-${i}`} className="text-amber-400">★</span>
      ))}
      {[...Array(emptyStars)].map((_, i) => (
        <span key={`empty-${i}`} className="text-gray-300">★</span>
      ))}
      <span className="ml-1.5 text-xs font-medium text-gray-500">{rating.toFixed(1)}</span>
    </div>
  );
}

function PrestadorCard(props: PrestadorCardProps) {
  return (
    // CAMBIO CLAVE: Envolvemos toda la tarjeta con el componente Link.
    <Link to={`/perfil/${props.id}`} className="block h-full">
      <Card className="flex h-full flex-col transition-shadow duration-300 hover:shadow-xl">
        
        <div className="relative w-full overflow-hidden">
          <div className="aspect-square">
            <img
              className="h-full w-full object-cover object-top"
              src={props.fotoUrl}
              alt={`Foto de perfil de ${props.nombre}`}
            />
          </div>
          <div className="absolute bottom-0 h-1/3 w-full bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>

        <div className="flex flex-col p-4 flex-grow">
          <div className="flex items-start justify-between">
            <h5 className="text-lg font-bold leading-tight text-gray-900">
              {props.nombre}
            </h5>
            <StarRating rating={props.puntuacion} />
          </div>

          <p className="mt-1 inline-block self-start rounded-full bg-cyan-100 px-2 py-1 text-xs font-semibold text-cyan-800">
            {props.oficio}
          </p>

          <p className="mt-2 text-sm text-gray-600">
            {props.resumen}
          </p>
        </div>

        <div className="p-4 pt-0">
          {/* El botón ahora es solo un elemento visual, ya no necesita su propio Link */}
          <Button color="info" className="w-full">
            Ver Perfil
          </Button>
        </div>
      </Card>
    </Link>
  );
}

export default PrestadorCard;