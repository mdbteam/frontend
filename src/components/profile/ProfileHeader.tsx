import { FaUserCircle } from 'react-icons/fa'; 

interface ProfileHeaderProps {
  readonly nombres: string;
  readonly primer_apellido: string;
  readonly oficio: string;
  readonly fotoUrl: string | null;
  readonly resumen: string | null; 
  readonly estaVerificado: boolean;
}

function VerificationBadge() {
    return (
        <span className="bg-green-500/20 text-green-300 text-xs font-medium px-2.5 py-0.5 rounded-full border border-green-500/50">
            ✔ Verificado
        </span>
    );
}

export function ProfileHeader({ nombres, primer_apellido, oficio, fotoUrl, resumen, estaVerificado }: ProfileHeaderProps) {
  const nombreCompleto = `${nombres} ${primer_apellido}`;

  return (
    <div className="w-full overflow-hidden rounded-lg bg-slate-800/50 border border-slate-700 backdrop-blur-sm">
      <div className="h-32 w-full bg-cover bg-center" style={{ backgroundImage: "url('/assets/bg.jpeg')" }}></div>
      <div className="p-4 sm:p-6">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end">
            
            {fotoUrl ? (
              <img
                className="-mt-20 h-28 w-28 flex-shrink-0 rounded-full border-4 border-slate-800 bg-slate-700 shadow-lg object-cover object-top"
                src={fotoUrl}
                alt={`Foto de perfil de ${nombreCompleto}`}
              />
            ) : (
              <FaUserCircle className="-mt-20 h-28 w-28 flex-shrink-0 rounded-full border-4 border-slate-800 bg-slate-700 text-slate-500" />
            )}
            
            <div className="ml-4">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white">{nombreCompleto}</h1>
                {estaVerificado && <VerificationBadge />}
              </div>
              <p className="text-md text-slate-400">{oficio}</p>
            </div>
          </div>        
            
        </div>
        <p className="mt-6 text-sm text-slate-300 border-t border-slate-700 pt-4">        
          {resumen || 'El usuario aún no ha agregado un resumen.'}
        </p>
      </div>
    </div>
  );
}