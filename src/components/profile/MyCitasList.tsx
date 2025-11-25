import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useForm } from 'react-hook-form'; // 👈 Se eliminó SubmitHandler
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FaSpinner, FaStar, FaClock, FaCheckCircle, FaBan, FaUser } from 'react-icons/fa';

import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { InfoDialog } from '../ui/InfoDialog';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';

// --- CLIENTES API ---
const apiCalendario = axios.create({ baseURL: 'https://calendario-service-u5f6.onrender.com' });
const apiProveedores = axios.create({ baseURL: 'https://provider-service-mjuj.onrender.com' });

// --- TIPOS DE DATOS ---
interface CitaDetail {
  id_cita: number;
  id_cliente: number;
  id_prestador: number;
  fecha_hora_cita: string;
  detalles: string | null;
  estado: string;
  id_trabajo: number | null;
  estado_trabajo: string | null;
  cliente_nombres: string | null;
  prestador_nombres: string | null;
  id_valoracion: number | null;
}

// --- TIPOS PARA PROPS DE COMPONENTES (Adiós 'any') ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface CreateTrabajoProps extends ModalProps {
  cita: CitaDetail;
}

interface RateTrabajoProps extends ModalProps {
  trabajoId: number;
}

// --- SCHEMAS ZOD ---
const trabajoSchema = z.object({
  descripcion: z.string().min(10, "La descripción es requerida (mín. 10 caracteres)"),
  condiciones: z.string().optional().nullable(),
  precio_acordado: z.number().min(0, "El precio debe ser 0 o más"),
});
type TrabajoFormInputs = z.infer<typeof trabajoSchema>;

const ratingSchema = z.object({
  puntaje: z.number().min(1, "Selecciona puntaje").max(5),
  comentario: z.string().min(5, "Comentario muy corto").optional().nullable(),
});
type RatingFormInputs = z.infer<typeof ratingSchema>;

