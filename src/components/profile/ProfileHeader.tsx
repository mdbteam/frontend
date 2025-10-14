import { Link } from 'react-router-dom';

interface ProfileHeaderProps {
  readonly nombres: string;
  readonly primer_apellido: string;
  readonly oficio: string;
  readonly fotoUrl: string;
  readonly resumen: string;
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
      <div className="h-32 w-full bg-cover bg-center" style={{ backgroundImage: "url('/assets/images/circuit-board.svg')" }}></div>
      <div className="p-4 sm:p-6">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end">
            <img
              className="-mt-20 h-28 w-28 flex-shrink-0 rounded-full border-4 border-slate-800 bg-slate-700 shadow-lg object-cover"
              src={fotoUrl}
              alt={`Foto de perfil de ${nombreCompleto}`}
            />
            <div className="ml-4">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white">{nombreCompleto}</h1>
                {estaVerificado && <VerificationBadge />}
              </div>
              <p className="text-md text-slate-400">{oficio}</p>
            </div>
          </div>
          <div className="w-full sm:w-auto">
            <Link 
              to="#"
              className="w-full sm:w-auto inline-block text-center bg-cyan-500 text-white px-6 py-2 rounded-md font-medium hover:bg-cyan-400 transition-colors"
            >
              Contactar
            </Link>
          </div>
        </div>
        <p className="mt-6 text-sm text-slate-300 border-t border-slate-700 pt-4">
          {resumen}
        </p>
      </div>
    </div>
  );
}