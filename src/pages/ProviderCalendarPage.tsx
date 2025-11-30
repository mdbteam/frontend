import { useMemo, useState } from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import { FaTrash, FaCheckCircle, FaBan, FaClock, FaUser, FaInfoCircle, FaCalendarDay, FaSpinner } from 'react-icons/fa'; 

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { type EventClickArg, type DateSelectArg, type EventInput, type EventContentArg } from "@fullcalendar/core";
import esLocale from '@fullcalendar/core/locales/es';

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '../components/ui/dialog';
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogAction
} from '../components/ui/alert-dialog'; 
import { InfoDialog } from "../components/ui/InfoDialog";
import { Button } from "../components/ui/button";

// --- INTERFACES ---
interface CitaDetail { 
    id_cita: number; 
    fecha_hora_cita: string; 
    detalles: string | null; 
    estado: string; 
    cliente_nombres?: string;
    servicio?: string;
}
interface DisponibilidadPrivada { id_disponibilidad: number; hora_inicio: string; hora_fin: string; es_bloqueo: boolean; }
interface DisponibilidadCreate { hora_inicio: string; hora_fin: string; es_bloqueo: boolean; }

// --- API ---
const apiCalendario = axios.create({ baseURL: 'https://calendario-service-u5f6.onrender.com' });

const fetchMyCitas = async (token: string | null) => {
  if (!token) throw new Error("No estás autenticado");
  return (await apiCalendario.get<CitaDetail[]>("/citas/me", { headers: { Authorization: `Bearer ${token}` } })).data;
};
const fetchMyDisponibilidad = async (token: string | null) => {
  if (!token) throw new Error("No estás autenticado");
  return (await apiCalendario.get<DisponibilidadPrivada[]>("/disponibilidad/me", { headers: { Authorization: `Bearer ${token}` } })).data;
};
const createDisponibilidad = async ({ payload, token }: { payload: DisponibilidadCreate; token: string | null; }) => {
  return apiCalendario.post("/disponibilidad", payload, { headers: { Authorization: `Bearer ${token}` } });
};
const deleteDisponibilidad = async ({ id, token }: { id: number; token: string | null }) => {
  return apiCalendario.delete(`/disponibilidad/${id}`, { headers: { Authorization: `Bearer ${token}` } });
};

// --- RENDERIZADO DE EVENTOS (ADAPTADO A FONDO BLANCO) ---
function renderEventContent(eventInfo: EventContentArg) {
  const { type, estado, cliente, detalles } = eventInfo.event.extendedProps;
  const title = eventInfo.event.title;
  
  // 1. Renderizado de CITAS (Estilo Tarjeta Profesional)
  if (type === 'cita') {
    return (
      <div 
        className="w-full h-full flex flex-col justify-start p-2 overflow-hidden border-l-4 border-amber-500 bg-amber-50 hover:bg-amber-100 text-slate-800 transition-colors rounded-r shadow-sm group cursor-pointer"
        title={`Cita: ${title} con ${cliente || 'Cliente'}`} 
      >
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-700 mb-1">
            <FaClock className="w-3 h-3" />
            {eventInfo.timeText}
        </div>
        
        <div className="font-bold text-xs text-slate-900 truncate group-hover:whitespace-normal group-hover:break-words leading-tight">
            {cliente || 'Cliente Reservado'}
        </div>
        
        <div className="text-[10px] text-slate-600 truncate mt-0.5 group-hover:whitespace-normal">
            {detalles || title}
        </div>
        
        <div className="mt-auto pt-1 flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${estado === 'confirmada' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            <span className="text-[9px] font-bold uppercase text-slate-500 tracking-wider">
                {estado}
            </span>
        </div>
      </div>
    );
  }

  // 2. Renderizado de BLOQUEOS Y DISPONIBILIDAD (Estilo Minimalista)
  const isBloqueo = title === "Bloqueado";
  return (
    <div 
        className={`w-full h-full flex flex-col justify-center items-center text-center p-1 border-0 transition-colors cursor-pointer
        ${isBloqueo 
            ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' // Estilo Bloqueo sobre blanco
            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' // Estilo Disponible sobre blanco
        }`}
        title={isBloqueo ? "Horario Bloqueado" : "Horario Disponible"}
    >
        {isBloqueo ? <FaBan size={14} className="mb-1 opacity-70" /> : <FaCheckCircle size={14} className="mb-1 opacity-70" />}
        <span className="text-[10px] font-bold uppercase tracking-wide opacity-90">
            {isBloqueo ? 'Bloqueado' : 'Disp.'}
        </span>
    </div>
  );
}

