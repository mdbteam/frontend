import { useState, useMemo, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateSelectArg, EventInput, EventContentArg } from "@fullcalendar/core";
import dayjs from "dayjs";
import axios, { type AxiosError } from "axios";
import { useMutation, useQuery } from "@tanstack/react-query";

interface CreateCitaResponse {
  mensaje: string;
}

interface CreateCitaVariables {
  providerId: number;
  start: string;
  duracion_min: number;
  detalles: string;
  token: string;
}

interface CitaBackend {
  id_cita: number;
  id_cliente: number;
  id_prestador: number;
  fecha_hora_cita: string;
  duracion_min: number;
  detalles: string;
  estado: string;
}

interface AvailabilitySlot {
  hora_inicio: string;
  hora_fin: string;
  estado_reserva: string;
  es_bloqueo: boolean;
}

const API_URL = "https://api.tu-backend.com";

export default function ClientBookingCalendar({
  providerId,
  token
}: {
  providerId: number;
  token: string;
}) {
  const [note, setNote] = useState("");
  const [duration] = useState(60);

  const { data: citas } = useQuery<CitaBackend[]>({
    queryKey: ["citasDelProfesional", providerId],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/citas/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    }
  });

  const availability = useMemo<AvailabilitySlot[]>(() => {
    if (!citas) return [];
    return citas.map((c) => {
      const inicio = c.fecha_hora_cita;
      const fin = dayjs(c.fecha_hora_cita).add(c.duracion_min, "minute").toISOString();
      return {
        hora_inicio: inicio,
        hora_fin: fin,
        estado_reserva: c.estado,
        es_bloqueo: c.estado !== "rechazada"
      };
    });
  }, [citas]);

  const calendarEvents = useMemo<EventInput[]>(() => {
    if (!availability) return [];
    return availability.map((slot, index) => {
      if (slot.estado_reserva === "pendiente") {
        return {
          id: `pend-${index}`,
          start: slot.hora_inicio,
          end: slot.hora_fin,
          display: "block",
          editable: false,
          backgroundColor: "#FFF3B0",
          extendedProps: {
            type: "ocupado",
            estado_visual: "pendiente"
          }
        };
      }
      if (slot.estado_reserva === "confirmada") {
        return {
          id: `conf-${index}`,
          start: slot.hora_inicio,
          end: slot.hora_fin,
          display: "block",
          editable: false,
          backgroundColor: "#B0F2C2",
          extendedProps: {
            type: "ocupado",
            estado_visual: "confirmada"
          }
        };
      }
      return {
        id: `avl-${index}`,
        start: slot.hora_inicio,
        end: slot.hora_fin,
        display: "background",
        extendedProps: { type: "disponible" }
      };
    });
  }, [availability]);

  const crearCita = useMutation<CreateCitaResponse, AxiosError, CreateCitaVariables>({
    mutationFn: async (variables) => {
      const res = await axios.post<CreateCitaResponse>(
        `${API_URL}/citas`,
        {
          id_prestador: variables.providerId,
          fecha_hora_cita: variables.start,
          duracion_min: variables.duracion_min,
          detalles: variables.detalles
        },
        {
          headers: { Authorization: `Bearer ${variables.token}` }
        }
      );
      return res.data;
    }
  });

  const handleSelect = useCallback(
    (arg: DateSelectArg) => {
      const inicio = arg.startStr;
      const now = dayjs();

      if (dayjs(inicio).isBefore(now)) {
        return;
      }

      const fin = dayjs(inicio).add(duration, "minute").toISOString();

      const overlap = availability.some(
        (slot) =>
          slot.es_bloqueo &&
          dayjs(inicio).isBefore(slot.hora_fin) &&
          dayjs(fin).isAfter(slot.hora_inicio)
      );

      if (overlap) return;

      crearCita.mutate({
        providerId,
        start: inicio,
        duracion_min: duration,
        detalles: note,
        token
      });
    },
    [availability, crearCita, duration, note, providerId, token]
  );

  const renderEventContent = useCallback((content: EventContentArg) => {
    return (
      <div className="text-xs text-black">
        {content.event.extendedProps.type === "ocupado" && "Ocupado"}
        {content.event.extendedProps.estado_visual === "pendiente" && " (Pendiente)"}
        {content.event.extendedProps.estado_visual === "confirmada" && " (Confirmada)"}
      </div>
    );
  }, []);

  return (
    <div className="w-full">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        selectable
        select={handleSelect}
        events={calendarEvents}
        eventContent={renderEventContent}
      />
      <input
        className="border p-2 mt-4 w-full"
        placeholder="Notas..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
    </div>
  );
}
