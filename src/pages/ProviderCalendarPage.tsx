import { useMemo } from 'react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { type EventClickArg, type DateSelectArg, type EventInput } from '@fullcalendar/core';

// --- (Tipos de Datos de la API) ---
interface CitaDetail {
  id_cita: number;
  fecha_hora_cita: string;
  detalles: string | null;
  estado: string; 
}

interface DisponibilidadDetail {
  // Basado en tu API POST, asumimos que un GET devolverá algo así
  id: number; // Necesitamos un ID para que FullCalendar lo maneje
  fecha_hora_inicio: string;
  fecha_hora_fin: string;
}

// --- (Funciones de Fetching) ---
const fetchMyCitas = async (token: string | null) => {
  if (!token) throw new Error('No estás autenticado');
  const { data } = await axios.get<CitaDetail[]>('/api/calendario/citas/me', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

// ¡NUEVA FUNCIÓN! Asumiendo que el endpoint es '/disponibilidad/me'
const fetchMyDisponibilidad = async (token: string | null) => {
  if (!token) throw new Error('No estás autenticado');
  // TODO: ¡Confirmar esta URL con el backend!
  const { data } = await axios.get<DisponibilidadDetail[]>('/api/calendario/disponibilidad/me', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

const createDisponibilidad = async ({ start, end, token }: { start: string, end: string, token: string | null }) => {
  if (!token) throw new Error('No estás autenticado');
  const payload = {
    fecha_hora_inicio: start,
    fecha_hora_fin: end,
  };
  return axios.post('/api/calendario/disponibilidad', payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
};


function ProviderCalendarPage() {
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();

  // --- (Queries) ---
  // Query 1: Cargar Citas
  const { data: citas, isLoading: isLoadingCitas } = useQuery({
    queryKey: ['myCitas'],
    queryFn: () => fetchMyCitas(token),
  });

  // Query 2: Cargar Bloqueos de Disponibilidad (¡NUEVO!)
  const { data: disponibilidad, isLoading: isLoadingDisp } = useQuery({
    queryKey: ['myDisponibilidad'],
    queryFn: () => fetchMyDisponibilidad(token),
    // Oculta el error si 404, ya que el endpoint puede no existir aún
    retry: (failureCount, error) => {
      if (axios.isAxiosError(error) && error.response?.status === 404) return false;
      return failureCount < 3;
    }
  });

  // --- (Mutation) ---
  const createBlockMutation = useMutation({
    mutationFn: createDisponibilidad,
    onSuccess: () => {
      // ¡CORRECCIÓN! Invalidamos la query de 'disponibilidad', no la de 'citas'.
      queryClient.invalidateQueries({ queryKey: ['myDisponibilidad'] });
    },
    onError: (err) => {
      console.error("Error al crear bloqueo:", err);
      alert("No se pudo crear el bloqueo. Intenta de nuevo.");
    }
  });

  // --- (Procesamiento) ---
  // FUSIONAMOS las dos fuentes de datos
  const dataForCalendar = useMemo((): EventInput[] => {
    const eventosCitas: EventInput[] = (citas || []).map(cita => ({
      id: `cita-${cita.id_cita}`,
      title: cita.detalles || `Cita ${cita.estado}`,
      start: cita.fecha_hora_cita,
      allDay: false, 
      backgroundColor: cita.estado === 'pendiente' ? '#f59e0b' : '#10b981', // Ámbar o Verde
      borderColor: cita.estado === 'pendiente' ? '#f59e0b' : '#10b981',
    }));

    const eventosDisponibilidad: EventInput[] = (disponibilidad || []).map(block => ({
      id: `disp-${block.id}`,
      title: 'Horario Bloqueado',
      start: block.fecha_hora_inicio,
      end: block.fecha_hora_fin,
      allDay: false,
      backgroundColor: '#64748b', // Gris (Bloqueado)
      borderColor: '#64748b',
    }));

    return [...eventosCitas, ...eventosDisponibilidad];
    
  }, [citas, disponibilidad]);


  const handleEventClick = (clickInfo: EventClickArg) => {
    // TODO: Falta endpoint DELETE
    alert(`Evento: ${clickInfo.event.title}`);
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect();

    if (window.confirm(`¿Confirmas bloquear este horario?\n\nDe: ${selectInfo.start.toLocaleString()}\n\nA: ${selectInfo.end.toLocaleString()}`)) {
      createBlockMutation.mutate({
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        token: token
      });
    }
  };
  
  const isLoading = isLoadingCitas || isLoadingDisp;

  return (
    <div className="p-4 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
            <h1 className="text-4x1 font-bold text-white font-poppins [text-shadow:0_0_15px_rgba(34,211,238,0.4)]">
              Mi Agenda
            </h1>
            <p className="mt-2 text-slate-300">Gestiona tus citas y disponibilidad. Haz clic o arrastra en el calendario para bloquear horas.</p>
        </div>
        
        {isLoading && <p className="text-center text-slate-300">Cargando agenda...</p>}
        
        <div className="p-4 sm:p-6 bg-white rounded-lg border border-gray-200 shadow-sm text-gray-800">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            height="auto"
            initialView="timeGridWeek"
            events={dataForCalendar}
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            select={handleDateSelect}
            eventClick={handleEventClick}
            locale="es"
            buttonText={{
                today: 'Hoy',
                month: 'Mes',
                week: 'Semana',
                day: 'Día',
            }}
            timeZone="America/Santiago"
            slotMinTime="08:00:00"
            slotMaxTime="20:00:00"
          />
        </div>
      </div>
    </div>
  );
}

export default ProviderCalendarPage;