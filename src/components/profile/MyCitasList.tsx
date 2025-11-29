import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom'; // 👈 Importamos Link para navegación
import { 
  FaSpinner, FaStar, FaClock, FaCheckCircle, 
  FaBan, FaUser, FaCommentDots 
} from 'react-icons/fa'; // 👈 Agregamos FaCommentDots

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

// --- TIPOS ---
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

// --- SCHEMAS ---
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

function CitaStatusBadge({ cita }: { cita: CitaDetail }) {
  if (cita.estado_trabajo) {
    let colorClass = "bg-blue-900/30 text-blue-300 border-blue-800";
    let label = `Trabajo: ${cita.estado_trabajo}`;

    switch (cita.estado_trabajo.toLowerCase()) {
      case 'aceptado': colorClass = "bg-indigo-900/30 text-indigo-300 border-indigo-800"; label = "En Progreso"; break;
      case 'finalizado': colorClass = "bg-purple-900/30 text-purple-300 border-purple-800"; label = "Finalizado"; break;
      case 'confirmado': 
      case 'valorado': colorClass = "bg-green-900/30 text-green-300 border-green-800"; label = "Completado"; break;
    }
    return <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${colorClass} uppercase tracking-wider`}>{label}</span>;
  }

  let colorClass = "bg-slate-800 text-slate-400 border-slate-700";
  switch (cita.estado.toLowerCase()) {
    case 'pendiente': colorClass = "bg-amber-900/30 text-amber-300 border-amber-800"; break;
    case 'aceptada': colorClass = "bg-emerald-900/30 text-emerald-300 border-emerald-800"; break;
    case 'rechazada': colorClass = "bg-red-900/30 text-red-300 border-red-800"; break;
  }
  
  return <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${colorClass} uppercase tracking-wider`}>{cita.estado}</span>;
}

