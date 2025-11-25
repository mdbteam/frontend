import { useMemo, useState, useEffect } from 'react';
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
import { type DateSelectArg, type EventInput, type EventContentArg } from '@fullcalendar/core';
import esLocale from '@fullcalendar/core/locales/es';
import { FaUserCircle, FaSpinner, FaStar, FaClock } from 'react-icons/fa';

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
  duracion_min: z.number().min(30, "La duración mínima es 30 min.").optional(), 
});

type CitaFormInputs = z.infer<typeof citaSchema>;

// --- INTERFACES ---
interface PerfilDetalle { id_usuario: number; nombres: string; primer_apellido: string; foto_url: string; genero: string | null; fecha_nacimiento: string | null; biografia: string | null; resumen_profesional: string | null; anos_experiencia: number | null; }
interface Experiencia { id_experiencia: number; id_usuario: number; cargo: string; descripcion: string; fecha_inicio: string; fecha_fin: string | null; }
interface Resena { id_valoracion: number; id_autor: number; id_evaluado: number; rol_autor: string; puntaje: number | null; comentario: string | null; fecha_creacion: string; }
interface PrestadorPublicoDetalle { id_usuario: number; nombres: string; primer_apellido: string; segundo_apellido: string | null; foto_url: string; oficios: string[]; puntuacion_promedio: number; trabajos_realizados: number; perfil: PerfilDetalle | null; portafolio: string[]; experiencia: Experiencia[]; resenas: Resena[]; }

interface CitaDetail { id_cita: number; id_prestador: number; fecha_hora_cita: string; detalles: string | null; estado: string; }
interface BloquePublico { hora_inicio: string; hora_fin: string; estado: string; }
interface CreateCitaPayload { id_prestador: number; fecha_hora_cita: string; duracion_min: number; detalles: string; }

// --- API ---
const apiProveedores = axios.create({ baseURL: 'https://provider-service-mjuj.onrender.com' });
const apiCalendario = axios.create({ baseURL: 'https://calendario-service-u5f6.onrender.com' });

const fetchPrestadorProfile = async (id: string) => (await apiProveedores.get<PrestadorPublicoDetalle>(`/prestadores/${id}`)).data;
const fetchPrestadorDisponibilidad = async (id: string) => (await apiCalendario.get<BloquePublico[]>(`/prestadores/${id}/disponibilidad`)).data;
const fetchMyCitas = async (token: string | null) => {
  if (!token) throw new Error("No estás autenticado");
  return (await apiCalendario.get<CitaDetail[]>("/citas/me", { headers: { Authorization: `Bearer ${token}` } })).data;
};
const createCita = async ({ payload, token }: { payload: CreateCitaPayload, token: string | null }) => {
  if (!token) throw new Error('Debes iniciar sesión.');
  return apiCalendario.post('/citas', payload, { headers: { Authorization: `Bearer ${token}` } });
};

// --- RENDERIZADO PERSONALIZADO ---
function renderEventContent(eventInfo: EventContentArg) {
  if (eventInfo.event.display === 'background') return <></>;

  return (
    <div className="w-full h-full flex flex-col justify-center px-1 overflow-hidden leading-tight bg-transparent">
      <div className="flex items-center gap-1 text-[9px] font-semibold opacity-90 text-white">
        <FaClock className="w-2 h-2" />
        {eventInfo.timeText}
      </div>
      <div className="text-[10px] font-bold truncate mt-0.5 text-white">
        {eventInfo.event.title}
      </div>
    </div>
  );
}

