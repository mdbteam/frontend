import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FaSpinner, FaTrash } from 'react-icons/fa';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';

interface Experiencia {
  id_experiencia: number;
  id_usuario: number;
  cargo: string;
  descripcion: string | null;
  fecha_inicio: string;
  fecha_fin: string | null;
  especialidad: string;
}

interface Categoria {
  id_categoria: number;
  nombre: string;
}

const experienceSchema = z.object({
  cargo: z.string().min(3, "El cargo es muy corto"),
  especialidad: z.string().min(1, "Debes seleccionar una especialidad"),
  fecha_inicio: z.string().min(1, "La fecha de inicio es requerida"),
  fecha_fin: z.string().optional().nullable(),
  descripcion: z.string().optional().nullable(),
});

type ExperienceFormInputs = z.infer<typeof experienceSchema>;

const fetchMyExperience = async (token: string | null): Promise<Experiencia[]> => {
  if (!token) throw new Error("No autenticado");
  const { data } = await axios.get('/api/profile/me/experience', { 
    headers: { Authorization: `Bearer ${token}` } 
  });
  return data;
};

const fetchCategorias = async (): Promise<Categoria[]> => {
  const { data } = await axios.get('/api/categorias');
  return data;
};

const addExperience = async ({ data, token }: { data: ExperienceFormInputs, token: string | null }) => {
  if (!token) throw new Error("No autenticado");
  const { data: responseData } = await axios.post('/api/profile/me/experience', data, { 
    headers: { Authorization: `Bearer ${token}` } 
  });
  return responseData;
};

const deleteExperience = async ({ id, token }: { id: number, token: string | null }) => {
  if (!token) throw new Error("No autenticado");
  return axios.delete(`/api/profile/me/experience/${id}`, { 
    headers: { Authorization: `Bearer ${token}` } 
  });
};

export function MyExperienceTab() {
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();

  const { data: myExperience, isLoading: isLoadingExperience } = useQuery({
    queryKey: ['myExperience'],
    queryFn: () => fetchMyExperience(token),
    enabled: !!token,
  });

  const { data: categorias, isLoading: isLoadingCategorias } = useQuery({
    queryKey: ['categorias'],
    queryFn: fetchCategorias,
  });

  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<ExperienceFormInputs>({
    resolver: zodResolver(experienceSchema),
  });

  const addMutation = useMutation({
    mutationFn: addExperience,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myExperience'] });
      reset();
    },
    onError: (err) => {
      console.error("Error al añadir experiencia:", err);
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: deleteExperience,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myExperience'] });
    },
    onError: (err) => {
      console.error("Error al eliminar experiencia:", err);
    }
  });

  const onSubmit: SubmitHandler<ExperienceFormInputs> = (data) => {
    addMutation.mutate({ data, token });
  };

  const handleDelete = (id: number) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta experiencia?")) {
      deleteMutation.mutate({ id, token });
    }
  };

  const isLoading = isLoadingExperience || isLoadingCategorias;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <h3 className="text-xl font-semibold text-white mb-4">Añadir Experiencia</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div>
            <Label htmlFor="cargo">Cargo o Título</Label>
            <Input id="cargo" {...register("cargo")} className={errors.cargo ? 'border-red-500' : ''} />
            {errors.cargo && <p className="mt-1 text-sm text-red-400">{errors.cargo.message}</p>}
          </div>
          <div>
            <Label htmlFor="especialidad">Especialidad</Label>
            <Controller
              name="especialidad"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingCategorias}>
                  <SelectTrigger className={errors.especialidad ? 'border-red-500' : ''}>
                    <SelectValue placeholder={isLoadingCategorias ? "Cargando..." : "Selecciona..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {(categorias || []).map((cat) => (
                      <SelectItem key={cat.id_categoria} value={cat.nombre}>{cat.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.especialidad && <p className="mt-1 text-sm text-red-400">{errors.especialidad.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fecha_inicio">Fecha Inicio</Label>
              <Input id="fecha_inicio" type="date" {...register("fecha_inicio")} className={errors.fecha_inicio ? 'border-red-500' : ''} />
              {errors.fecha_inicio && <p className="mt-1 text-sm text-red-400">{errors.fecha_inicio.message}</p>}
            </div>
            <div>
              <Label htmlFor="fecha_fin">Fecha Fin (Opcional)</Label>
              <Input id="fecha_fin" type="date" {...register("fecha_fin")} />
            </div>
          </div>
          <div>
            <Label htmlFor="descripcion">Descripción (Opcional)</Label>
            <Textarea id="descripcion" rows={3} {...register("descripcion")} />
          </div>
          <Button type="submit" disabled={isSubmitting || addMutation.isPending} className="w-full bg-amber-400 text-slate-900 hover:bg-amber-400/90">
            {isSubmitting || addMutation.isPending ? "Añadiendo..." : "Añadir Experiencia"}
          </Button>
        </form>
      </div>

      <div className="md:col-span-2">
        <h3 className="text-xl font-semibold text-white mb-4">Mi Historial</h3>
        <div className="space-y-4">
          {isLoading && (
            <div className="flex justify-center p-8"><FaSpinner className="animate-spin text-amber-400 text-3xl" /></div>
          )}
          {!isLoading && (!myExperience || myExperience.length === 0) && (
            <p className="text-slate-400 text-center p-8">Aún no has añadido experiencia a tu perfil.</p>
          )}
          {myExperience?.map((exp) => (
            <div key={exp.id_experiencia} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 flex justify-between items-start">
              <div>
                <h4 className="text-lg font-medium text-white">{exp.cargo}</h4>
                <p className="text-sm text-amber-300">{exp.especialidad}</p>
                <p className="text-sm text-slate-400 mt-1">{exp.descripcion}</p>
                <p className="text-xs text-slate-500 mt-2">
                  {new Date(exp.fecha_inicio).getFullYear()} - {exp.fecha_fin ? new Date(exp.fecha_fin).getFullYear() : 'Presente'}
                </p>
              </div>
              <Button 
                variant="destructive" 
                size="icon" 
                onClick={() => handleDelete(exp.id_experiencia)}
                disabled={deleteMutation.isPending && deleteMutation.variables?.id === exp.id_experiencia}
                aria-label="Eliminar experiencia"
              >
                <FaTrash />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}