function CreateTrabajoModal({ cita, isOpen, onClose, onSuccess }: CreateTrabajoProps) {
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
      <DialogContent className="bg-slate-900 border-slate-700 text-white sm:max-w-md">
        <DialogHeader><DialogTitle>Crear Propuesta</DialogTitle><DialogDescription className="text-slate-400">Envía el presupuesto al cliente.</DialogDescription></DialogHeader>
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4 pt-2">
          <div><Label>Descripción</Label><Textarea {...register("descripcion")} className="bg-slate-800 border-slate-700 mt-1" />{errors.descripcion && <p className="text-red-400 text-xs mt-1">{errors.descripcion.message}</p>}</div>
          <div><Label>Precio (CLP)</Label><Input type="number" {...register("precio_acordado", { valueAsNumber: true })} className="bg-slate-800 border-slate-700 mt-1" /></div>
          <DialogFooter><Button type="button" variant="ghost" onClick={onClose} className="text-slate-400 hover:text-white">Cancelar</Button><Button type="submit" disabled={isSubmitting} className="bg-cyan-600 hover:bg-cyan-500 text-white">Enviar</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RateTrabajoModal({ trabajoId, isOpen, onClose, onSuccess }: RateTrabajoProps) {
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
      <DialogContent className="bg-slate-900 border-slate-700 text-white sm:max-w-md">
        <DialogHeader><DialogTitle>Valorar Servicio</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4 pt-2">
          <div className="flex gap-2 justify-center pb-2">{[1,2,3,4,5].map(star => (<FaStar key={star} className={`cursor-pointer text-3xl transition-colors ${star <= rating ? 'text-yellow-400' : 'text-slate-700 hover:text-yellow-200'}`} onClick={() => handleRate(star)} />))}</div>
          <Textarea {...register("comentario")} placeholder="Escribe un comentario..." className="bg-slate-800 border-slate-700" />
          <DialogFooter><Button type="button" variant="ghost" onClick={onClose} className="text-slate-400 hover:text-white">Cancelar</Button><Button type="submit" disabled={rating === 0} className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold">Enviar Valoración</Button></DialogFooter>
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
  if (error) return <div className="text-center text-red-400 p-4 bg-slate-800 rounded-lg border border-red-900/50">Error al cargar citas.</div>;
  if (!citas || citas.length === 0) return <div className="text-center text-slate-400 p-10 bg-slate-800/50 rounded-xl border border-slate-700">No tienes citas agendadas.</div>;

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
          <div key={cita.id_cita} className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg hover:border-slate-600 transition-all">
            
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 text-white font-bold text-lg">
                  <FaClock className="text-cyan-400" />
                  {new Date(cita.fecha_hora_cita).toLocaleString('es-CL', { dateStyle: 'full', timeStyle: 'short' })}
                </div>
                
                <div className="flex items-center gap-3 text-slate-400 text-sm mt-1">
                  <div className="flex items-center gap-1">
                    <FaUser className="text-slate-500" />
                    <span>{rolOtro}: <strong className="text-slate-200">{nombreOtro || `Usuario #${idOtro}`}</strong></span>
                  </div>
                  
                  {/* 👇 NUEVO BOTÓN CHAT */}
                  <Link 
                    to={`/mensajes/${idOtro}`} 
                    className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors font-medium bg-cyan-950/30 px-2 py-0.5 rounded border border-cyan-900/50"
                    title="Enviar mensaje"
                  >
                    <FaCommentDots size={12} />
                    <span className="text-xs">Chat</span>
                  </Link>
                </div>
              </div>
              <CitaStatusBadge cita={cita} />
            </div>

            {/* 👇 CORRECCIÓN: break-words para que no se salga */}
            {cita.detalles && (
              <div className="bg-slate-900/50 p-3 rounded-lg mb-4 border border-slate-800/50">
                <p className="text-slate-300 text-sm italic break-words whitespace-pre-wrap leading-relaxed">
                  "{cita.detalles}"
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-700">
              
              {soyElPrestador && (
                <>
                  {cita.estado === 'pendiente' && (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => handleAction(`/citas/${cita.id_cita}/rechazar`, 'calendario')} className="text-red-400 hover:text-red-300 hover:bg-red-900/20"><FaBan className="mr-2"/> Rechazar</Button>
                      <Button className="bg-emerald-600 hover:bg-emerald-500 text-white border-none" size="sm" onClick={() => handleAction(`/citas/${cita.id_cita}/aceptar`, 'calendario')}><FaCheckCircle className="mr-2"/> Aceptar</Button>
                    </>
                  )}
                  {cita.estado === 'aceptada' && !cita.id_trabajo && (
                    <Button className="bg-cyan-600 hover:bg-cyan-500 text-white border-none" size="sm" onClick={() => setModalProposal(cita)}>Crear Propuesta ($)</Button>
                  )}
                  {cita.estado_trabajo === 'aceptado' && (
                    <Button className="bg-indigo-600 hover:bg-indigo-500 text-white border-none" size="sm" onClick={() => handleAction(`/trabajos/${cita.id_trabajo}/finalizar`, 'proveedores')}>Finalizar Trabajo</Button>
                  )}
                </>
              )}

              {soyElCliente && (
                <>
                  {cita.estado === 'pendiente' && (
                    <span className="text-slate-500 text-xs italic flex items-center bg-slate-900/50 px-3 py-1.5 rounded-full"><FaClock className="mr-1.5"/> Esperando confirmación...</span>
                  )}
                  {cita.estado_trabajo === 'propuesto' && (
                    <Button className="bg-emerald-600 hover:bg-emerald-500 text-white border-none" size="sm" onClick={() => handleAction(`/trabajos/${cita.id_trabajo}/aceptar`, 'proveedores')}>Aceptar Propuesta</Button>
                  )}
                  {cita.estado_trabajo === 'finalizado' && (
                    <Button className="bg-purple-600 hover:bg-purple-500 text-white border-none" size="sm" onClick={() => handleAction(`/trabajos/${cita.id_trabajo}/confirmar`, 'proveedores')}>Confirmar y Pagar</Button>
                  )}
                  {cita.estado_trabajo === 'confirmado' && !cita.id_valoracion && (
                    <Button className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold border-none" size="sm" onClick={() => setModalRating(cita.id_trabajo!)}><FaStar className="mr-1"/> Valorar</Button>
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