import { useMemo } from 'react'; 
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';

import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { type DateSelectArg, type EventInput } from '@fullcalendar/core';
import { FaUserCircle, FaSpinner } from 'react-icons/fa';

interface PrestadorProfile {
  id_usuario: string;
  nombres: string;
  primer_apellido: string;
  foto_url: string | null;
  resumen_profesional: string | null;
  categorias: string[];
  anos_experiencia: number | null;
}

interface DisponibilidadSlot {
  hora_inicio: string; 
}

interface CreateCitaPayload {
  id_prestador: number;
  fecha_hora_cita: string;
  detalles: string;
}

const fetchPrestadorProfile = async (id: string) => {
  const { data } = await axios.get<PrestadorProfile>(`/api/prestadores/${id}`);
  return data;
};

const fetchPrestadorDisponibilidad = async (id: string) => {
  const { data } = await axios.get<DisponibilidadSlot[]>(`/api/calendario/prestadores/${id}/disponibilidad`);
  return data;
};

const createCita = async ({ payload, token }: { payload: CreateCitaPayload, token: string | null }) => {
  if (!token) throw new Error('Debes iniciar sesión para agendar una cita.');
  return axios.post('/api/calendario/citas', payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export default function PrestadorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { token, isAuthenticated } = useAuthStore();

  
  const { data: profile, isLoading: isLoadingProfile, error: errorProfile } = useQuery({
    queryKey: ['prestadorProfile', id],
    queryFn: () => fetchPrestadorProfile(id!), 
    enabled: !!id, 
  });

  const { data: disponibilidad, isLoading: isLoadingDisp, error: errorDisp } = useQuery({
    queryKey: ['prestadorDisponibilidad', id],
    queryFn: () => fetchPrestadorDisponibilidad(id!),
    enabled: !!id, 
  });

  const createCitaMutation = useMutation({
    mutationFn: createCita,
    onSuccess: () => {
      alert('¡Cita agendada con éxito! El prestador debe confirmarla.');
      queryClient.invalidateQueries({ queryKey: ['prestadorDisponibilidad', id] });
    },
    onError: (err) => {
      console.error("Error al crear la cita:", err);
      alert("No se pudo agendar la cita. Intenta de nuevo.");
    }
  });

  const dataForCalendar = useMemo((): EventInput[] => {
    return (disponibilidad || []).map((slot, index) => ({
      id: `slot-${index}`,
      title: 'Disponible',
      start: slot.hora_inicio,
      allDay: false,
      backgroundColor: '#10b981', 
      borderColor: '#10b981',
    }));
  }, [disponibilidad]);

  if (!id) {
    return <div className="p-8 text-center text-red-400">Error: ID de prestador no encontrado.</div>;
  }

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect();

    if (!isAuthenticated) {
      alert('Por favor, inicia sesión para poder agendar una cita.');
      navigate('/login');
      return;
    }
    
    const detalles = prompt('Por favor, ingresa un breve detalle del trabajo a realizar:');
    
    if (detalles) {
      const payload: CreateCitaPayload = {
        id_prestador: parseInt(id, 10),
        fecha_hora_cita: selectInfo.startStr,
        detalles: detalles,
      };

      createCitaMutation.mutate({ payload, token });
    }
  };

  if (isLoadingProfile || isLoadingDisp) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <FaSpinner className="animate-spin text-cyan-400 text-4xl" />
      </div>
    );
  }

  if (errorProfile || !profile) {
    return <div className="p-8 text-center text-red-400">Error al cargar el perfil del prestador.</div>;
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <div className="md:col-span-1 space-y-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 text-center">
            {profile.foto_url ? (
              <img 
                src={profile.foto_url} 
                alt="Foto de perfil" 
                className="h-32 w-32 rounded-full object-cover border-4 border-slate-700 mx-auto"
              />
            ) : (
              <FaUserCircle className="h-32 w-32 text-slate-600 mx-auto" />
            )}
            <h1 className="text-3xl font-bold text-white mt-4">
              {profile.nombres} {profile.primer_apellido}
            </h1>
            <p className="text-cyan-400 text-lg mt-1">{profile.categorias?.[0] || 'Profesional'}</p>
          </div>
          
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-cyan-400">Experiencia</h3>
              <p className="text-lg text-slate-200">{profile.anos_experiencia || 'No especificado'} años</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-cyan-400">Resumen Profesional</h3>
              <p className="text-base text-slate-300">{profile.resumen_profesional || 'No disponible.'}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-cyan-400">Especialidades</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {(profile.categorias || []).map(cat => (
                  <span key={cat} className="bg-slate-700 text-cyan-300 text-xs font-medium px-3 py-1 rounded-full">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="mb-6">
             <h2 className="text-3xl font-bold text-white font-poppins [text-shadow:0_0_15px_rgba(34,211,238,0.4)]">
              Agenda tu Cita
            </h2>
            <p className="mt-1 text-slate-300">Selecciona un horario "Disponible" para enviar una solicitud.</p>
          </div>

          {errorDisp && (
            <div className="p-8 text-center text-red-400 bg-slate-800/50 rounded-lg">
              Error al cargar la disponibilidad de este prestador.
            </div>
          )}

          {!errorDisp && (
            <div className="p-4 sm:p-6 bg-white rounded-lg border border-gray-200 shadow-sm text-gray-800">
              <FullCalendar
                plugins={[timeGridPlugin, interactionPlugin]}
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'timeGridWeek,timeGridDay'
                }}
                height="auto"
                initialView="timeGridWeek"
                events={dataForCalendar}
                selectable={true}
                selectMirror={true}
                select={handleDateSelect}
                locale="es"
                buttonText={{
                    today: 'Hoy',
                    week: 'Semana',
                    day: 'Día',
                }}
                timeZone="America/Santiago"
                slotMinTime="08:00:00"
                slotMaxTime="20:00:00"
                allDaySlot={false}
                selectOverlap={false} 
                eventOverlap={false}
              />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}