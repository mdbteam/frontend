import { useMemo, useState, useEffect } from 'react'; // Importamos useEffect
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { type DateSelectArg, type EventInput } from '@fullcalendar/core';
import { FaUserCircle, FaSpinner, FaStar, FaBriefcase } from 'react-icons/fa';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { InfoDialog } from '../components/ui/InfoDialog';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';

const citaSchema = z.object({
  detalles: z.string().min(10, "Por favor, da más detalles del trabajo (mín. 10 caracteres)."),
});
type CitaFormInputs = z.infer<typeof citaSchema>;


interface PerfilDetalle { id_usuario: number; nombres: string; primer_apellido: string; foto_url: string; genero: string | null; fecha_nacimiento: string | null; biografia: string | null; resumen_profesional: string | null; anos_experiencia: number | null; }
interface Experiencia { id_experiencia: number; id_usuario: number; cargo: string; descripcion: string; fecha_inicio: string; fecha_fin: string | null; }
interface Resena { id_valoracion: number; id_autor: number; id_evaluado: number; rol_autor: string; puntaje: number | null; comentario: string | null; fecha_creacion: string; }
interface PrestadorPublicoDetalle { id_usuario: number; nombres: string; primer_apellido: string; segundo_apellido: string | null; foto_url: string; oficios: string[]; puntuacion_promedio: number; trabajos_realizados: number; perfil: PerfilDetalle | null; portafolio: string[]; experiencia: Experiencia[]; resenas: Resena[]; }

interface CitaDetail {
  id_cita: number;
  id_prestador: number;
  fecha_hora_cita: string;
  detalles: string | null;
  estado: string;
}

interface DisponibilidadSlot { hora_inicio: string; }
interface CreateCitaPayload { id_prestador: number; fecha_hora_cita: string; detalles: string; }


const fetchPrestadorProfile = async (id: string) => {
  const { data } = await axios.get<PrestadorPublicoDetalle>(`/api/prestadores/${id}`);
  return data;
};
const fetchPrestadorDisponibilidad = async (id: string) => {
  const { data } = await axios.get<DisponibilidadSlot[]>(`/api/calendario/prestadores/${id}/disponibilidad`);
  return data;
};

