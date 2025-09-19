import React from 'react';
import { Button } from 'flowbite-react';

interface ProfileHeaderProps {
  nombre: string;
  oficio: string;
  fotoUrl: string;
  puntuacion: number;
  estaVerificado: boolean;
}

function ProfileHeader({ nombre, oficio, fotoUrl, puntuacion, estaVerificado }: ProfileHeaderProps) {
  return (
    <div className="relative">
      {/* Banner decorativo de fondo */}
      <div className="h-24 bg-slate-200 rounded-t-lg"></div>

      <div className="px-6 pb-6">
        {/* Contenedor de la foto de perfil para posicionarla */}
        <div className="relative -mt-16 flex justify-center sm:justify-start">
          <img
            className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md"
            src={fotoUrl}
            alt={`Foto de ${nombre}`}
          />
        </div>

        {/* Contenido del perfil */}
        <div className="pt-4 flex flex-col sm:flex-row justify-between items-center">
          <div className="text-center sm:text-left">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-800">{nombre}</h1>
              {estaVerificado && (
                <span className="bg-sky-100 text-sky-800 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M16.403 12.652a3 3 0 00-2.83-2.176l-.005-.002a3 3 0 00-2.176-2.83l-.002-.005a3 3 0 00-5.187-.872l-.005.002a3 3 0 00-2.83 2.176l-.005.002a3 3 0 00-2.176 2.83l-.002.005a3 3 0 00.872 5.187l.002.005a3 3 0 002.176 2.83l.005.002a3 3 0 002.83 2.176l.005.002a3 3 0 002.176-2.83l.002-.005a3 3 0 005.187.872l.005-.002a3 3 0 002.83-2.176l.005-.002a3 3 0 002.176-2.83l.002-.005a3 3 0 00-.872-5.187l-.002-.005zM10 2.5a.75.75 0 01.75.75v.01a.75.75 0 01-1.5 0V3.25A.75.75 0 0110 2.5zM5.5 5.5a.75.75 0 01.75-.75h.01a.75.75 0 010 1.5H6.25a.75.75 0 01-.75-.75zM14.5 5.5a.75.75 0 01.75-.75h.01a.75.75 0 010 1.5H15.25a.75.75 0 01-.75-.75zM10 17.5a.75.75 0 01-.75-.75v-.01a.75.75 0 011.5 0v.01a.75.75 0 01-.75.75zM5.5 14.5a.75.75 0 01.75-.75h.01a.75.75 0 010 1.5H6.25a.75.75 0 01-.75-.75zM14.5 14.5a.75.75 0 01.75-.75h.01a.75.75 0 010 1.5H15.25a.75.75 0 01-.75-.75z" clipRule="evenodd" /></svg>
                  Verificado
                </span>
              )}
            </div>
            <p className="text-md text-slate-500">{oficio}</p>
            <div className="mt-2 text-amber-500 flex items-center">
              <span className="text-lg font-bold mr-1">{puntuacion}</span>
              <span>{'★'.repeat(Math.round(puntuacion))}</span>
              <span className="text-slate-300">{'★'.repeat(5 - Math.round(puntuacion))}</span>
            </div>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button color="info">
              Contactar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ProfileHeader;