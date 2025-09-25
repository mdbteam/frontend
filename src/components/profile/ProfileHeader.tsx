// src/components/profile/ProfileHeader.tsx

import { Badge, Button } from 'flowbite-react';
import React from 'react';

// La interfaz de props no cambia
interface ProfileHeaderProps {
  readonly nombre: string;
  readonly oficio: string;
  readonly fotoUrl: string;
  readonly descripcion: string;
  readonly estaVerificado: boolean;
}

function ProfileHeader({ nombre, oficio, fotoUrl, descripcion, estaVerificado }: ProfileHeaderProps) {
  return (
    // Usamos un 'div' en lugar de 'Card' para tener control total del diseño.
    <div className="w-full overflow-hidden rounded-lg bg-white shadow-md">
      
      {/* 1. Banner Superior */}
      <div className="h-32 w-full bg-slate-200">
        {/* En el futuro, aquí podrías colocar una imagen de banner */}
      </div>

      <div className="p-4 sm:p-6">
        {/* 2. Contenido Principal (Foto y Botón) */}
        {/* 'flex-col sm:flex-row' hace que el layout cambie en pantallas pequeñas */}
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
          
          {/* Foto de perfil superpuesta */}
          <div className="flex items-end">
            <img
              className="-mt-16 h-28 w-28 rounded-full border-4 border-white object-cover shadow-lg"
              src={fotoUrl}
              alt={`Foto de perfil de ${nombre}`}
            />
            {/* Información del Usuario (movida aquí para mejor alineación en móvil) */}
            <div className="ml-4">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-800">{nombre}</h1>
                {estaVerificado && (
                  // Usamos el componente Badge de Flowbite para consistencia
                  <Badge color="success" size="sm">
                    Verificado
                  </Badge>
                )}
              </div>
              <p className="text-md text-slate-500">{oficio}</p>
            </div>
          </div>
          
          {/* Botón de acción */}
          <div className="w-full sm:w-auto">
            <Button color="info" className="w-full sm:w-auto">
              Contactar
            </Button>
          </div>
        </div>

        {/* 4. Descripción / Biografía */}
        <p className="mt-4 text-sm text-slate-600">
          {descripcion}
        </p>
      </div>
    </div>
  );
}

export default ProfileHeader;