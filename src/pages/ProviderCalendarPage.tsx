import { useMemo, useState } from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { type EventClickArg, type DateSelectArg, type EventInput } from "@fullcalendar/core";

// Importar los componentes de tu AlertDialog
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog'; // (Ajusta la ruta si es necesario)

// --- (Tipos de Datos de la API) ---
interface CitaDetail {
  id_cita: number;
  fecha_hora_cita: string;
  detalles: string | null;
  estado: string;
}

interface DisponibilidadDetail {
  id: number;
  fecha_hora_inicio: string;
  fecha_hora_fin: string;
}

// --- (Funciones de Fetching) ---
const fetchMyCitas = async (token: string | null) => {
  if (!token) throw new Error("No estás autenticado");
  const { data } = await axios.get<CitaDetail[]>("/api/calendario/citas/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

const fetchMyDisponibilidad = async (token: string | null) => {
  if (!token) throw new Error("No estás autenticado");
  const { data } = await axios.get<DisponibilidadDetail[]>("/api/calendario/disponibilidad/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

const createDisponibilidad = async ({
  start,
  end,
  token,
}: {
  start: string;
  end: string;
  token: string | null;
}) => {
  if (!token) throw new Error("No estás autenticado");
  const payload = { fecha_hora_inicio: start, fecha_hora_fin: end };
  return axios.post("/api/calendario/disponibilidad", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// --- (Componente Principal) ---
function ProviderCalendarPage() {
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();

  // Estados para manejar los modales
  const [selectedRange, setSelectedRange] = useState<DateSelectArg | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<{ title: string; start: string; end?: string } | null>(null);

  const { data: citas, isLoading: isLoadingCitas } = useQuery({
    queryKey: ["myCitas"],
    queryFn: () => fetchMyCitas(token),
  });

  const { data: disponibilidad, isLoading: isLoadingDisp } = useQuery({
    queryKey: ["myDisponibilidad"],
    queryFn: () => fetchMyDisponibilidad(token),
    retry: (failureCount, error) => {
      if (axios.isAxiosError(error) && error.response?.status === 404) return false;
      return failureCount < 3;
    },
  });

  const createBlockMutation = useMutation({
    mutationFn: createDisponibilidad,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["myDisponibilidad"] }),
    onError: (err) => {
      console.error("Error al crear bloqueo:", err);
      // TODO: Reemplazar este alert con el InfoDialog
      alert("No se pudo crear el bloqueo. Intenta de nuevo.");
    },
  });

  const dataForCalendar = useMemo<EventInput[]>(() => {
    const eventosCitas: EventInput[] = (citas || []).map((cita) => ({
      id: `cita-${cita.id_cita}`,
      title: cita.detalles || `Cita ${cita.estado}`,
      start: cita.fecha_hora_cita,
      allDay: false,
      backgroundColor: cita.estado === "pendiente" ? "#f59e0b" : "#10b981",
      borderColor: cita.estado === "pendiente" ? "#f59e0b" : "#10b981",
      className: "shadow-sm transition-all duration-200 hover:brightness-110 cursor-pointer",
    }));

    const eventosDisponibilidad: EventInput[] = (disponibilidad || []).map((block) => ({
      id: `disp-${block.id}`,
      title: "Horario Bloqueado",
      start: block.fecha_hora_inicio,
      end: block.fecha_hora_fin,
      allDay: false,
      backgroundColor: "#64748b",
      borderColor: "#64748b",
      className: "shadow-sm transition-all duration-200 hover:brightness-110 cursor-pointer",
    }));

    return [...eventosCitas, ...eventosDisponibilidad];
  }, [citas, disponibilidad]);

  const handleEventClick = (clickInfo: EventClickArg) => {
    setSelectedEvent({
      title: clickInfo.event.title,
      start: clickInfo.event.startStr,
      end: clickInfo.event.endStr || undefined,
    });
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    selectInfo.view.calendar.unselect();
    setSelectedRange(selectInfo); // <-- Abre el modal
  };

  const handleConfirmBlock = () => {
    if (!selectedRange) return;
    createBlockMutation.mutate({ start: selectedRange.startStr, end: selectedRange.endStr, token });
    setSelectedRange(null); // Cierra el modal
  };

  const isLoading = isLoadingCitas || isLoadingDisp;

  return (
    <div className="p-4 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white font-poppins [text-shadow:0_0_15px_rgba(34,211,2HOLA,0.4)]">
            Mi Agenda
          </h1>
          <p className="mt-2 text-slate-300">
            Gestiona tus citas y disponibilidad. Haz clic o arrastra en el calendario para bloquear horas.
          </p>
        </div>

        {isLoading && <p className="text-center text-slate-300">Cargando agenda...</p>}

        <div className="p-4 sm:p-6 bg-white rounded-lg border border-gray-200 shadow-sm text-gray-800">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{ left: "prev,next today", center: "title", right: "dayGridMonth,timeGridWeek,timeGridDay" }}
            height="auto"
            initialView="timeGridWeek"
            events={dataForCalendar}
            editable
            selectable
            selectMirror
            dayMaxEvents
            weekends
            select={handleDateSelect}
            eventClick={handleEventClick}
            locale="es"
            buttonText={{ today: "Hoy", month: "Mes", week: "Semana", day: "Día" }}
            timeZone="America/Santiago"
            slotMinTime="08:00:00"
            slotMaxTime="20:00:00"
            firstDay={1}
          />
        </div>
      </div>

      {/* Modal de "Bloquear Rango" */}
      <AlertDialog open={!!selectedRange} onOpenChange={(isOpen) => !isOpen && setSelectedRange(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Bloquear horario</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              ¿Deseas bloquear este horario para no recibir citas?
              <br />
              <strong>Desde:</strong> {selectedRange?.start.toLocaleString('es-CL', { timeZone: 'America/Santiago' })}
              <br />
              <strong>Hasta:</strong> {selectedRange?.end.toLocaleString('es-CL', { timeZone: 'America/Santiago' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedRange(null)} className="bg-transparent text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmBlock} className="bg-cyan-500 text-slate-900 hover:bg-cyan-400">
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de "Ver Evento" */}
      <AlertDialog open={!!selectedEvent} onOpenChange={(isOpen) => !isOpen && setSelectedEvent(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Detalle del evento</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              <strong>Título:</strong> {selectedEvent?.title}
              <br />
              <strong>Inicio:</strong> {selectedEvent?.start}
              {selectedEvent?.end && (
                <>
                  <br />
                  <strong>Fin:</strong> {selectedEvent.end}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedEvent(null)} className="bg-cyan-500 text-slate-900 hover:bg-cyan-400">
              Cerrar
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ProviderCalendarPage;