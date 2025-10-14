
import { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { type EventClickArg, type DateSelectArg, type EventInput } from '@fullcalendar/core';

const initialEvents: EventInput[] = [
  { id: '1', title: 'Reunión con cliente', start: new Date() },
  { id: '2', title: 'Visita técnica a Juan Pérez', date: '2025-10-08', allDay: true },
  { id: '3', title: 'Instalación de sistema', start: '2025-10-10T10:30:00', end: '2025-10-10T12:30:00' },
];

function ProviderCalendarPage() {
  const [events, setEvents] = useState<EventInput[]>(initialEvents);

  const handleEventClick = (clickInfo: EventClickArg) => {
    alert(`Evento seleccionado: '${clickInfo.event.title}'`);
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    const title = prompt('Por favor, ingresa un título para el nuevo evento:');
    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect();

    if (title) {
      const newEvent: EventInput = {
        id: String(Date.now()),
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay,
      };
      setEvents(prevEvents => [...prevEvents, newEvent]);
    }
  };

  return (
    // SOLUCIÓN: Se adapta el contenedor y los títulos al tema claro.
    <div className="bg-gray-100 p-4 sm:p-8 min-h-screen">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 font-poppins">
                Mi Agenda
            </h1>
            <p className="mt-2 text-gray-600">Gestiona tus citas y disponibilidad.</p>
        </div>
        <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            initialView="dayGridMonth"
            events={events}
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            select={handleDateSelect}
            eventClick={handleEventClick}
            locale="es"
            buttonText={{
                today:    'Hoy',
                month:    'Mes',
                week:     'Semana',
                day:      'Día',
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default ProviderCalendarPage;