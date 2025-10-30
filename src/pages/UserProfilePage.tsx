import { useState } from 'react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { FaSpinner, FaUserCircle, FaEdit, FaTimes } from 'react-icons/fa';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface UserProfile {
  id: string;
  nombres: string;
  primer_apellido: string;
  segundo_apellido: string;
  rut: string;
  correo: string;
  direccion: string | null;
  fecha_de_nacimiento: string;
  genero: string;
  rol: string;
  foto_url: string | null;
  resumen_profesional?: string | null;
  anos_experiencia?: number | null;
  categorias?: string[];
  comunas_cobertura?: string | null;
  estado_postulacion?: string;
}

const profileEditSchema = z.object({
  direccion: z.string().min(1, "La dirección es requerida"),
  resumen_profesional: z.string()
    .min(50, "El resumen debe tener al menos 50 caracteres")
    .optional().or(z.literal('')),
  anos_experiencia: z.coerce.number() 
    .min(0, "Debe ser un número positivo")
    .optional().or(z.literal('')),
  comunas_cobertura: z.string()
    .min(1, "Indica al menos una comuna")
    .optional().or(z.literal('')),
});

type ProfileEditInputs = z.infer<typeof profileEditSchema>;

const fetchUserProfile = async (token: string | null): Promise<UserProfile> => {
  if (!token) throw new Error("No autenticado");
  const { data } = await axios.get('/api/users/me', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

const updateUserProfile = (payload: ProfileEditInputs, token: string | null) => {
  if (!token) throw new Error("No autenticado");
  return axios.patch('/api/profile/me', payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

const uploadProfilePicture = (formData: FormData, token: string | null) => {
  if (!token) throw new Error("No autenticado");
  return axios.put('/api/profile/me/picture', formData, {
    headers: { 
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}` 
    }
  });
};

interface ProfileFormProps {
  readonly profile: UserProfile;
  readonly onCancel: () => void;
}

function ProfileForm({ profile, onCancel }: ProfileFormProps) {
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      direccion: profile.direccion || '',
      resumen_profesional: profile.resumen_profesional || '',
      anos_experiencia: profile.anos_experiencia || 0,
      comunas_cobertura: profile.comunas_cobertura || '',
    },
  });

  const mutation = useMutation({
    mutationFn: (data: ProfileEditInputs) => updateUserProfile(data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      onCancel();
    },
    onError: (err) => {
      console.error(err);
      alert("Error al actualizar el perfil. (El endpoint PATCH /api/profile/me podría no existir aún)");
    }
  });
  const onSubmit: SubmitHandler<ProfileEditInputs> = (data) => {
    mutation.mutate(data);
  };

  const getBorderClass = (fieldName: keyof ProfileEditInputs) => 
    errors[fieldName] ? 'border-red-500' : 'border-slate-700';
  
  const InputError = ({ message }: { message?: string }) => 
    message ? <p className="mt-1 text-sm text-red-400">{message}</p> : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="direccion" className="block text-sm font-medium text-slate-300">Dirección</label>
        <input type="text" id="direccion" {...register("direccion")}
          className={`mt-1 block w-full input-base ${getBorderClass('direccion')}`} />
        <InputError message={errors.direccion?.message} />
      </div>

      {profile.rol === 'prestador' && (
        <>
          <div>
            <label htmlFor="resumen_profesional" className="block text-sm font-medium text-slate-300">Resumen Profesional</label>
            <textarea id="resumen_profesional" rows={4} {...register("resumen_profesional")}
              className={`mt-1 block w-full input-base ${getBorderClass('resumen_profesional')}`} />
            <InputError message={errors.resumen_profesional?.message} />
          </div>
          <div>
            <label htmlFor="anos_experiencia" className="block text-sm font-medium text-slate-300">Años de Experiencia</label>
            <input type="number" id="anos_experiencia" {...register("anos_experiencia")}
              className={`mt-1 block w-full input-base ${getBorderClass('anos_experiencia')}`} />
            <InputError message={errors.anos_experiencia?.message} />
          </div>
          <div>
            <label htmlFor="comunas_cobertura" className="block text-sm font-medium text-slate-300">Comunas de Cobertura</label>
            <input type="text" id="comunas_cobertura" {...register("comunas_cobertura")}
              className={`mt-1 block w-full input-base ${getBorderClass('comunas_cobertura')}`} />
            <InputError message={errors.comunas_cobertura?.message} />
          </div>
        </>
      )}
      
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-500 hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50"
        >
          {isSubmitting ? "Guardando..." : "Guardar Cambios"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="w-full flex justify-center py-2 px-4 border border-slate-700 rounded-md shadow-sm text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 focus:outline-none"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
function ProfileView({ profile }: { readonly profile: UserProfile }) { 
  const InfoItem = ({ label, value }: { label: string, value: string | null | undefined | number }) => (
    <div>
      <dt className="text-sm font-medium text-slate-400">{label}</dt>
      <dd className="mt-1 text-base text-slate-100">{value || 'No especificado'}</dd>
    </div>
  );

  return (
    <dl className="space-y-4">
      <InfoItem label="Nombre Completo" value={`${profile.nombres} ${profile.primer_apellido} ${profile.segundo_apellido}`} />
      <InfoItem label="RUT" value={profile.rut} />
      <InfoItem label="Correo" value={profile.correo} />
      <InfoItem label="Dirección" value={profile.direccion} />
      <InfoItem label="Rol" value={profile.rol} />
      
      {profile.rol === 'prestador' && (
        <>
          <hr className="border-slate-700"/>
          <InfoItem label="Resumen Profesional" value={profile.resumen_profesional} />
          <InfoItem label="Años de Experiencia" value={profile.anos_experiencia?.toString()} />
          <InfoItem label="Comunas de Cobertura" value={profile.comunas_cobertura} />
          <InfoItem label="Estado Postulación" value={profile.estado_postulacion} />
        </>
      )}
    </dl>
  );
}

export default function UserProfilePage() {
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => fetchUserProfile(token),
  });

  const pictureMutation = useMutation({
    mutationFn: (formData: FormData) => uploadProfilePicture(formData, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
    onError: (err) => {
      console.error(err);
      alert("Error al subir la imagen.");
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('profile_picture', file);
      pictureMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <FaSpinner className="animate-spin text-cyan-400 text-4xl" />
      </div>
    );
  }

  if (error || !profile) {
    return <div className="p-8 text-center text-red-400">Error al cargar tu perfil.</div>;
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-4xl font-bold text-white font-poppins mb-8 text-center [text-shadow:0_0_15px_rgba(34,211,238,0.4)]">
          Mi Perfil
        </h1>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 flex flex-col items-center gap-4 mb-6">
          {profile.foto_url ? (
            <img src={profile.foto_url} alt="Perfil" className="h-32 w-32 rounded-full object-cover border-4 border-slate-700" />
          ) : (
            <FaUserCircle className="h-32 w-32 text-slate-600" />
          )}
          <label className="cursor-pointer text-sm font-medium text-cyan-400 hover:text-cyan-300">
            {pictureMutation.isPending ? "Subiendo..." : "Cambiar foto de perfil"}
            <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" disabled={pictureMutation.isPending} />
          </label>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">
              {isEditing ? "Editar Información" : "Tu Información"}
            </h2>
            <button 
              onClick={() => setIsEditing(!isEditing)} 
              className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-700"
              aria-label={isEditing ? "Cancelar edición" : "Editar perfil"}
            >
              {isEditing ? <FaTimes /> : <FaEdit />}
            </button>
          </div>

          {isEditing ? (
            <ProfileForm profile={profile} onCancel={() => setIsEditing(false)} />
          ) : (
            <ProfileView profile={profile} />
          )}
        </div>
      </div>
    </div>
  );
}