// --- ESTILOS CSS PERSONALIZADOS PARA FULLCALENDAR (OVERRIDE) ---
// Esto asegura que el calendario se vea bien en blanco sin romper el CSS global
const calendarStyles = `
  .fc {
    --fc-page-bg-color: #ffffff;
    --fc-neutral-bg-color: #f8fafc;
    --fc-list-event-hover-bg-color: #f1f5f9;
    --fc-today-bg-color: #f0f9ff;
    --fc-border-color: #e2e8f0;
    --fc-button-text-color: #0f172a;
    --fc-button-bg-color: #ffffff;
    --fc-button-border-color: #cbd5e1;
    --fc-button-hover-bg-color: #f1f5f9;
    --fc-button-hover-border-color: #94a3b8;
    --fc-button-active-bg-color: #e2e8f0;
    --fc-button-active-border-color: #64748b;
    --fc-event-bg-color: transparent;
    --fc-event-border-color: transparent;
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  }
  .fc-theme-standard td, .fc-theme-standard th {
    border-color: #e2e8f0;
  }
  .fc-col-header-cell-cushion {
    color: #334155; /* Slate 700 */
    font-weight: 700;
    text-transform: uppercase;
    font-size: 0.85rem;
    padding: 8px 0;
  }
  .fc-timegrid-slot-label-cushion {
    color: #64748b; /* Slate 500 */
    font-size: 0.85rem;
  }
  .fc-toolbar-title {
    color: #0f172a; /* Slate 900 */
    font-weight: 800 !important;
    font-size: 1.5rem !important;
  }
  .fc-button {
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    font-weight: 600 !important;
    text-transform: capitalize;
  }
  .fc-button:focus {
    box-shadow: 0 0 0 2px #cbd5e1 !important;
  }
`;

