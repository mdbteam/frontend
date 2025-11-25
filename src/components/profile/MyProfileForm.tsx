import { useEffect, useState } from 'react';
import { useForm, type SubmitHandler, type Resolver } from 'react-hook-form'; // 1. Importamos Resolver
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { FaSpinner } from 'react-icons/fa';

import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { InfoDialog } from '../ui/InfoDialog';

// --- 1. Esquema de Zod ---
const profileUpdateSchema = z.object({
  nombres: z.string().min(2, "El nombre es muy corto"),
  primer_apellido: z.string().min(2, "El apellido es muy corto"),
  segundo_apellido: z.string().optional().nullable(),
  direccion: z.string().optional().nullable(),
  genero: z.string().optional().nullable(),
  fecha_nacimiento: z.string().optional().nullable(),
  biografia: z.string().optional().nullable(),
  resumen_profesional: z.string().optional().nullable(),
  anos_experiencia: z.preprocess(
    (val) => (val === "" || val === null ? null : Number(val)),
    z.number().min(0, "Debe ser positivo").optional().nullable()
  ),
  correo: z.string().email("Correo no válido"),
  telefono: z.string().optional().nullable(),
});

type ProfileFormInputs = z.infer<typeof profileUpdateSchema>;

interface MyProfileData extends ProfileFormInputs {
  id: string;
  rut: string;
  rol: string;
  foto_url: string;
}

// --- 2. API ---
const apiProveedores = axios.create({
  baseURL: 'https://provider-service-mjuj.onrender.com',
});

