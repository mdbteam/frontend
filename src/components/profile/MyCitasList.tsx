import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import { FaSpinner, FaStar } from 'react-icons/fa';
import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { InfoDialog } from '../ui/InfoDialog';
import { Button } from '../ui/button';

// --- Tipos de Datos ---
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

const trabajoSchema = z.object({
  descripcion: z.string().min(10, "La descripción es requerida (mín. 10 caracteres)"),
  condiciones: z.string().optional().nullable(),
  precio_acordado: z.number().min(0, "El precio debe ser 0 o más"),
});
type TrabajoFormInputs = z.infer<typeof trabajoSchema>;
interface TrabajoCreatePayload extends TrabajoFormInputs {
  id_cita: number;
  id_cliente: number;
  id_prestador: number;
}

const ratingSchema = z.object({
  puntaje: z.number().min(1, "Debes seleccionar un puntaje").max(5),
  comentario: z.string().min(10, "Tu comentario es muy corto (mín. 10 caracteres)").optional().nullable(),
});
type RatingFormInputs = z.infer<typeof ratingSchema>;
interface RatingCreatePayload extends RatingFormInputs {
  id_trabajo: number;
}


// --- Funciones de API ---
const fetchMyCitas = async (token: string | null) => {
  if (!token) throw new Error("No estás autenticado");
  const { data } = await axios.get<CitaDetail[]>("/api/calendario/citas/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

const createTrabajo = async ({ payload, token }: { payload: TrabajoCreatePayload, token: string | null }) => {
  if (!token) throw new Error("No estás autenticado");
  return axios.post('/api/trabajos', payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

const acceptTrabajo = async ({ id_trabajo, token }: { id_trabajo: number, token: string | null }) => {
  if (!token) throw new Error("No estás autenticado");
  return axios.post(`/api/trabajos/${id_trabajo}/aceptar`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

const finishTrabajo = async ({ id_trabajo, token }: { id_trabajo: number, token: string | null }) => {
  if (!token) throw new Error("No estás autenticado");
  return axios.post(`/api/trabajos/${id_trabajo}/finalizar`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

const confirmTrabajo = async ({ id_trabajo, token }: { id_trabajo: number, token: string | null }) => {
  if (!token) throw new Error("No estás autenticado");
  return axios.post(`/api/trabajos/${id_trabajo}/confirmar`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

const rateTrabajo = async ({ payload, token }: { payload: RatingCreatePayload, token: string | null }) => {
  if (!token) throw new Error("No estás autenticado");
  return axios.post(`/api/trabajos/${payload.id_trabajo}/valorar`, 
    { puntaje: payload.puntaje, comentario: payload.comentario }, 
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

// --- Componente Modal: Crear Propuesta (Prestador) ---
function CreateTrabajoModal({ cita, isOpen, onClose, onSuccess, onError }: { cita: CitaDetail, isOpen: boolean, onClose: () => void, onSuccess: () => void, onError: (err: unknown) => void }) {
  const { token } = useAuthStore();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<TrabajoFormInputs>({
    resolver: zodResolver(trabajoSchema)
  });

  const mutation = useMutation({
    mutationFn: (data: TrabajoCreatePayload) => createTrabajo({ payload: data, token }),
    onSuccess: () => { reset(); onSuccess(); },
    onError: (err) => { onError(err); }
  });

  const onSubmit: SubmitHandler<TrabajoFormInputs> = (data) => {
    const payload: TrabajoCreatePayload = {
      ...data,
      id_cita: cita.id_cita,
      id_cliente: cita.id_cliente,
      id_prestador: cita.id_prestador,
    };
    mutation.mutate(payload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle>Crear Propuesta de Trabajo</DialogTitle>
          <DialogDescription className="text-slate-400">
            Estás creando una propuesta formal para la cita del {new Date(cita.fecha_hora_cita).toLocaleString('es-CL')}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div>
            <label htmlFor="descripcion" className="label-base">Descripción del Trabajo</label>
            <textarea id="descripcion" rows={3} className={`input-base ${errors.descripcion ? 'border-red-500' : 'border-slate-700'}`} {...register("descripcion")} placeholder="Detalle de las labores a realizar..." />
            {errors.descripcion && <p className="mt-1 text-sm text-red-400">{errors.descripcion.message}</p>}
          </div>
          <div>
            <label htmlFor="condiciones" className="label-base">Condiciones (Opcional)</label>
            <textarea id="condiciones" rows={2} className="input-base border-slate-700" {...register("condiciones")} placeholder="Ej: Garantía, materiales incluidos..." />
          </div>
          <div>
            <label htmlFor="precio_acordado" className="label-base">Precio Acordado (CLP)</label>
            <input type="number" id="precio_acordado" className={`input-base ${errors.precio_acordado ? 'border-red-500' : 'border-slate-700'}`} {...register("precio_acordado", { valueAsNumber: true })} placeholder="0" />
            {errors.precio_acordado && <p className="mt-1 text-sm text-red-400">{errors.precio_acordado.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="default" disabled={isSubmitting}>{isSubmitting ? "Enviando..." : "Enviar Propuesta"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- Componente Modal: Valorar Trabajo (Cliente) ---
function RateTrabajoModal({ trabajo, isOpen, onClose, onSuccess, onError }: { trabajo: { id_trabajo: number }, isOpen: boolean, onClose: () => void, onSuccess: () => void, onError: (err: unknown) => void }) {
  const { token } = useAuthStore();
  const [rating, setRating] = useState(0);
  
  const { register, handleSubmit, setValue, reset, formState: { errors, isSubmitting } } = useForm<RatingFormInputs>({
    resolver: zodResolver(ratingSchema)
  });

  const mutation = useMutation({
    mutationFn: (data: RatingCreatePayload) => rateTrabajo({ payload: data, token }),
    onSuccess: () => { reset(); setRating(0); onSuccess(); },
    onError: (err) => { onError(err); }
  });

  const onSubmit: SubmitHandler<RatingFormInputs> = (data) => {
    const payload: RatingCreatePayload = {
      ...data,
      id_trabajo: trabajo.id_trabajo,
    };
    mutation.mutate(payload);
  };
  
  const handleSetRating = (rate: number) => {
    setRating(rate);
    setValue("puntaje", rate, { shouldValidate: true });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle>Valorar Trabajo</DialogTitle>
          <DialogDescription className="text-slate-400">
            Deja una puntuación y un comentario sobre el trabajo realizado.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div>
            <label id="puntaje-label" className="label-base">Puntaje</label>
            <div role="group" aria-labelledby="puntaje-label" className="flex gap-2 text-3xl text-slate-600">
              {[1, 2, 3, 4, 5].map((star) => (
                <button 
                  key={star} 
                  type="button" 
                  aria-label={`Dar ${star} estrellas`}
                  onClick={() => handleSetRating(star)} 
                  className="focus:outline-none"
                >
                  <FaStar className={rating >= star ? 'text-yellow-400' : 'hover:text-yellow-300'} />
                </button>
              ))}
            </div>
            {errors.puntaje && <p className="mt-1 text-sm text-red-400">{errors.puntaje.message}</p>}
          </div>
          <div>
            <label htmlFor="comentario" className="label-base">Comentario (Opcional)</label>
            <textarea id="comentario" rows={3} className={`input-base ${errors.comentario ? 'border-red-500' : 'border-slate-700'}`} {...register("comentario")} placeholder="Describe tu experiencia..." />
            {errors.comentario && <p className="mt-1 text-sm text-red-400">{errors.comentario.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="default" disabled={isSubmitting}>{isSubmitting ? "Enviando..." : "Enviar Valoración"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- Componente de Badge de Estado ---
function CitaStatusBadge({ cita }: { cita: CitaDetail }) {
  if (cita.estado_trabajo) {
    let color = "bg-blue-500/20 text-blue-300";
    if (cita.estado_trabajo === 'aceptado') color = "bg-green-500/20 text-green-300";
    if (cita.estado_trabajo === 'finalizado') color = "bg-indigo-500/20 text-indigo-300";
    if (cita.estado_trabajo === 'confirmado' || cita.estado_trabajo === 'valorado') color = "bg-purple-500/20 text-purple-300";
    
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${color}`}>
        Trabajo: {cita.estado_trabajo}
      </span>
    );
  }

  let color = "bg-red-500/20 text-red-300";
  if (cita.estado === 'pendiente') color = "bg-yellow-500/20 text-yellow-300";
  if (cita.estado === 'aceptada') color = "bg-green-500/20 text-green-300";
  if (cita.estado === 'completada') color = "bg-indigo-500/20 text-indigo-300";
  
  return (
    <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${color}`}>
      Cita: {cita.estado}
    </span>
  );
}

// --- Componente Principal de la Lista ---
export function MyCitasList() {
  const { token, user } = useAuthStore();
  const queryClient = useQueryClient();
  
  const esPrestador = user?.rol.toLowerCase().trim() === 'prestador';
  const esCliente = user?.rol.toLowerCase().trim() === 'cliente';
  
  const [citaToPropose, setCitaToPropose] = useState<CitaDetail | null>(null);
  const [citaToRate, setCitaToRate] = useState<CitaDetail | null>(null);
  
  const [modalInfo, setModalInfo] = useState<{ isOpen: boolean; title: string; description: string; type: 'success' | 'error' }>({
    isOpen: false,
    title: '',
    description: '',
    type: 'success',
  });

  const { data: citas, isLoading, error } = useQuery({
    queryKey: ["myCitas"],
    queryFn: () => fetchMyCitas(token),
  });

  const acceptTrabajoMutation = useMutation({
    mutationFn: (id_trabajo: number) => acceptTrabajo({ id_trabajo, token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myCitas'] });
      setModalInfo({ isOpen: true, title: "Propuesta Aceptada", description: "¡Has aceptado la propuesta de trabajo! El trabajo ha comenzado.", type: 'success' });
    },
    onError: (err) => {
      console.error(err);
      setModalInfo({ isOpen: true, title: "Error", description: "No se pudo aceptar la propuesta.", type: 'error' });
    }
  });

  const finishTrabajoMutation = useMutation({
    mutationFn: (id_trabajo: number) => finishTrabajo({ id_trabajo, token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myCitas'] });
      setModalInfo({ isOpen: true, title: "Trabajo Finalizado", description: "Has marcado el trabajo como finalizado. El cliente será notificado para confirmar.", type: 'success' });
    },
    onError: (err) => {
      console.error(err);
      setModalInfo({ isOpen: true, title: "Error", description: "No se pudo finalizar el trabajo.", type: 'error' });
    }
  });

  const confirmTrabajoMutation = useMutation({
    mutationFn: (id_trabajo: number) => confirmTrabajo({ id_trabajo, token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myCitas'] });
      setModalInfo({ isOpen: true, title: "Trabajo Confirmado", description: "¡Gracias por confirmar! Ahora puedes dejar tu reseña.", type: 'success' });
    },
    onError: (err) => {
      console.error(err);
      setModalInfo({ isOpen: true, title: "Error", description: "No se pudo confirmar el trabajo.", type: 'error' });
    }
  });

  const handleProposalSuccess = () => {
    setCitaToPropose(null);
    queryClient.invalidateQueries({ queryKey: ['myCitas'] });
    setModalInfo({ isOpen: true, title: "Propuesta Enviada", description: "La propuesta ha sido enviada al cliente.", type: 'success' });
  };
  
  const handleRatingSuccess = () => {
    setCitaToRate(null);
    queryClient.invalidateQueries({ queryKey: ['myCitas'] });
    setModalInfo({ isOpen: true, title: "Valoración Enviada", description: "¡Gracias por tu reseña! Tu opinión es muy importante.", type: 'success' });
  };

  const handleModalError = (err: unknown) => {
    console.error(err);
    setCitaToPropose(null);
    setCitaToRate(null);
    setModalInfo({ isOpen: true, title: "Error", description: "La operación no pudo ser completada. Intenta de nuevo.", type: 'error' });
  };

  const handleAcceptTrabajo = (id_trabajo: number | null) => { if (id_trabajo) acceptTrabajoMutation.mutate(id_trabajo); };
  const handleFinishTrabajo = (id_trabajo: number | null) => { if (id_trabajo) finishTrabajoMutation.mutate(id_trabajo); };
  const handleConfirmTrabajo = (id_trabajo: number | null) => { if (id_trabajo) confirmTrabajoMutation.mutate(id_trabajo); };


  if (isLoading) {
    return <div className="flex justify-center items-center h-40"><FaSpinner className="animate-spin text-amber-400 text-3xl" /></div>;
  }
  if (error) {
    return <div className="p-8 text-center text-red-400 bg-slate-800/50 rounded-lg">Error al cargar tus citas.</div>;
  }
  if (!citas || citas.length === 0) {
    return <div className="p-8 text-center text-slate-400 bg-slate-800/50 rounded-lg">Aún no tienes citas agendadas.</div>;
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

      {citaToPropose && (
        <CreateTrabajoModal
          cita={citaToPropose}
          isOpen={!!citaToPropose}
          onClose={() => setCitaToPropose(null)}
          onSuccess={handleProposalSuccess}
          onError={handleModalError}
        />
      )}

      {citaToRate && citaToRate.id_trabajo && (
        <RateTrabajoModal
          trabajo={{ id_trabajo: citaToRate.id_trabajo }}
          isOpen={!!citaToRate}
          onClose={() => setCitaToRate(null)}
          onSuccess={handleRatingSuccess}
          onError={handleModalError}
        />
      )}

      <div className="space-y-4">
        {citas.map((cita) => (
          <div key={cita.id_cita} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <p className="text-lg font-semibold text-white">
                {esPrestador 
                  ? `Cita con ${cita.cliente_nombres || `Cliente #${cita.id_cliente}`}` 
                  : `Cita con ${cita.prestador_nombres || `Prestador #${cita.id_prestador}`}`
                }
              </p>
              <p className="text-sm text-slate-300">
                {new Date(cita.fecha_hora_cita).toLocaleString('es-CL', { dateStyle: 'full', timeStyle: 'short' })}
              </p>
              <p className="text-sm text-slate-400 mt-2">
                {cita.detalles || "Sin detalles."}
              </p>
            </div>

            <div className="flex-shrink-0 flex flex-col sm:items-end gap-2">
              <CitaStatusBadge cita={cita} />

              {/* -- Lógica del Prestador -- */}
              {esPrestador && !cita.id_trabajo && (cita.estado === 'pendiente' || cita.estado === 'aceptada' || cita.estado === 'completada') && (
                <Button variant="default" size="sm" className="mt-2" onClick={() => setCitaToPropose(cita)}>
                  Crear Propuesta
                </Button>
              )}
              {esPrestador && cita.estado_trabajo === 'aceptado' && (
                <Button variant="default" size="sm" className="mt-2" onClick={() => handleFinishTrabajo(cita.id_trabajo)} disabled={finishTrabajoMutation.isPending}>
                  {finishTrabajoMutation.isPending ? "Finalizando..." : "Finalizar Trabajo"}
                </Button>
              )}
              
              {/* -- Lógica del Cliente -- */}
              {esCliente && cita.id_trabajo && cita.estado_trabajo === 'propuesto' && (
                <Button 
                  variant="default" 
                  size="sm" 
                  className="mt-2 bg-green-600 hover:bg-green-700 text-white" 
                  onClick={() => handleAcceptTrabajo(cita.id_trabajo)} 
                  disabled={acceptTrabajoMutation.isPending}
                >
                  {acceptTrabajoMutation.isPending ? "Aceptando..." : "Aceptar Propuesta"}
                </Button>
              )}
              {esCliente && cita.id_trabajo && cita.estado_trabajo === 'finalizado' && (
                <Button variant="default" size="sm" className="mt-2" onClick={() => handleConfirmTrabajo(cita.id_trabajo)} disabled={confirmTrabajoMutation.isPending}>
                  {confirmTrabajoMutation.isPending ? "Confirmando..." : "Confirmar Trabajo"}
                </Button>
              )}
              {esCliente && cita.id_trabajo && cita.estado_trabajo === 'confirmado' && !cita.id_valoracion && (
                <Button 
                  variant="default" 
                  size="sm" 
                  className="mt-2 bg-green-600 hover:bg-green-700 text-white" 
                  onClick={() => setCitaToRate(cita)}
                >
                  Dejar Reseña
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}