// --- COMPONENTE PRINCIPAL ---
export default function ProviderCalendarPage() {
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();
  
  const [selectedRange, setSelectedRange] = useState<DateSelectArg | null>(null);
  const [selectedCita, setSelectedCita] = useState<CitaDetail | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ id: string; type: string } | null>(null);
  const [modalInfo, setModalInfo] = useState({ isOpen: false, title: "", description: "", type: "success" as "success" | "error" });

  const { data: citas, isLoading: loadingCitas } = useQuery({ queryKey: ["myCitas"], queryFn: () => fetchMyCitas(token) });
  const { data: disponibilidad, isLoading: loadingDisp } = useQuery({ queryKey: ["myDisponibilidad"], queryFn: () => fetchMyDisponibilidad(token) });

  const manageMutation = useMutation({
    mutationFn: createDisponibilidad,
    onSuccess: () => { 
        queryClient.invalidateQueries({ queryKey: ["myDisponibilidad"] }); 
        setModalInfo({ isOpen: true, title: "Agenda Actualizada", description: "El horario se ha guardado correctamente.", type: "success" }); 
    },
    onError: () => setModalInfo({ isOpen: true, title: "Error", description: "No se pudo guardar el horario. Intenta nuevamente.", type: "error" }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDisponibilidad,
    onSuccess: () => { 
        queryClient.invalidateQueries({ queryKey: ["myDisponibilidad"] }); 
        setModalInfo({ isOpen: true, title: "Horario Eliminado", description: "El bloque ha sido removido.", type: "success" }); 
    },
    onError: () => setModalInfo({ isOpen: true, title: "Error", description: "No se pudo eliminar el bloque.", type: "error" }),
  });

  const dataForCalendar = useMemo<EventInput[]>(() => {
    const evCitas = (citas || []).map(c => {
        return {
            id: `cita-${c.id_cita}`,
            title: c.detalles || "Servicio Agendado",
            start: c.fecha_hora_cita,
            end: new Date(new Date(c.fecha_hora_cita).getTime() + 60*60*1000).toISOString(), 
            // Los colores se manejan en renderEventContent, aquí ponemos transparente
            backgroundColor: "transparent", 
            borderColor: "transparent",
            className: "z-20", 
            extendedProps: { 
                type: 'cita', 
                data: c, 
                estado: c.estado,
                cliente: c.cliente_nombres,
                detalles: c.detalles 
            }
        };
    });

    const evDisp = (disponibilidad || []).map(b => ({
      id: `disp-${b.id_disponibilidad}`,
      title: b.es_bloqueo ? "Bloqueado" : "Disponible",
      start: b.hora_inicio,
      end: b.hora_fin,
      // Usamos transparent porque renderEventContent controla el fondo completo
      backgroundColor: "transparent", 
      borderColor: "transparent",
      className: "z-10",
      extendedProps: { type: 'gestion', apiId: b.id_disponibilidad }
    }));

    return [...evCitas, ...evDisp];
  }, [citas, disponibilidad]);

  const handleEventClick = (info: EventClickArg) => {
    const props = info.event.extendedProps;
    if (props.type === 'cita') {
        setSelectedCita(props.data);
    } else if (props.type === 'gestion') {
        setSelectedSlot({ id: props.apiId, type: info.event.title });
    }
  };

  const handleDateSelect = (info: DateSelectArg) => { 
      const now = new Date();
      const selectedStart = new Date(info.start);
      
      if (selectedStart < now) {
          info.view.calendar.unselect();
          setModalInfo({ 
              isOpen: true, 
              title: "Acción Inválida", 
              description: "No puedes gestionar horarios en el pasado.", 
              type: "error" 
          });
          return;
      }

      info.view.calendar.unselect(); 
      setSelectedRange(info); 
  };

  const handleConfirmRange = (esBloqueo: boolean) => {
    if (!selectedRange) return;
    manageMutation.mutate({ payload: { hora_inicio: selectedRange.startStr, hora_fin: selectedRange.endStr, es_bloqueo: esBloqueo }, token });
    setSelectedRange(null);
  };

  const handleDeleteSlot = () => {
    if (!selectedSlot) return;
    deleteMutation.mutate({ id: Number(selectedSlot.id), token });
    setSelectedSlot(null);
  };

  if (loadingCitas || loadingDisp) return <div className="flex justify-center items-center h-96 text-cyan-400 bg-slate-950"><FaSpinner className="animate-spin text-4xl" /></div>;

  return (
    <div className="p-4 sm:p-8 bg-slate-950 min-h-screen text-slate-200 font-sans">
      <style>{calendarStyles}</style>
      <InfoDialog isOpen={modalInfo.isOpen} onClose={() => setModalInfo({ ...modalInfo, isOpen: false })} title={modalInfo.title} description={modalInfo.description} type={modalInfo.type} />
      
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* HEADER DE LA PÁGINA */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-800 pb-6">
            <div>
                <h1 className="text-3xl font-bold text-white font-poppins">Mi Agenda</h1>
                <p className="mt-2 text-slate-400 max-w-xl text-sm">
                    Gestiona tu disponibilidad. Arrastra en los espacios blancos para definir horarios.
                </p>
            </div>
            {/* LEYENDA ADAPTADA A LOS NUEVOS COLORES */}
            <div className="flex flex-wrap gap-3 text-xs font-medium">
                <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800">
                    <div className="w-3 h-3 rounded-full bg-emerald-400"></div> Disponible
                </div>
                <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800">
                    <div className="w-3 h-3 rounded-full bg-slate-400"></div> Bloqueado
                </div>
                <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800">
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div> Cita
                </div>
            </div>
        </div>
        
        {/* CONTENEDOR DEL CALENDARIO - AHORA BLANCO */}
        <div className="bg-white rounded-xl border border-slate-700 shadow-2xl overflow-hidden p-1">
          <div className="rounded-lg overflow-hidden">
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                headerToolbar={{ left: "prev,next today", center: "title", right: "dayGridMonth,timeGridWeek,timeGridDay" }}
                height="auto" 
                initialView="timeGridWeek" 
                events={dataForCalendar}
                editable={false} 
                selectable 
                selectMirror 
                dayMaxEvents 
                weekends
                select={handleDateSelect} 
                eventClick={handleEventClick} 
                locale={esLocale} 
                slotMinTime="07:00:00" 
                slotMaxTime="22:00:00" 
                firstDay={1} 
                allDaySlot={false}
                eventContent={renderEventContent} 
                // Añadimos clases para mejorar el espaciado
                contentHeight="auto"
                aspectRatio={1.8}
            />
          </div>
        </div>
      </div>

      {/* DIALOGOS (Mantienen el tema oscuro de la app para consistencia) */}
      <Dialog open={!!selectedRange} onOpenChange={(o) => !o && setSelectedRange(null)}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white w-[95%] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl"><FaClock className="text-cyan-400"/> Definir Horario</DialogTitle>
            <DialogDescription className="text-slate-400 mt-2">
                Rango seleccionado:<br/>
                <span className="text-white font-mono text-base font-semibold block mt-1 p-2 bg-slate-800 rounded text-center">
                    {selectedRange?.start.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - {selectedRange?.end.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-6 w-full">
            <Button variant="ghost" onClick={() => setSelectedRange(null)} className="w-full sm:w-auto text-slate-400 hover:text-white order-3 sm:order-1">Cancelar</Button>
            <Button 
                onClick={() => handleConfirmRange(true)} 
                className="w-full sm:w-auto bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 order-2"
            >
                Bloquear
            </Button>
            <Button 
                onClick={() => handleConfirmRange(false)} 
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white order-1"
            >
                Marcar Disponible
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!selectedSlot} onOpenChange={(o) => !o && setSelectedSlot(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-700 text-white w-[95%] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-400 flex items-center gap-2">
                <FaTrash /> Eliminar Espacio
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              ¿Deseas eliminar este bloque de <strong>{selectedSlot?.type === 'Bloqueado' ? 'bloqueo' : 'disponibilidad'}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
            <AlertDialogCancel onClick={() => setSelectedSlot(null)} className="bg-transparent text-slate-300 border-slate-700 hover:bg-slate-800 w-full sm:w-auto mt-0">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSlot} className="bg-red-600 hover:bg-red-700 text-white border-0 w-full sm:w-auto">
                Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!selectedCita} onOpenChange={(o) => !o && setSelectedCita(null)}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white w-[95%] sm:max-w-lg">
            <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
                    <FaCalendarDay /> Detalles de la Reserva
                </DialogTitle>
            </DialogHeader>
            
            {selectedCita && (
                <div className="space-y-6 py-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-800 p-4 rounded-lg border border-slate-700 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                                <FaUser />
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-xs text-slate-400 uppercase font-bold">Cliente</p>
                                <p className="text-white font-medium truncate">{selectedCita.cliente_nombres || 'Usuario Anónimo'}</p>
                            </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase border self-start sm:self-center ${
                            selectedCita.estado.includes('pendiente') ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                        }`}>
                            {selectedCita.estado}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-slate-950 rounded border border-slate-800">
                            <p className="text-slate-500 text-xs uppercase font-bold">Fecha</p>
                            <p className="text-white font-mono text-lg">{new Date(selectedCita.fecha_hora_cita).toLocaleDateString()}</p>
                        </div>
                        <div className="text-center p-3 bg-slate-950 rounded border border-slate-800">
                            <p className="text-slate-500 text-xs uppercase font-bold">Hora</p>
                            <p className="text-white font-mono text-lg">{new Date(selectedCita.fecha_hora_cita).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                        </div>
                    </div>

                    <div>
                        <p className="text-slate-400 text-sm mb-2 flex items-center gap-2 font-bold"><FaInfoCircle /> Detalle de la solicitud:</p>
                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 italic text-slate-300 text-sm leading-relaxed break-words">
                            "{selectedCita.detalles || 'Sin detalles adicionales'}"
                        </div>
                    </div>
                </div>
            )}

            <DialogFooter>
                <Button onClick={() => setSelectedCita(null)} className="w-full bg-slate-800 hover:bg-slate-700 text-white border border-slate-600">
                    Cerrar
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}