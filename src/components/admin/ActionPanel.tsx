import type { ProviderRequest } from '../../data/mockAdminData';

// Componente hijo adaptado al tema oscuro
const VerificationChecklist = () => (
  <div className="space-y-3">
    <h4 className="text-md font-semibold text-slate-200">Checklist de Verificación</h4>
    <ul className="space-y-2 text-sm text-slate-400">
      <li className="flex items-center"><span className="mr-2 h-4 w-4 border border-slate-500 rounded bg-slate-700"></span>Foto de perfil adecuada.</li>
      <li className="flex items-center"><span className="mr-2 h-4 w-4 border border-slate-500 rounded bg-slate-700"></span>Descripción de servicios clara.</li>
      <li className="flex items-center"><span className="mr-2 h-4 w-4 border border-slate-500 rounded bg-slate-700"></span>Portafolio apropiado.</li>
      <li className="flex items-center"><span className="mr-2 h-4 w-4 border border-slate-500 rounded bg-slate-700"></span>Documentación válida (simulado).</li>
    </ul>
  </div>
);

interface ActionPanelProps {
  request: ProviderRequest;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const ActionPanel: React.FC<ActionPanelProps> = ({ request, onApprove, onReject }) => {
  return (
    // SOLUCIÓN: Cambiamos el fondo a uno oscuro, añadimos borde y lo hacemos "sticky".
    <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 space-y-6 sticky top-8">
      {/* SOLUCIÓN: Adaptamos los colores del texto y el borde. */}
      <h3 className="text-lg font-bold text-yellow-400 border-b border-slate-700 pb-2">Panel de Acción</h3>
      
      <VerificationChecklist />

      <div>
        <h4 className="text-md font-semibold text-slate-200">Notas Internas</h4>
        {/* SOLUCIÓN: Adaptamos el estilo del textarea al tema oscuro. */}
        <textarea
          rows={4}
          className="w-full mt-2 p-2 bg-slate-900 border border-slate-700 rounded-md focus:ring-cyan-500 focus:border-cyan-500 text-slate-200"
          placeholder="Añadir comentarios para el equipo..."
        ></textarea>
      </div>

      <div className="space-y-3">
        <h4 className="text-md font-semibold text-slate-200">Decisión Final</h4>
        {/* SOLUCIÓN: Ajustamos los colores de los botones para mejor contraste. */}
        <button
          onClick={() => onApprove(request.id)}
          className="w-full bg-emerald-600 text-white font-bold py-2 px-4 rounded-md hover:bg-emerald-700 transition-colors"
        >
          Aprobar Perfil
        </button>
        <button
          onClick={() => onReject(request.id)}
          className="w-full bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
        >
          Rechazar Perfil
        </button>
        <button
          className="w-full bg-amber-500 text-white font-bold py-2 px-4 rounded-md hover:bg-amber-600 transition-colors"
        >
          Solicitar Modificaciones
        </button>
      </div>
    </div>
  );
};

export default ActionPanel;