const fetchMyCitas = async (token: string | null) => {
  if (!token) throw new Error("No estás autenticado");
  const { data } = await axios.get<CitaDetail[]>("/api/calendario/citas/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

const createCita = async ({ payload, token }: { payload: CreateCitaPayload, token: string | null }) => {
  if (!token) throw new Error('Debes iniciar sesión para agendar una cita.');
  return axios.post('/api/calendario/citas', payload, { headers: { Authorization: `Bearer ${token}` } });
};

export default function PrestadorDetailPage() {
  const { id } = useParams<{ id: string }>();
  if (!id) throw new Error("ID de prestador no encontrado en la URL");

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { token, isAuthenticated, user } = useAuthStore();
  
  const [selectionToBook, setSelectionToBook] = useState<DateSelectArg | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  
  const [modalInfo, setModalInfo] = useState<{ isOpen: boolean; title: string; description: string; type: 'success' | 'error' | 'info' }>({
    isOpen: false,
    title: '',
    description: '',
    type: 'info',
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CitaFormInputs>({
    resolver: zodResolver(citaSchema)
  });

  const { data: profile, isLoading: isLoadingProfile, error: errorProfile } = useQuery({
    queryKey: ['prestadorProfile', id],
    queryFn: () => fetchPrestadorProfile(id),
  });

  const { data: disponibilidad, isLoading: isLoadingDisp, error: errorDisp } = useQuery({
    queryKey: ['prestadorDisponibilidad', id],
    queryFn: () => fetchPrestadorDisponibilidad(id),
    retry: (failureCount, error) => {
      if (axios.isAxiosError(error) && error.response?.status === 404) return false;
      return failureCount < 3;
    },
  });

  const { data: misCitas, isLoading: isLoadingCitas } = useQuery({
    queryKey: ['myCitas'],
    queryFn: () => fetchMyCitas(token),
    enabled: isAuthenticated,
    retry: (failureCount, error) => {
      if (axios.isAxiosError(error) && error.response?.status === 404) return false;
      return failureCount < 3;
    },
  });

  const createCitaMutation = useMutation({
    mutationFn: createCita,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prestadorDisponibilidad', id] });
      queryClient.invalidateQueries({ queryKey: ['myCitas'] });
      handleCloseModal();
      setModalInfo({
        isOpen: true,
        title: '¡Cita Solicitada!',
        description: 'Tu solicitud de cita ha sido enviada. El prestador debe confirmarla. Puedes ver el estado en tu perfil.',
        type: 'success',
      });
    },
    onError: (err) => {
      console.error("Error al crear la cita:", err);
      setModalInfo({
        isOpen: true,
        title: 'Error',
        description: 'No se pudo agendar la cita. Por favor, intenta de nuevo más tarde.',
        type: 'error',
      });
    }
  });

  const esMiPerfil = !!user && profile?.id_usuario.toString() === user.id;

  // --- ¡AQUÍ ESTÁ LA LÓGICA DE REDIRECCIÓN! ---
  useEffect(() => {
    if (esMiPerfil) {
      // Si soy yo, me redirige a mi calendario privado.
      navigate('/calendario', { replace: true });
    }
  }, [esMiPerfil, navigate]);


  const dataForCalendar = useMemo((): EventInput[] => {
    const eventosDisponibles: EventInput[] = (disponibilidad || []).map((slot, index) => ({
      id: `slot-${index}`,
      title: 'Disponible',
      start: slot.hora_inicio,
      allDay: false,
      backgroundColor: '#10b981',
      borderColor: '#10b981',
      className: "cursor-pointer"
    }));

    const prestadorIdNum = Number.parseInt(id, 10);
    const eventosMisCitas: EventInput[] = (misCitas || [])
      .filter(cita => cita.id_prestador === prestadorIdNum)
      .map(cita => ({
        id: `cita-${cita.id_cita}`,
        title: `Cita ${cita.estado}`,
        start: cita.fecha_hora_cita,
        allDay: false,
        backgroundColor: '#f59e0b',
        borderColor: '#f59e0b',
        editable: false,
        className: "cursor-not-allowed"
      }));

    return [...eventosDisponibles, ...eventosMisCitas];
    
  }, [disponibilidad, misCitas, id]);

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect();

    // Esta comprobación ahora es redundante por el useEffect, pero la dejamos por seguridad
    if (esMiPerfil) return; 

    if (!isAuthenticated) {
      setModalInfo({
        isOpen: true,
        title: 'Acción Requerida',
        description: 'Por favor, inicia sesión para poder agendar una cita.',
        type: 'info',
      });
      return;
    }
    
    if (selectInfo.jsEvent?.target instanceof HTMLElement && selectInfo.jsEvent.target.classList.contains('cursor-not-allowed')) {
      return; 
    }

    setSelectionToBook(selectInfo);
  };

  const handleCloseModal = () => { setSelectionToBook(null); reset(); };

  const handleCloseInfoModal = () => {
    setModalInfo({ ...modalInfo, isOpen: false });
    if (!isAuthenticated && modalInfo.type === 'info') {
      navigate('/login');
    }
  };

  const onCitaSubmit: SubmitHandler<CitaFormInputs> = (data) => {
    if (!selectionToBook) return;
    const payload: CreateCitaPayload = {
      id_prestador: Number.parseInt(id, 10),
      fecha_hora_cita: selectionToBook.startStr,
      detalles: data.detalles,
    };
    createCitaMutation.mutate({ payload, token });
  };


  const isLoading = isLoadingProfile || isLoadingDisp || (isAuthenticated && isLoadingCitas);

  // Si está cargando O si va a redirigir, mostramos el spinner
  if (isLoading || esMiPerfil) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <FaSpinner className="animate-spin text-amber-400 text-4xl" />
      </div>
    );
  }

  if (errorProfile || !profile) {
    return <div className="p-8 text-center text-red-400">Error al cargar el perfil del prestador.</div>;
  }

  // --- AHORA, esta página solo se renderiza si NO ES MI PERFIL ---
  return (
    <>
      <InfoDialog
        isOpen={modalInfo.isOpen}
        onClose={handleCloseInfoModal}
        title={modalInfo.title}
        description={modalInfo.description}
        type={modalInfo.type}
      />
      
      <Dialog open={!!lightboxImage} onOpenChange={(isOpen) => !isOpen && setLightboxImage(null)}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-3xl p-2">
          <img src={lightboxImage || ''} alt="Foto de portafolio" className="rounded-md object-contain w-full max-h-[80vh]" />
          <DialogFooter className="sm:justify-center">
            <Button type="button" variant="secondary" onClick={() => setLightboxImage(null)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="p-4 sm:p-8">
        <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="md:col-span-1 space-y-6">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 text-center">
              {profile.foto_url ? (
                <img src={profile.foto_url} alt="Foto de perfil" className="h-32 w-32 rounded-full object-cover border-4 border-slate-700 mx-auto" />
              ) : (
                <FaUserCircle className="h-32 w-32 text-slate-600 mx-auto" />
              )}
              <h1 className="text-3xl font-bold text-white mt-4">{profile.nombres} {profile.primer_apellido}</h1>
              <p className="text-amber-400 text-lg mt-1">{profile.oficios?.[0] || 'Profesional'}</p>
              <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-slate-700">
                <div className="text-center">
                  <span className="text-xl font-bold text-white flex items-center justify-center gap-1"><FaStar className="text-yellow-400"/> {profile.puntuacion_promedio.toFixed(1)}</span>
                  <span className="text-xs text-slate-400">Puntuación</span>
                </div>
                <div className="text-center">
                  <span className="text-xl font-bold text-white">{profile.trabajos_realizados}</span>
                  <span className="text-xs text-slate-400">Trabajos</span>
                </div>
              </div>
            </div>
            
            {profile.perfil && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-amber-400">Años de Experiencia</h3>
                  <p className="text-lg text-slate-200">{profile.perfil.anos_experiencia || 'No especificado'} años</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-amber-400">Biografía</h3>
                  <p className="text-base text-slate-300">{profile.perfil.biografia || 'No disponible.'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-amber-400">Especialidades</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(profile.oficios || []).map(cat => (
                      <span key={cat} className="bg-slate-700 text-amber-300 text-xs font-medium px-3 py-1 rounded-full">{cat}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {profile.portafolio.length > 0 && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Portafolio</h3>
                <div className="grid grid-cols-2 gap-2">
                  {profile.portafolio.map((imgUrl) => (
                    <button 
                      key={imgUrl} 
                      onClick={() => setLightboxImage(imgUrl)}
                      className="focus:outline-none focus:ring-2 focus:ring-amber-400 rounded-md overflow-hidden"
                    >
                      <img src={imgUrl} alt="Foto de portafolio" className="object-cover w-full h-24" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {profile.experiencia.length > 0 && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Experiencia Laboral</h3>
                <ul className="space-y-4">
                  {profile.experiencia.map((exp) => (
                    <li key={exp.id_experiencia} className="flex gap-3">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center">
                        <FaBriefcase className="text-amber-400" />
                      </div>
                      <div>
                        <h4 className="text-base font-medium text-slate-100">{exp.cargo}</h4>
                        <p className="text-sm text-slate-300">{exp.descripcion}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(exp.fecha_inicio).getFullYear()} - {exp.fecha_fin ? new Date(exp.fecha_fin).getFullYear() : 'Presente'}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="md:col-span-2 space-y-8">
            <div>
              <div className="mb-6"><h2 className="text-3xl font-bold text-white font-poppins [text-shadow:0_0_15px_rgba(234,179,8,0.4)]">Agenda tu Cita</h2><p className="mt-1 text-slate-300">Selecciona un horario "Disponible" para enviar una solicitud.</p></div>
              {errorDisp && <div className="p-8 text-center text-red-400 bg-slate-800/50 rounded-lg">Error al cargar la disponibilidad.</div>}
              {!errorDisp && (
                <div className="p-4 sm:p-6 bg-white rounded-lg border border-gray-200 shadow-sm text-gray-800">
                  <FullCalendar
                    plugins={[timeGridPlugin, interactionPlugin]}
                    headerToolbar={{ left: 'prev,next today', center: 'title', right: 'timeGridWeek,timeGridDay' }}
                    height="auto" initialView="timeGridWeek" events={dataForCalendar}
                    selectable={true} selectMirror={true} select={handleDateSelect}
                    locale="es" buttonText={{ today: 'Hoy', week: 'Semana', day: 'Día' }}
                    timeZone="America/Santiago" slotMinTime="08:00:00" slotMaxTime="20:00:00"
                    allDaySlot={false} 
                    selectOverlap={false} 
                    eventOverlap={false} 
                  />
                </div>
              )}
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Reseñas de Clientes</h3>
              <div className="space-y-6">
                {profile.resenas.length === 0 && <p className="text-slate-400">Este prestador aún no tiene reseñas.</p>}
                {profile.resenas.map(resena => (
                  <div key={resena.id_valoracion} className="flex gap-4 border-b border-slate-700 pb-4 last:border-b-0 last:pb-0">
                    <FaUserCircle className="h-10 w-10 text-slate-600 flex-shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-slate-200">Cliente #{resena.id_autor}</h4>
                        <span className="text-xs text-slate-400">{new Date(resena.fecha_creacion).toLocaleDateString('es-CL')}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        {[...new Array(5)].map((_, i) => (
                          <FaStar key={`star-${i}`} className={i < (resena.puntaje || 0) ? 'text-yellow-400' : 'text-slate-600'} />
                        ))}
                      </div>
                      <p className="text-slate-300 mt-2">{resena.comentario || 'Sin comentario.'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        <Dialog open={!!selectionToBook} onOpenChange={(isOpen: boolean) => !isOpen && handleCloseModal()}>
          <DialogContent className="bg-slate-900 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle>Agendar Cita</DialogTitle>
              <DialogDescription className="text-slate-400">
                Vas a solicitar una cita para el:
                <p className="font-medium text-amber-400 mt-2">
                  {selectionToBook?.start.toLocaleString('es-CL', { dateStyle: 'full', timeStyle: 'short', timeZone: 'America/Santiago' })}
                </p>
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onCitaSubmit)} className="grid gap-4 py-4">
              <div>
                <Label htmlFor="detalles" className="mb-1">Breve descripción del trabajo</Label>
                <Textarea
                  id="detalles" rows={3}
                  className={`input-base ${errors.detalles ? 'border-red-500' : 'border-slate-700'}`}
                  {...register("detalles")}
                  placeholder="Ej: Reparar filtración en lavaplatos..."
                />
                {errors.detalles && <p className="mt-1 text-sm text-red-400">{errors.detalles.message}</p>}
              </div>
              <DialogFooter>
                <Button type="button" variant="secondary" onClick={handleCloseModal}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  variant="default" 
                  className="bg-amber-400 text-slate-900 hover:bg-amber-400/90"
                  disabled={isSubmitting || createCitaMutation.isPending}
                >
                  {isSubmitting || createCitaMutation.isPending ? "Enviando..." : "Confirmar Cita"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}