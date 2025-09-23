// src/components/profile/ProfileHeader.tsx

import { Button, Card } from 'flowbite-react';

interface ProfileHeaderProps {
  readonly nombre: string;
  readonly oficio: string;
  readonly fotoUrl: string;
  readonly descripcion: string; // <-- Añadimos la descripción
  readonly estaVerificado: boolean;
}

function ProfileHeader({ nombre, oficio, fotoUrl, descripcion, estaVerificado }: ProfileHeaderProps) {
  return (
    <Card className="w-full p-0"> {/* p-0 para controlar el padding nosotros */}
      {/* 1. Banner Superior */}
      <div className="h-32 w-full bg-slate-200 rounded-t-lg">
        {/* Aquí podrías poner una imagen de banner en el futuro */}
      </div>

      <div className="px-6 pb-6">
        {/* 2. Contenido Principal */}
        <div className="flex items-end justify-between -mt-16">
          {/* Foto de perfil superpuesta */}
          <img
            className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-lg"
            src={fotoUrl}
            alt={`Foto de ${nombre}`}
          />
          {/* Botón de acción */}
          <Button color="info">
            Contactar
          </Button>
        </div>

        {/* 3. Información del Usuario */}
        <div className="mt-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-800">{nombre}</h1>
            {estaVerificado && (
              <span className="bg-sky-100 text-sky-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                Verificado ✓
              </span>
            )}
          </div>
          <p className="text-md text-slate-500">{oficio}</p>
        </div>

        {/* 4. Descripción / Biografía */}
        <p className="mt-4 text-sm text-slate-600">
          {descripcion}
        </p>
      </div>
    </Card>
  );
}

export default ProfileHeader;