// --- FETCHERS ---
const fetchMyCitas = async (token: string | null) => {
  if (!token) throw new Error("No autenticado");
  const { data } = await apiCalendario.get<CitaDetail[]>("/citas/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

// --- COMPONENTES AUXILIARES ---

// Badge de Estado
function CitaStatusBadge({ cita }: { cita: CitaDetail }) {
  if (cita.estado_trabajo) {
    let colorClass = "bg-blue-100 text-blue-800 border-blue-200";
    let label = `Trabajo: ${cita.estado_trabajo}`;

    switch (cita.estado_trabajo.toLowerCase()) {
      case 'aceptado': colorClass = "bg-indigo-100 text-indigo-800 border-indigo-200"; label = "En Progreso"; break;
      case 'finalizado': colorClass = "bg-purple-100 text-purple-800 border-purple-200"; label = "Finalizado"; break;
      case 'confirmado': 
      case 'valorado': colorClass = "bg-green-100 text-green-800 border-green-200"; label = "Completado"; break;
    }
    return <span className={`px-2 py-1 rounded-full text-xs font-bold border ${colorClass}`}>{label}</span>;
  }

  let colorClass = "bg-gray-100 text-gray-800 border-gray-200";
  switch (cita.estado.toLowerCase()) {
    case 'pendiente': colorClass = "bg-amber-100 text-amber-800 border-amber-200"; break;
    case 'aceptada': colorClass = "bg-emerald-100 text-emerald-800 border-emerald-200"; break;
    case 'rechazada': colorClass = "bg-red-100 text-red-800 border-red-200"; break;
  }
  
  return <span className={`px-2 py-1 rounded-full text-xs font-bold border ${colorClass} capitalize`}>{cita.estado}</span>;
}

// Modal Crear Propuesta
function CreateTrabajoModal({ cita, isOpen, onClose, onSuccess }: CreateTrabajoProps) { // 👈 Tipado Correcto
  const { token } = useAuthStore();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<TrabajoFormInputs>({ resolver: zodResolver(trabajoSchema) });

  const mutation = useMutation({
    mutationFn: (data: TrabajoFormInputs) => apiProveedores.post('/trabajos', {
      ...data, id_cita: cita.id_cita, id_cliente: cita.id_cliente, id_prestador: cita.id_prestador
    }, { headers: { Authorization: `Bearer ${token}` } }),
    onSuccess: () => { onSuccess(); onClose(); },
    onError: (e) => console.error(e)
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white">
        <DialogHeader><DialogTitle>Crear Propuesta</DialogTitle><DialogDescription>Envía el presupuesto al cliente.</DialogDescription></DialogHeader>
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
          <div><Label>Descripción</Label><Textarea {...register("descripcion")} className="bg-slate-800 border-slate-700" />{errors.descripcion && <p className="text-red-400 text-xs">{errors.descripcion.message}</p>}</div>
          <div><Label>Precio (CLP)</Label><Input type="number" {...register("precio_acordado", { valueAsNumber: true })} className="bg-slate-800 border-slate-700" /></div>
          <DialogFooter><Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button><Button type="submit" disabled={isSubmitting}>Enviar</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Modal Valorar
function RateTrabajoModal({ trabajoId, isOpen, onClose, onSuccess }: RateTrabajoProps) { // 👈 Tipado Correcto
  const { token } = useAuthStore();
  const [rating, setRating] = useState(0);
  const { register, handleSubmit, setValue } = useForm<RatingFormInputs>({ resolver: zodResolver(ratingSchema) });

  const mutation = useMutation({
    mutationFn: (data: RatingFormInputs) => apiProveedores.post(`/trabajos/${trabajoId}/valorar`, data, { headers: { Authorization: `Bearer ${token}` } }),
    onSuccess: () => { onSuccess(); onClose(); },
    onError: (e) => console.error(e)
  });

  const handleRate = (r: number) => { setRating(r); setValue('puntaje', r); };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white">
        <DialogHeader><DialogTitle>Valorar Servicio</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
          <div className="flex gap-2 justify-center">{[1,2,3,4,5].map(star => (<FaStar key={star} className={`cursor-pointer text-2xl ${star <= rating ? 'text-yellow-400' : 'text-slate-600'}`} onClick={() => handleRate(star)} />))}</div>
          <Textarea {...register("comentario")} placeholder="Escribe un comentario..." className="bg-slate-800 border-slate-700" />
          <DialogFooter><Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button><Button type="submit" disabled={rating === 0}>Enviar</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- COMPONENTE PRINCIPAL ---
export function MyCitasList() {
  const { token, user } = useAuthStore();
  const queryClient = useQueryClient();
  
  const [modalProposal, setModalProposal] = useState<CitaDetail | null>(null);
  const [modalRating, setModalRating] = useState<number | null>(null);
  const [modalInfo, setModalInfo] = useState({ isOpen: false, title: "", description: "", type: "success" as "success" | "error" });

  const currentUserId = Number(user?.id);

  const { data: citas, isLoading, error } = useQuery({
    queryKey: ["myCitas"],
    queryFn: () => fetchMyCitas(token),
  });

  // Tipamos explícitamente los argumentos de la mutación
  const actionMutation = useMutation({
    mutationFn: async ({ url, service }: { url: string, service: 'calendario' | 'proveedores' }) => {
      const api = service === 'calendario' ? apiCalendario : apiProveedores;
      return api.post(url, {}, { headers: { Authorization: `Bearer ${token}` } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myCitas'] });
      setModalInfo({ isOpen: true, title: "Éxito", description: "Operación realizada correctamente.", type: "success" });
    },
    onError: () => setModalInfo({ isOpen: true, title: "Error", description: "No se pudo completar la acción.", type: "error" })
  });

  const handleAction = (url: string, service: 'calendario' | 'proveedores') => {
    actionMutation.mutate({ url, service });
  };

  if (isLoading) return <div className="flex justify-center p-10"><FaSpinner className="animate-spin text-3xl text-cyan-400" /></div>;
  if (error) return <div className="text-center text-red-400 p-4 bg-slate-800 rounded">Error al cargar citas.</div>;
  if (!citas || citas.length === 0) return <div className="text-center text-slate-400 p-10 bg-slate-800/50 rounded-xl">No tienes citas agendadas.</div>;

  return (
    <div className="space-y-4">
      <InfoDialog isOpen={modalInfo.isOpen} onClose={() => setModalInfo({ ...modalInfo, isOpen: false })} title={modalInfo.title} description={modalInfo.description} type={modalInfo.type} />
      
      {citas.map((cita) => {
        const soyElPrestador = cita.id_prestador === currentUserId;
        const soyElCliente = cita.id_cliente === currentUserId;

        const nombreOtro = soyElPrestador ? cita.cliente_nombres : cita.prestador_nombres;
        const rolOtro = soyElPrestador ? "Cliente" : "Prestador";
        const idOtro = soyElPrestador ? cita.id_cliente : cita.id_prestador;

        return (
          <div key={cita.id_cita} className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-md hover:border-slate-600 transition-colors">
            
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 text-white font-bold text-lg">
                  <FaClock className="text-cyan-400" />
                  {new Date(cita.fecha_hora_cita).toLocaleString('es-CL', { dateStyle: 'full', timeStyle: 'short' })}
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
                  <FaUser className="text-slate-500" />
                  <span>{rolOtro}: <strong className="text-slate-200">{nombreOtro || `Usuario #${idOtro}`}</strong></span>
                </div>
              </div>
              <CitaStatusBadge cita={cita} />
            </div>

            {cita.detalles && (
              <div className="bg-slate-900/50 p-3 rounded-lg mb-4 border border-slate-800">
                <p className="text-slate-300 text-sm italic">"{cita.detalles}"</p>
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-3 border-t border-slate-700">
              
              {soyElPrestador && (
                <>
                  {cita.estado === 'pendiente' && (
                    <>
                      <Button variant="destructive" size="sm" onClick={() => handleAction(`/citas/${cita.id_cita}/rechazar`, 'calendario')}><FaBan className="mr-2"/> Rechazar</Button>
                      <Button className="bg-green-600 hover:bg-green-700 text-white" size="sm" onClick={() => handleAction(`/citas/${cita.id_cita}/aceptar`, 'calendario')}><FaCheckCircle className="mr-2"/> Aceptar Solicitud</Button>
                    </>
                  )}
                  {cita.estado === 'aceptada' && !cita.id_trabajo && (
                    <Button className="bg-cyan-600 hover:bg-cyan-700 text-white" size="sm" onClick={() => setModalProposal(cita)}>Crear Propuesta ($)</Button>
                  )}
                  {cita.estado_trabajo === 'aceptado' && (
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" size="sm" onClick={() => handleAction(`/trabajos/${cita.id_trabajo}/finalizar`, 'proveedores')}>Finalizar Trabajo</Button>
                  )}
                </>
              )}

              {soyElCliente && (
                <>
                  {cita.estado === 'pendiente' && (
                    <span className="text-slate-500 text-sm italic flex items-center"><FaClock className="mr-1"/> Esperando confirmación del prestador...</span>
                  )}
                  {cita.estado_trabajo === 'propuesto' && (
                    <Button className="bg-green-600 hover:bg-green-700 text-white" size="sm" onClick={() => handleAction(`/trabajos/${cita.id_trabajo}/aceptar`, 'proveedores')}>Aceptar Propuesta</Button>
                  )}
                  {cita.estado_trabajo === 'finalizado' && (
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white" size="sm" onClick={() => handleAction(`/trabajos/${cita.id_trabajo}/confirmar`, 'proveedores')}>Confirmar y Pagar</Button>
                  )}
                  {cita.estado_trabajo === 'confirmado' && !cita.id_valoracion && (
                    <Button className="bg-yellow-500 hover:bg-yellow-600 text-slate-900" size="sm" onClick={() => setModalRating(cita.id_trabajo!)}><FaStar className="mr-1"/> Valorar Servicio</Button>
                  )}
                </>
              )}
            </div>

          </div>
        );
      })}

      {modalProposal && <CreateTrabajoModal cita={modalProposal} isOpen={true} onClose={() => setModalProposal(null)} onSuccess={() => queryClient.invalidateQueries({ queryKey: ['myCitas'] })} />}
      {modalRating && <RateTrabajoModal trabajoId={modalRating} isOpen={true} onClose={() => setModalRating(null)} onSuccess={() => queryClient.invalidateQueries({ queryKey: ['myCitas'] })} />}
    </div>
  );
}