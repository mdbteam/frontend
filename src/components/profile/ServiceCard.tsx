
import { Button } from 'flowbite-react';

interface ServiceCardProps {
  readonly nombre: string;
  readonly precioEstimado: string; 
}

export function ServiceCard({ nombre, precioEstimado }: ServiceCardProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50">
      <div>
        <h3 className="font-semibold text-gray-800">{nombre}</h3>
        <p className="text-sm text-gray-500">Precio estimado: {precioEstimado}</p>
      </div>
      <Button size="sm" color="info">
        Solicitar
      </Button>
    </div>
  );
}

