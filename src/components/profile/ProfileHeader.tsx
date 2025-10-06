
import { Badge, Button } from 'flowbite-react';
import React from 'react';

interface ProfileHeaderProps {
  readonly nombre: string;
  readonly oficio: string;
  readonly fotoUrl: string;
  readonly descripcion: string;
  readonly estaVerificado: boolean;
}

function ProfileHeader({ nombre, oficio, fotoUrl, descripcion, estaVerificado }: ProfileHeaderProps) {
  return (
    <div className="w-full overflow-hidden rounded-lg bg-white shadow-md">
      <div className="h-32 w-full bg-slate-200"></div>
      <div className="p-4 sm:p-6">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end">
            <img
              className="-mt-16 h-28 w-28 flex-shrink-0 border-4 border-white bg-slate-100 shadow-lg object-cover clip-chamfer"
              src={fotoUrl}
              alt={`Foto de perfil de ${nombre}`}
            />

            <div className="ml-4">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-800">{nombre}</h1>
                {estaVerificado && (
                  <Badge color="success" size="sm">
                    Verificado
                  </Badge>
                )}
              </div>
              <p className="text-md text-slate-500">{oficio}</p>
            </div>
          </div>
          <div className="w-full sm:w-auto">
            <Button color="info" className="w-full sm:w-auto">
              Contactar
            </Button>
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-600">
          {descripcion}
        </p>
      </div>
    </div>
  );
}

export default ProfileHeader;