const fetchMyProfile = async (token: string | null): Promise<MyProfileData> => {
  if (!token) throw new Error("No estás autenticado");
  const { data } = await apiProveedores.get<MyProfileData>('/profile/me', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

const updateMyProfile = async ({ data, token }: { data: Partial<ProfileFormInputs>, token: string | null }) => {
  if (!token) throw new Error("No estás autenticado");
  return apiProveedores.patch('/profile/me', data, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// --- 3. Componente ---
export function MyProfileForm() {
  const { token, setUser, user } = useAuthStore();
  const queryClient = useQueryClient();
  const [modalInfo, setModalInfo] = useState({ isOpen: false, title: "", description: "", type: "success" as "success" | "error" });

  const { data: profileData, isLoading, error } = useQuery({
    queryKey: ['myProfile'],
    queryFn: () => fetchMyProfile(token),
    retry: false,
  });

  const { 
    register, 
    handleSubmit, 
    reset, 
    formState: { errors, isSubmitting } 
  } = useForm<ProfileFormInputs>({
    // 👇 2. CORRECCIÓN: Casting seguro sin usar 'any'
    resolver: zodResolver(profileUpdateSchema) as unknown as Resolver<ProfileFormInputs>,
    defaultValues: {
      nombres: "",
      primer_apellido: "",
      segundo_apellido: null,
      direccion: null,
      genero: null,
      fecha_nacimiento: null,
      biografia: null,
      resumen_profesional: null,
      anos_experiencia: 0, 
      correo: "",
      telefono: null,
    }
  });

  useEffect(() => {
    if (profileData) {
      const cleanData = Object.fromEntries(
        Object.entries(profileData).map(([k, v]) => [k, v === null ? "" : v])
      );
      // 👇 3. CORRECCIÓN: Casting al tipo correcto
      reset(cleanData as ProfileFormInputs);
    }
  }, [profileData, reset]);

  const mutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
      if (user) {
        setUser({ ...user, ...response.data });
      }
      setModalInfo({ isOpen: true, title: "Perfil Actualizado", description: "Tus datos se han guardado correctamente.", type: "success" });
    },
    // 👇 4. CORRECCIÓN: Tipo 'unknown' para el error
    onError: (err: unknown) => {
      console.error("Error al actualizar perfil:", err);
      setModalInfo({ isOpen: true, title: "Error", description: "No se pudo guardar tu perfil.", type: "error" });
    }
  });

  const onSubmit: SubmitHandler<ProfileFormInputs> = (formData) => {
    mutation.mutate({ data: formData, token });
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-40"><FaSpinner className="animate-spin text-amber-400 text-3xl" /></div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-400 bg-slate-800/50 rounded-lg">Error al cargar tu perfil.</div>;
  }

  return (
    <>
      <InfoDialog
        isOpen={modalInfo.isOpen}
        onClose={() => setModalInfo({ ...modalInfo, isOpen: false })}
        title={modalInfo.title}
        description={modalInfo.description}
        type={modalInfo.type}
      />
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Columna 1 */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="nombres">Nombres</Label>
              <Input id="nombres" {...register("nombres")} className="bg-slate-800 border-slate-700 text-white" />
              {errors.nombres && <p className="mt-1 text-sm text-red-400">{errors.nombres.message}</p>}
            </div>
            <div>
              <Label htmlFor="primer_apellido">Primer Apellido</Label>
              <Input id="primer_apellido" {...register("primer_apellido")} className="bg-slate-800 border-slate-700 text-white" />
              {errors.primer_apellido && <p className="mt-1 text-sm text-red-400">{errors.primer_apellido.message}</p>}
            </div>
            <div>
              <Label htmlFor="segundo_apellido">Segundo Apellido (Opcional)</Label>
              <Input id="segundo_apellido" {...register("segundo_apellido")} className="bg-slate-800 border-slate-700 text-white" />
            </div>
            <div>
              <Label htmlFor="correo">Correo Electrónico</Label>
              <Input id="correo" type="email" {...register("correo")} className="bg-slate-800 border-slate-700 text-white" />
              {errors.correo && <p className="mt-1 text-sm text-red-400">{errors.correo.message}</p>}
            </div>
            <div>
              <Label htmlFor="telefono">Teléfono (Opcional)</Label>
              <Input id="telefono" {...register("telefono")} className="bg-slate-800 border-slate-700 text-white" />
            </div>
          </div>

          {/* Columna 2 */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento (Opcional)</Label>
              <Input id="fecha_nacimiento" type="date" {...register("fecha_nacimiento")} className="bg-slate-800 border-slate-700 text-white" />
            </div>
            <div>
              <Label htmlFor="direccion">Dirección (Opcional)</Label>
              <Input id="direccion" {...register("direccion")} className="bg-slate-800 border-slate-700 text-white" />
            </div>
             <div>
              <Label htmlFor="anos_experiencia">Años de Experiencia (Opcional)</Label>
              <Input 
                id="anos_experiencia" 
                type="number" 
                {...register("anos_experiencia")} 
                className="bg-slate-800 border-slate-700 text-white"
              />
              {errors.anos_experiencia && <p className="mt-1 text-sm text-red-400">{errors.anos_experiencia.message}</p>}
            </div>
            <div>
              <Label htmlFor="genero">Género (Opcional)</Label>
              <Input id="genero" {...register("genero")} className="bg-slate-800 border-slate-700 text-white" />
            </div>
          </div>
        </div>

        {/* Campos anchos */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="resumen_profesional">Resumen Profesional (Opcional)</Label>
            <Textarea id="resumen_profesional" rows={3} {...register("resumen_profesional")} className="bg-slate-800 border-slate-700 text-white" placeholder="Un breve resumen para tu perfil público..." />
          </div>
          <div>
            <Label htmlFor="biografia">Biografía (Opcional)</Label>
            <Textarea id="biografia" rows={5} {...register("biografia")} className="bg-slate-800 border-slate-700 text-white" placeholder="Cuéntale a los clientes más sobre ti..." />
          </div>
        </div>

        <div className="pt-4 text-right">
          <Button type="submit" disabled={isSubmitting} className="bg-cyan-600 hover:bg-cyan-500 text-white">
            {isSubmitting ? <FaSpinner className="animate-spin mr-2" /> : null} 
            Guardar Cambios
          </Button>
        </div>
      </form>
    </>
  );
}