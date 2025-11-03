import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import { useState } from 'react';
import { Button } from '../ui/button';
import { InfoDialog } from '../ui/InfoDialog';
import { FaCheck, FaTimes } from 'react-icons/fa';

interface PostulacionResumen {
  id_postulacion: number;
  id_usuario: number;
  nombres: string;
  primer_apellido: string;
  correo: string;
  fecha_postulacion: string;
  estado: string;
}

interface RequestsTableProps {
  postulaciones: PostulacionResumen[];
  isLoading: boolean;
}

const apiApproveRequest = ({ id, token }: { id: number, token: string | null }) => {
  if (!token) throw new Error("No autenticado");
  return axios.post(`/api/postulaciones/${id}/aprobar`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

const apiRejectRequest = ({ id, token }: { id: number, token: string | null }) => {
  if (!token) throw new Error("No autenticado");
  return axios.post(`/api/postulaciones/${id}/rechazar`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export function RequestsTable({ postulaciones, isLoading }: RequestsTableProps) {
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();
  
  const [modalInfo, setModalInfo] = useState<{ isOpen: boolean; title: string; description: string; type: 'success' | 'error' }>({
    isOpen: false,
    title: '',
    description: '',
    type: 'success',
  });

  const handleMutationSuccess = (title: string, description: string) => {
    queryClient.invalidateQueries({ queryKey: ['pendingRequests'] });
    setModalInfo({ isOpen: true, title, description, type: 'success' });
  };

  const handleMutationError = (error: unknown, title: string) => {
    console.error(error);
    setModalInfo({ isOpen: true, title, description: "Ocurrió un error inesperado.", type: 'error' });
  };

  const approveMutation = useMutation({
    mutationFn: (id: number) => apiApproveRequest({ id, token }),
    onSuccess: () => handleMutationSuccess('Postulación Aprobada', 'El usuario ha sido promovido a prestador.'),
    onError: (err) => handleMutationError(err, 'Error al Aprobar'),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: number) => apiRejectRequest({ id, token }),
    onSuccess: () => handleMutationSuccess('Postulación Rechazada', 'La postulación ha sido rechazada.'),
    onError: (err) => handleMutationError(err, 'Error al Rechazar'),
  });

  if (isLoading) {
    return <div className="text-center p-8 text-slate-400">Cargando solicitudes...</div>;
  }

  if (!postulaciones || postulaciones.length === 0) {
    return <div className="text-center p-8 text-slate-400">No hay postulaciones pendientes.</div>;
  }

  return (
    <>
      <InfoDialog
        isOpen={modalInfo.isOpen}
        onClose={() => setModalInfo({ ...modalInfo, isOpen: false })}
        title={modalInfo.title}
        description={modalInfo.description}
        type={modalInfo.type}
      />
      
      <div className="overflow-x-auto rounded-lg border border-slate-700 bg-slate-800/50">
        <table className="min-w-full divide-y divide-slate-700">
          <thead className="bg-slate-800">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Nombre</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Correo</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Fecha</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {postulaciones.map((postulacion) => (
              <tr key={postulacion.id_postulacion} className="hover:bg-slate-800/60">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{postulacion.nombres} {postulacion.primer_apellido}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{postulacion.correo}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{new Date(postulacion.fecha_postulacion).toLocaleDateString('es-CL')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => approveMutation.mutate(postulacion.id_postulacion)}
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                  >
                    <FaCheck className="mr-2 h-4 w-4" /> Aprobar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => rejectMutation.mutate(postulacion.id_postulacion)}
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                  >
                    <FaTimes className="mr-2 h-4 w-4" /> Rechazar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}