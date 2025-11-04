import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import { FaSpinner, FaBriefcase, FaPlusCircle, FaTimesCircle } from 'react-icons/fa';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { Button } from '../ui/button';

const OFICIOS_LISTA = [
  "Gasfitería",
  "Electricidad",
  "Pintura",
  "Albañilería",
  "Carpintería",
  "Jardinería",
  "Mecánica",
  "Plomería",
  "Cerrajería",
  "Reparación de Electrodomésticos",
  "Instalación de Aire Acondicionado",
  "Servicios de Limpieza",
  "Techado",
  "Otro"
];

interface ExperienciaResponse {
  id_experiencia: number;
  id_usuario: number;
  especialidad: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string | null;
}

const experienceSchema = z.object({
  especialidad: z.string().min(1, "Debes seleccionar una especialidad"),
  descripcion: z.string().min(10, "La descripción es requerida (mín. 10 caracteres)"),
  fecha_inicio: z.string().min(1, "La fecha de inicio es requerida"),
  fecha_fin: z.string().optional().nullable(),
});

type ExperienceFormInputs = z.infer<typeof experienceSchema>;

const fetchMyExperience = async (token: string | null) => {
  if (!token) throw new Error("No autenticado");
  const { data } = await axios.get<ExperienciaResponse[]>('/api/profile/me/experience', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

const addExperience = async ({ payload, token }: { payload: ExperienceFormInputs, token: string | null }) => {
  if (!token) throw new Error("No autenticado");
  const { data } = await axios.post<ExperienciaResponse>('/api/profile/me/experience', payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

function AddExperienceForm({ onFormSubmit }: { onFormSubmit: () => void }) {
  const { token } = useAuthStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ExperienceFormInputs>({
    resolver: zodResolver(experienceSchema)
  });

  const mutation = useMutation({
    mutationFn: (payload: ExperienceFormInputs) => addExperience({ payload, token }),
    onSuccess: () => {
      reset();
      setIsFormOpen(false);
      onFormSubmit();
    },
    onError: (err) => {
      console.error("Error al añadir experiencia:", err);
      alert("No se pudo añadir la experiencia.");
    }
  });

  const onSubmit: SubmitHandler<ExperienceFormInputs> = (data) => {
    mutation.mutate(data);
  };

  if (!isFormOpen) {
    return (
      <Button
        type="button"
        onClick={() => setIsFormOpen(true)}
        className="w-full gap-2 mb-6"
      >
        <FaPlusCircle /> Añadir Nueva Experiencia
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-slate-800/50 border border-slate-700 p-6 rounded-lg mb-8">
      <h3 className="text-xl font-semibold text-white">Añadir Nueva Experiencia</h3>
      <div>
        <label htmlFor="especialidad" className="label-base">Especialidad</label>
        <select
          id="especialidad"
          {...register("especialidad")}
          className={`input-base ${errors.especialidad ? 'border-red-500' : 'border-slate-700'}`}
        >
          <option value="">Selecciona una especialidad...</option>
          {OFICIOS_LISTA.map((oficio) => (
            <option key={oficio} value={oficio}>{oficio}</option>
          ))}
        </select>
        {errors.especialidad && <p className="mt-1 text-sm text-red-400">{errors.especialidad.message}</p>}
      </div>
      <div>
        <label htmlFor="descripcion" className="label-base">Descripción</label>
        <textarea id="descripcion" rows={3} {...register("descripcion")} className={`input-base ${errors.descripcion ? 'border-red-500' : 'border-slate-700'}`} />
        {errors.descripcion && <p className="mt-1 text-sm text-red-400">{errors.descripcion.message}</p>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="fecha_inicio" className="label-base">Fecha Inicio</label>
          <input type="date" id="fecha_inicio" {...register("fecha_inicio")} className={`input-base ${errors.fecha_inicio ? 'border-red-500' : 'border-slate-700'}`} />
          {errors.fecha_inicio && <p className="mt-1 text-sm text-red-400">{errors.fecha_inicio.message}</p>}
        </div>
        <div>
          <label htmlFor="fecha_fin" className="label-base">Fecha Fin (Opcional)</label>
          <input type="date" id="fecha_fin" {...register("fecha_fin")} className="input-base border-slate-700" />
        </div>
      </div>
      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Guardar Experiencia"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

export function MyExperienceTab() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: experiences, isLoading, error } = useQuery({
    queryKey: ['myExperience'],
    queryFn: () => fetchMyExperience(token),
    retry: (failureCount, error) => {
      if (axios.isAxiosError(error) && error.response?.status === 404) return false;
      return failureCount < 3;
    }
  });

  const handleFormSubmit = () => {
    queryClient.invalidateQueries({ queryKey: ['myExperience'] });
  };

  return (
    <div className="space-y-6">
      <AddExperienceForm onFormSubmit={handleFormSubmit} />

      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-6">Mi Historial Laboral</h3>
        {isLoading && (
          <div className="flex justify-center items-center h-40">
            <FaSpinner className="animate-spin text-amber-400 text-3xl" />
          </div>
        )}
        {error && !axios.isAxiosError(error) && (
          <div className="text-center text-red-400">
            Error al cargar la experiencia.
          </div>
        )}
        {experiences && experiences.length === 0 && (
          <p className="text-center text-slate-400">
            Aún no has añadido ninguna experiencia laboral.
          </p>
        )}
        {experiences && experiences.length > 0 && (
          <ul className="space-y-6">
            {experiences.map((exp) => (
              <li key={exp.id_experiencia} className="flex gap-4 border-b border-slate-700 pb-6 last:border-b-0 last:pb-0">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center">
                  <FaBriefcase className="text-amber-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-medium text-slate-100">{exp.especialidad}</h4>
                  <p className="text-sm text-slate-300 mt-1">{exp.descripcion}</p>
                  <p className="text-xs text-slate-400 mt-2">
                    {new Date(exp.fecha_inicio).toLocaleDateString('es-CL')} - {exp.fecha_fin ? new Date(exp.fecha_fin).toLocaleDateString('es-CL') : 'Presente'}

                  </p>
                </div>
                <button 
                  type="button"
                  aria-label="Eliminar experiencia"
                  className="text-slate-500 hover:text-red-400"
                >
                  <FaTimesCircle />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}