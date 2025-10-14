
import type { ProviderRequest } from '../../data/mockAdminData';
import StatusLabel from './StatusLabel';

interface RequestsTableProps {
  requests: ProviderRequest[];
  onSelectRequest: (request: ProviderRequest) => void;
}

const RequestsTable: React.FC<RequestsTableProps> = ({ requests, onSelectRequest }) => {
  return (
    // SOLUCIÓN: Cambiamos el fondo a uno oscuro y semitransparente.
    <div className="overflow-x-auto bg-slate-800/50 rounded-lg border border-slate-700">
      <table className="min-w-full divide-y divide-slate-700">
        {/* SOLUCIÓN: Adaptamos el encabezado de la tabla al tema oscuro. */}
        <thead className="bg-slate-900/50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Nombre Prestador</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Categoría</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Fecha Solicitud</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Estado</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Acción</th>
          </tr>
        </thead>
        {/* SOLUCIÓN: Adaptamos el cuerpo de la tabla al tema oscuro. */}
        <tbody className="divide-y divide-slate-700">
          {requests.map((request) => (
            <tr key={request.id} className="hover:bg-slate-700/50 transition-colors duration-200">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-slate-100">{request.providerName}</div>
                <div className="text-sm text-slate-400">{request.rut}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{request.serviceCategory}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{request.submissionDate}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusLabel status={request.status} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onSelectRequest(request)}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold"
                >
                  Revisar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RequestsTable;