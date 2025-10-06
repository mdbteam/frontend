import React from 'react';
import type { ProviderRequest } from '../../data/mockAdminData';

const VerificationChecklist = () => (
  <div className="space-y-3">
    <h4 className="text-md font-semibold text-gray-800">Checklist de Verificación</h4>
    <ul className="space-y-2 text-sm text-gray-600">
      <li className="flex items-center"><span className="mr-2 h-4 w-4 border border-gray-400 rounded"></span>Foto de perfil adecuada.</li>
      <li className="flex items-center"><span className="mr-2 h-4 w-4 border border-gray-400 rounded"></span>Descripción de servicios clara.</li>
      <li className="flex items-center"><span className="mr-2 h-4 w-4 border border-gray-400 rounded"></span>Portafolio apropiado.</li>
      <li className="flex items-center"><span className="mr-2 h-4 w-4 border border-gray-400 rounded"></span>Documentación válida (simulado).</li>
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
    <div className="bg-gray-50 p-6 rounded-lg shadow-md space-y-6 sticky top-6">
      <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Panel de Acción</h3>
      
      <VerificationChecklist />

      <div>
        <h4 className="text-md font-semibold text-gray-800">Notas Internas</h4>
        <textarea
          rows={4}
          className="w-full mt-2 p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Añadir comentarios para el equipo..."
        ></textarea>
      </div>

      <div className="space-y-3">
        <h4 className="text-md font-semibold text-gray-800">Decisión Final</h4>
        <button
          onClick={() => onApprove(request.id)}
          className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
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
          className="w-full bg-yellow-500 text-white font-bold py-2 px-4 rounded-md hover:bg-yellow-600 transition-colors"
        >
          Solicitar Modificaciones
        </button>
      </div>
    </div>
  );
};

export default ActionPanel;