export default function PrestadorDetailPage() {
  const { id } = useParams<{ id: string }>();
  if (!id) throw new Error("ID no encontrado");
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { token, isAuthenticated, user } = useAuthStore();
  
  const [selectionToBook, setSelectionToBook] = useState<DateSelectArg | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [modalInfo, setModalInfo] = useState<{ isOpen: boolean; title: string; description: string; type: 'success' | 'error' | 'info' }>({ isOpen: false, title: '', description: '', type: 'info' });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CitaFormInputs>({
    resolver: zodResolver(citaSchema),
    defaultValues: { detalles: "", duracion_min: 60 }
  });

  const { data: profile, isLoading: isLoadingProfile, error: errorProfile } = useQuery({ 
    queryKey: ['prestadorProfile', id], 
    queryFn: () => fetchPrestadorProfile(id), 
    enabled: !!id 
  });

  const { data: disponibilidad, isLoading: isLoadingDisp, error: errorDisp } = useQuery({ 
    queryKey: ['prestadorDisponibilidad', id], 
    queryFn: () => fetchPrestadorDisponibilidad(id), 
    enabled: !!id 
  });

  const { data: misCitas, isLoading: isLoadingCitas } = useQuery({ 
    queryKey: ['myCitas'], 
    queryFn: () => fetchMyCitas(token), 
    enabled: isAuthenticated && !!id 
  });

  const createCitaMutation = useMutation({
    mutationFn: createCita,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prestadorDisponibilidad', id] });
      queryClient.invalidateQueries({ queryKey: ['myCitas'] });
      handleCloseModal();
      setModalInfo({ isOpen: true, title: '¡Cita Solicitada!', description: 'Solicitud enviada correctamente.', type: 'success' });
    },
    onError: () => setModalInfo({ isOpen: true, title: 'Error', description: 'No se pudo agendar.', type: 'error' })
  });

  const esMiPerfil = !!user && profile?.id_usuario.toString() === user.id;
  useEffect(() => { if (esMiPerfil) navigate('/calendario', { replace: true }); }, [esMiPerfil, navigate]);

  // --- LÓGICA DE CALENDARIO SIN DUPLICADOS ---
  const dataForCalendar = useMemo((): EventInput[] => {
    const prestadorIdNum = Number.parseInt(id, 10);
    
    // 1. Procesamos Mis Citas primero
    const misEventos = (misCitas || [])
      .filter(cita => cita.id_prestador === prestadorIdNum)
      .map(cita => ({
        id: `cita-${cita.id_cita}`,
        title: `Mi Cita (${cita.estado})`,
        start: cita.fecha_hora_cita,
        // Si el backend no envía fin, asumimos 1 hora para visualización correcta
        end: new Date(new Date(cita.fecha_hora_cita).getTime() + 60 * 60000).toISOString(),
        backgroundColor: '#f59e0b',
        borderColor: '#d97706',
        className: "z-10 shadow-md",
        extendedProps: { tipo: 'micita' }
      }));

    // 2. Creamos un Set con las horas de inicio de mis citas para filtrar duplicados
    // Convertimos a string ISO exacto para comparar
    const misHorariosOcupados = new Set(misEventos.map(e => new Date(e.start as string).toISOString()));

    // 3. Procesamos la Disponibilidad del Proveedor
    const eventosDisponibilidad = (disponibilidad || [])
        .filter(slot => {
            // FILTRO MÁGICO: Si este bloque empieza a la misma hora que una de mis citas,
            // NO lo mostramos (porque mi cita es más importante y ya sale arriba).
            const slotStartIso = new Date(slot.hora_inicio).toISOString();
            return !misHorariosOcupados.has(slotStartIso);
        })
        .map((slot, index) => {
            const esDisponible = slot.estado.toLowerCase() === 'disponible';
            return {
                id: `slot-${index}`,
                display: esDisponible ? 'background' : 'block',
                title: esDisponible ? '' : 'Ocupado',
                start: slot.hora_inicio,
                end: slot.hora_fin,
                backgroundColor: esDisponible ? '#10b981' : '#475569',
                className: esDisponible ? "cursor-pointer opacity-40 hover:opacity-60" : "cursor-not-allowed opacity-80",
                extendedProps: { tipo: 'slot', estado: slot.estado }
            };
        });

    return [...eventosDisponibilidad, ...misEventos];
  }, [disponibilidad, misCitas, id]);

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    selectInfo.view.calendar.unselect();
    if (esMiPerfil) return;
    if (!isAuthenticated) { setModalInfo({ isOpen: true, title: 'Acción Requerida', description: 'Inicia sesión para agendar.', type: 'info' }); return; }
    
    const allEvents = selectInfo.view.calendar.getEvents();
    
    // Validación: DENTRO de verde, FUERA de sólido
    const bloqueDisponible = allEvents.find(e => e.extendedProps.tipo === 'slot' && e.extendedProps.estado === 'disponible' && e.start && e.end && e.start <= selectInfo.start && e.end >= selectInfo.end);
    const conflicto = allEvents.find(e => e.extendedProps.tipo !== 'slot' && e.start && e.end && selectInfo.start < e.end && selectInfo.end > e.start);

    if (!bloqueDisponible || conflicto) {
      setModalInfo({ isOpen: true, title: 'Horario No Disponible', description: 'Selecciona un bloque verde libre.', type: 'error' });
      return;
    }
    setSelectionToBook(selectInfo);
  };

  const handleCloseModal = () => { setSelectionToBook(null); reset(); };
  const handleCloseInfoModal = () => { setModalInfo({ ...modalInfo, isOpen: false }); if (!isAuthenticated && modalInfo.type === 'info') navigate('/login'); };
  const onCitaSubmit: SubmitHandler<CitaFormInputs> = (data) => {
    if (!selectionToBook) return;
    createCitaMutation.mutate({ payload: { id_prestador: Number.parseInt(id, 10), fecha_hora_cita: selectionToBook.startStr, detalles: data.detalles, duracion_min: data.duracion_min || 60 }, token });
  };

  const isLoading = isLoadingProfile || isLoadingDisp || (isAuthenticated && isLoadingCitas) || esMiPerfil;
  if (isLoading) return <div className="flex justify-center h-96 items-center"><FaSpinner className="animate-spin text-4xl text-amber-400" /></div>;
  if (errorProfile || !profile) return <div className="text-center p-8 text-red-400">Error cargando perfil.</div>;

  return (
    <>
      <InfoDialog isOpen={modalInfo.isOpen} onClose={handleCloseInfoModal} title={modalInfo.title} description={modalInfo.description} type={modalInfo.type} />
      
      <Dialog open={!!lightboxImage} onOpenChange={(o) => !o && setLightboxImage(null)}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-3xl p-1">
          <img src={lightboxImage || ''} alt="Vista ampliada" className="w-full max-h-[80vh] object-contain rounded" />
          <Button variant="ghost" className="absolute top-2 right-2 text-white bg-black/50 hover:bg-black/70" onClick={() => setLightboxImage(null)}>X</Button>
        </DialogContent>
      </Dialog>

      <div className="p-4 sm:p-8 bg-slate-950 min-h-screen text-slate-200">
        <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-6">
            {/* PERFIL CARD */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center shadow-lg">
              {profile.foto_url ? (
                <img src={profile.foto_url} alt={`Foto de ${profile.nombres}`} className="h-32 w-32 rounded-full border-4 border-slate-700 mx-auto object-cover" />
              ) : (
                <FaUserCircle className="h-32 w-32 text-slate-700 mx-auto" />
              )}
              <h1 className="text-2xl font-bold text-white mt-4">{profile.nombres} {profile.primer_apellido}</h1>
              <p className="text-cyan-400 font-medium">{profile.oficios?.[0]}</p>
              <div className="flex justify-center gap-6 mt-6 pt-4 border-t border-slate-800">
                <div className="text-center"><span className="text-xl font-bold text-white flex justify-center gap-1"><FaStar className="text-yellow-400"/> {profile.puntuacion_promedio.toFixed(1)}</span><span className="text-xs text-slate-500 uppercase">Rating</span></div>
                <div className="text-center"><span className="text-xl font-bold text-white">{profile.trabajos_realizados}</span><span className="text-xs text-slate-500 uppercase">Trabajos</span></div>
              </div>
            </div>
            
            {/* INFO EXTRA */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-md">
                <h3 className="text-xs font-bold text-slate-500 uppercase">Biografía</h3>
                <p className="text-sm text-slate-300 leading-relaxed">{profile.perfil?.biografia || 'Sin biografía.'}</p>
                <h3 className="text-xs font-bold text-slate-500 uppercase mt-4">Especialidades</h3>
                <div className="flex flex-wrap gap-2">{(profile.oficios || []).map(c => <span key={c} className="bg-slate-800 text-cyan-300 text-xs px-2 py-1 rounded border border-slate-700">{c}</span>)}</div>
            </div>

            {/* PORTAFOLIO */}
            {profile.portafolio.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="text-xs font-bold text-slate-500 uppercase mb-4">Portafolio</h3>
                <div className="grid grid-cols-2 gap-2">
                  {profile.portafolio.map((imgUrl, idx) => (
                    <button key={imgUrl} onClick={() => setLightboxImage(imgUrl)} className="focus:outline-none focus:ring-2 focus:ring-amber-400 rounded-md overflow-hidden">
                      <img src={imgUrl} alt={`Trabajo ${idx + 1}`} className="object-cover w-full h-24 hover:opacity-80 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* CALENDARIO */}
          <div className="md:col-span-2 space-y-8">
            <div>
              <div className="mb-4 border-b border-slate-800 pb-4">
                <h2 className="text-2xl font-bold text-white">Agenda Disponible</h2>
                <p className="text-slate-400 text-sm mt-1">Haz clic o arrastra sobre los bloques <span className="text-emerald-400 font-bold">verdes</span> para solicitar una hora.</p>
              </div>
              
              {errorDisp ? (
                <div className="p-6 bg-red-900/20 border border-red-800 rounded-lg text-center">
                  <p className="text-red-400 font-bold">No se pudo cargar la disponibilidad.</p>
                </div>
              ) : (
                <div className="p-4 bg-white rounded-xl shadow-xl text-slate-900 overflow-hidden border border-slate-200">
                  <FullCalendar
                    plugins={[timeGridPlugin, interactionPlugin]}
                    headerToolbar={{ left: 'prev,next today', center: 'title', right: 'timeGridWeek,timeGridDay' }}
                    height="auto" initialView="timeGridWeek" events={dataForCalendar}
                    selectable={true} selectMirror={true} select={handleDateSelect}
                    locale={esLocale} slotMinTime="08:00:00" slotMaxTime="20:00:00" allDaySlot={false}
                    selectOverlap={true} eventOverlap={false} slotDuration="00:30:00"
                    eventContent={renderEventContent}
                  />
                </div>
              )}
            </div>

            {/* RESEÑAS */}
            <div>
                <h3 className="text-xl font-bold text-white mb-4">Opiniones Recientes</h3>
                <div className="space-y-4">
                    {profile.resenas.length === 0 && <p className="text-slate-500 italic">Aún no hay reseñas.</p>}
                    {profile.resenas.map(r => (
                        <div key={r.id_valoracion} className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                    <div className="bg-slate-800 p-1 rounded-full"><FaUserCircle className="text-slate-600"/></div>
                                    <span className="font-bold text-sm text-slate-300">Cliente #{r.id_autor}</span>
                                </div>
                                <span className="text-xs text-slate-600">{new Date(r.fecha_creacion).toLocaleDateString()}</span>
                            </div>
                            <div className="flex gap-1 my-2">
                                {[...Array(5)].map((_, i) => <FaStar key={i} className={i < (r.puntaje||0) ? "text-yellow-500 text-xs" : "text-slate-700 text-xs"} />)}
                            </div>
                            <p className="text-sm text-slate-400">{r.comentario}</p>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        </div>

        <Dialog open={!!selectionToBook} onOpenChange={(o) => !o && handleCloseModal()}>
          <DialogContent className="bg-slate-900 border-slate-800 text-white">
            <DialogHeader><DialogTitle className="text-cyan-400">Confirmar Cita</DialogTitle><DialogDescription>Estás agendando para el <span className="text-white font-bold">{selectionToBook?.start.toLocaleString('es-CL')}</span></DialogDescription></DialogHeader>
            <form onSubmit={handleSubmit(onCitaSubmit)} className="space-y-4 pt-4">
              <div><Label>Detalles</Label><Textarea {...register("detalles")} className="bg-slate-950 border-slate-700 mt-1" placeholder="Describe el trabajo..." />{errors.detalles && <p className="text-red-400 text-xs">{errors.detalles.message}</p>}</div>
              <div><Label>Duración (min)</Label><input type="number" step="30" className="w-full bg-slate-950 border border-slate-700 text-white rounded p-2 mt-1" {...register("duracion_min", { valueAsNumber: true })} /></div>
              <DialogFooter><Button variant="ghost" onClick={handleCloseModal}>Cancelar</Button><Button type="submit" className="bg-cyan-600 hover:bg-cyan-500" disabled={isSubmitting}>Confirmar</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}