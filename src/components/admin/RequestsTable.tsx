import React from 'react';
import type { ProviderRequest } from '../../data/mockAdminData';
import StatusLabel from './StatusLabel';

interface RequestsTableProps {
  requests: ProviderRequest[];
  onSelectRequest: (request: ProviderRequest) => void;
}

const RequestsTable: React.FC<RequestsTableProps> = ({ requests, onSelectRequest }) => {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre Prestador</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Solicitud</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {requests.map((request) => (
            <tr key={request.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{request.providerName}</div>
                <div className="text-sm text-gray-500">{request.rut}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.serviceCategory}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.submissionDate}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusLabel status={request.status} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onSelectRequest(request)}
                  className="text-indigo-600 hover:text-indigo-900 font-semibold"
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