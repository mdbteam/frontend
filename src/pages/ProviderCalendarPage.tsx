import { useMemo, useState } from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import { FaTrash, FaCheckCircle, FaBan, FaClock } from 'react-icons/fa'; 

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { type EventClickArg, type DateSelectArg, type EventInput, type EventContentArg } from "@fullcalendar/core";
import esLocale from '@fullcalendar/core/locales/es';

import {
  AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '../components/ui/alert-dialog'; 
import { InfoDialog } from "../components/ui/InfoDialog";
import { Button } from "../components/ui/button";

interface CitaDetail { id_cita: number; fecha_hora_cita: string; detalles: string | null; estado: string; }
interface DisponibilidadPrivada { id_disponibilidad: number; hora_inicio: string; hora_fin: string; es_bloqueo: boolean; }
interface DisponibilidadCreate { hora_inicio: string; hora_fin: string; es_bloqueo: boolean; }

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

// --- RENDERIZADO PERSONALIZADO (SOLUCIÓN UX) ---
function renderEventContent(eventInfo: EventContentArg) {
  const isBloqueo = eventInfo.event.title.includes('Bloqueado');
  const isDisponible = eventInfo.event.title.includes('Disponible');
  const isCita = !isBloqueo && !isDisponible;

  return (
    <div className="w-full h-full flex flex-col justify-center items-center px-1 overflow-hidden text-center">
      {/* Icono + Hora */}
      <div className="flex items-center justify-center gap-1 text-[9px] font-bold opacity-90 mb-0.5">
        {isDisponible && <FaCheckCircle className="w-2 h-2" />}
        {isBloqueo && <FaBan className="w-2 h-2" />}
        {isCita && <FaClock className="w-2 h-2" />}
        {eventInfo.timeText}
      </div>
      {/* Título */}
      <div className="text-[10px] font-bold leading-tight truncate w-full">
        {isDisponible ? 'DISPONIBLE' : isBloqueo ? 'BLOQUEADO' : eventInfo.event.title}
      </div>
    </div>
  );
}

export default function ProviderCalendarPage() {
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();
  const [selectedRange, setSelectedRange] = useState<DateSelectArg | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventInput | null>(null);
  const [modalInfo, setModalInfo] = useState({ isOpen: false, title: "", description: "", type: "success" as "success" | "error" });

  const { data: citas, isLoading: loadingCitas } = useQuery({ queryKey: ["myCitas"], queryFn: () => fetchMyCitas(token) });
  const { data: disponibilidad, isLoading: loadingDisp } = useQuery({ queryKey: ["myDisponibilidad"], queryFn: () => fetchMyDisponibilidad(token) });

  const manageMutation = useMutation({
    mutationFn: createDisponibilidad,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["myDisponibilidad"] }); setModalInfo({ isOpen: true, title: "Horario Actualizado", description: "Agenda guardada.", type: "success" }); },
    onError: () => setModalInfo({ isOpen: true, title: "Error", description: "No se pudo guardar.", type: "error" }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDisponibilidad,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["myDisponibilidad"] }); setModalInfo({ isOpen: true, title: "Horario Eliminado", description: "Bloque eliminado.", type: "success" }); },
    onError: () => setModalInfo({ isOpen: true, title: "Error", description: "No se pudo eliminar.", type: "error" }),
  });

  const dataForCalendar = useMemo<EventInput[]>(() => {
    const evCitas = (citas || []).map(c => ({
      id: `cita-${c.id_cita}`, title: c.detalles || `Cita ${c.estado}`, start: c.fecha_hora_cita,
      backgroundColor: c.estado.toLowerCase().includes("pendiente") ? "#f59e0b" : "#e11d48",
      className: "shadow-sm cursor-pointer border-0", extendedProps: { type: 'cita' }
    }));
    const evDisp = (disponibilidad || []).map(b => ({
      id: `disp-${b.id_disponibilidad}`, title: b.es_bloqueo ? "Bloqueado" : "Disponible", start: b.hora_inicio, end: b.hora_fin,
      backgroundColor: b.es_bloqueo ? "#64748b" : "#10b981",
      className: "shadow-sm cursor-pointer border-0", extendedProps: { type: 'gestion', apiId: b.id_disponibilidad }
    }));
    return [...evCitas, ...evDisp];
  }, [citas, disponibilidad]);

  const handleEventClick = (info: EventClickArg) => setSelectedEvent(info.event.toPlainObject() as EventInput);
  const handleDateSelect = (info: DateSelectArg) => { info.view.calendar.unselect(); setSelectedRange(info); };
  const handleConfirm = (esBloqueo: boolean) => {
    if (!selectedRange) return;
    manageMutation.mutate({ payload: { hora_inicio: selectedRange.startStr, hora_fin: selectedRange.endStr, es_bloqueo: esBloqueo }, token });
    setSelectedRange(null);
  };
  const handleDelete = () => {
    if (selectedEvent?.extendedProps?.type !== 'gestion') return;
    deleteMutation.mutate({ id: selectedEvent.extendedProps.apiId as number, token });
    setSelectedEvent(null);
  };

  if (loadingCitas || loadingDisp) return <p className="text-center text-slate-300 mt-10">Cargando agenda...</p>;

  return (
    <div className="p-4 sm:p-8">
      <InfoDialog isOpen={modalInfo.isOpen} onClose={() => setModalInfo({ ...modalInfo, isOpen: false })} title={modalInfo.title} description={modalInfo.description} type={modalInfo.type} />
      <div className="mx-auto max-w-6xl">
        <div className="mb-8"><h1 className="text-4xl font-bold text-white font-poppins">Mi Agenda</h1><p className="mt-2 text-slate-300">Arrastra para abrir o bloquear horarios. Haz clic en un bloque para eliminarlo.</p></div>
        
        <div className="p-4 sm:p-6 bg-white rounded-lg border border-gray-200 shadow-sm text-gray-800">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{ left: "prev,next today", center: "title", right: "dayGridMonth,timeGridWeek,timeGridDay" }}
            height="auto" initialView="timeGridWeek" events={dataForCalendar}
            editable={false} selectable selectMirror dayMaxEvents weekends
            select={handleDateSelect} eventClick={handleEventClick}
            locale={esLocale} slotMinTime="08:00:00" slotMaxTime="20:00:00" firstDay={1} allDaySlot={false}
            eventContent={renderEventContent} // 👈 AQUÍ SE APLICA EL DISEÑO MEJORADO
          />
        </div>
      </div>

      <AlertDialog open={!!selectedRange} onOpenChange={(o) => !o && setSelectedRange(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-700 text-white">
          <AlertDialogHeader><AlertDialogTitle>Gestionar Horario</AlertDialogTitle><AlertDialogDescription className="text-slate-400">Define este bloque: <strong>{selectedRange?.start.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - {selectedRange?.end.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</strong></AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedRange(null)} className="bg-transparent text-slate-300 border-slate-700">Cancelar</AlertDialogCancel>
            <Button variant="destructive" onClick={() => handleConfirm(true)}>Bloquear (No disponible)</Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleConfirm(false)}>Marcar Disponible</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!selectedEvent} onOpenChange={(o) => !o && setSelectedEvent(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-700 text-white">
          <AlertDialogHeader><AlertDialogTitle>Opciones de Bloque</AlertDialogTitle><AlertDialogDescription className="text-slate-400">¿Qué deseas hacer con este horario?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedEvent(null)} className="bg-transparent text-slate-300 border-slate-700">Cerrar</AlertDialogCancel>
            {selectedEvent?.extendedProps?.type === 'gestion' && <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}><FaTrash className="mr-2" /> Eliminar</Button>}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}