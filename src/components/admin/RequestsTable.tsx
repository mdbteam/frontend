import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import type { Postulacion } from '../../types/adminTypes';
import StatusLabel from './StatusLabel';
import { useState } from 'react';

const approvePostulacion = (id: number, token: string | null) => {
  return axios.post(`/api/postulaciones/${id}/aprobar`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

const rejectPostulacion = (id: number, token: string | null) => {
  return axios.post(`/api/postulaciones/${id}/rechazar`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

const modifyPostulacion = ({ id, notas, token }: { id: number, notas: string, token: string | null }) => {
  return axios.patch(`/api/postulaciones/${id}/modificar`, { notas_admin: notas }, {
    headers: { Authorization: `Bearer ${token}` }
  });
};


const RequestRow = ({ request }: { request: Postulacion }) => {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const [notas, setNotas] = useState('');

  const usePostulacionAction = <TVariables,>(mutationFn: (vars: TVariables) => Promise<unknown>) => {
    return useMutation({
      mutationFn,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['postulacionesPendientes'] });
      },
      onError: (err) => {
        console.error("Error en la acción:", err);
        alert("Ocurrió un error.");
      }
    });
  };

  const approveMutation = usePostulacionAction((id: number) => approvePostulacion(id, token));
  const rejectMutation = usePostulacionAction((id: number) => rejectPostulacion(id, token));
  
  const modifyMutation = usePostulacionAction((vars: { id: number, notas: string }) => modifyPostulacion({ ...vars, token }));

  const handleApprove = () => {
    approveMutation.mutate(request.id_postulacion);
  };
  
  const handleReject = () => {
    rejectMutation.mutate(request.id_postulacion);
  };
  
  const handleModify = () => {
    if (!notas) {
      alert("Por favor, escribe notas de modificación.");
      return;
    }
    modifyMutation.mutate({ id: request.id_postulacion, notas });
  };
  
  const isPending = approveMutation.isPending || rejectMutation.isPending || modifyMutation.isPending;
  const formattedDate = new Date(request.fecha_postulacion).toLocaleDateString('es-CL');

  return (
    <tr className="hover:bg-slate-700/50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-slate-100">{request.nombres} {request.primer_apellido}</div>
        <div className="text-sm text-slate-400">{request.correo}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{formattedDate}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusLabel status={request.estado} />
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-y-2">
        {request.estado === 'Pendiente' ? (
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-2">
              <button onClick={handleReject} disabled={isPending} className="btn-sm-danger">Rechazar</button>
              <button onClick={handleApprove} disabled={isPending} className="btn-sm-success">Aprobar</button>
            </div>
            <div className="flex gap-2 w-full">
              <input 
                type="text" 
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Notas de modificación..." 
                className="input-sm-dark"
                disabled={isPending}
              />
              <button onClick={handleModify} disabled={isPending} className="btn-sm-warning">Modificar</button>
            </div>
          </div>
        ) : (
          <span className="text-slate-500">Revisado</span>
        )}
      </td>
    </tr>
  );
};


interface RequestsTableProps {
  requests: Postulacion[];
}

const RequestsTable: React.FC<RequestsTableProps> = ({ requests }) => {
  return (
    <div className="overflow-x-auto bg-slate-800/50 rounded-lg border border-slate-700">
      <table className="min-w-full divide-y divide-slate-700">
        <thead className="bg-slate-900/50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Postulante</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Fecha Solicitud</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Estado</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700">
          {requests.map((request) => (
            <RequestRow key={request.id_postulacion} request={request} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RequestsTable;