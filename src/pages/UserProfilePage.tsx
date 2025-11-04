import { useState } from 'react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { FaSpinner, FaUserCircle, FaEdit, FaTimes } from 'react-icons/fa';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
// --- 1. AQUÍ ESTÁ EL CAMBIO DE IMPORTACIÓN ---
import { MyCitasList } from '../components/profile/MyCitasList';
import { MyExperienceTab } from '../components/profile/MyExperienceTab';

// 1. TIPO DE PERFIL (actualizado para que coincida con la API)
interface UserProfile {
  id: string;
  nombres: string;
  primer_apellido: string;
  segundo_apellido: string | null;
  rut: string;
  correo: string;
  direccion: string | null;
  rol: string;
  foto_url: string | null;
  genero: string | null;
  fecha_nacimiento: string | null;
  biografia: string | null;
  resumen_profesional: string | null;
  anos_experiencia: number | null;
}

// 2. ESQUEMA DE EDICIÓN
const profileEditSchema = z.object({
  nombres: z.string().min(1, "El nombre es requerido"),
  primer_apellido: z.string().min(1, "El apellido es requerido"),
  segundo_apellido: z.string().optional().nullable(),
  direccion: z.string().min(1, "La dirección es requerida").nullable(),
  genero: z.string().optional().nullable(),
  fecha_nacimiento: z.string().min(1, "Fecha requerida").nullable(),
  biografia: z.string().optional().nullable(),
  resumen_profesional: z.string().optional().nullable(),
  anos_experiencia: z.coerce.number().min(0).optional().nullable(),
  correo: z.string().email("Correo inválido"),
});

type ProfileEditInputs = z.infer<typeof profileEditSchema>;

// --- (Funciones de API) ---
const fetchUserProfile = async (token: string | null): Promise<UserProfile> => {
  if (!token) throw new Error("No autenticado");
  const { data } = await axios.get('/api/profile/me', { 
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

// --- (Componente del Formulario de Edición) ---
function ProfileForm({ profile, onCancel }: { readonly profile: UserProfile, readonly onCancel: () => void }) {
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      nombres: profile.nombres || '',
      primer_apellido: profile.primer_apellido || '',
      segundo_apellido: profile.segundo_apellido || '',
      direccion: profile.direccion || '',
      genero: profile.genero || '',
      fecha_nacimiento: profile.fecha_nacimiento || '',
      biografia: profile.biografia || '',
      resumen_profesional: profile.resumen_profesional || '',
      anos_experiencia: profile.anos_experiencia || 0,
      correo: profile.correo || '',
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
      alert("Error al actualizar el perfil.");
    }
  });

  const onSubmit: SubmitHandler<ProfileEditInputs> = (data) => mutation.mutate(data);
  const getBorderClass = (fieldName: keyof ProfileEditInputs) => errors[fieldName] ? 'border-red-500' : 'border-slate-700';
  const InputError = ({ message }: { message?: string }) => message ? <p className="mt-1 text-sm text-red-400">{message}</p> : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="nombres" className="label-base">Nombres</label>
          <input type="text" id="nombres" {...register("nombres")} className={`input-base ${getBorderClass('nombres')}`} />
          <InputError message={errors.nombres?.message} />
        </div>
        <div>
          <label htmlFor="primer_apellido" className="label-base">Primer Apellido</label>
          <input type="text" id="primer_apellido" {...register("primer_apellido")} className={`input-base ${getBorderClass('primer_apellido')}`} />
          <InputError message={errors.primer_apellido?.message} />
        </div>
      </div>
      <div>
        <label htmlFor="segundo_apellido" className="label-base">Segundo Apellido</label>
        <input type="text" id="segundo_apellido" {...register("segundo_apellido")} className="input-base border-slate-700" />
      </div>
      <div>
        <label htmlFor="correo" className="label-base">Correo</label>
        <input type="email" id="correo" {...register("correo")} className={`input-base ${getBorderClass('correo')}`} />
        <InputError message={errors.correo?.message} />
      </div>
      <div>
        <label htmlFor="direccion" className="label-base">Dirección</label>
        <input type="text" id="direccion" {...register("direccion")} className={`input-base ${getBorderClass('direccion')}`} />
        <InputError message={errors.direccion?.message} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="genero" className="label-base">Género</label>
          <input type="text" id="genero" {...register("genero")} className="input-base border-slate-700" />
        </div>
        <div>
          <label htmlFor="fecha_nacimiento" className="label-base">Fecha Nacimiento</label>
          <input type="date" id="fecha_nacimiento" {...register("fecha_nacimiento")} className={`input-base ${getBorderClass('fecha_nacimiento')}`} />
          <InputError message={errors.fecha_nacimiento?.message} />
        </div>
      </div>
      
      {profile.rol === 'prestador' && (
        <>
          <hr className="border-slate-700"/>
          <div>
            <label htmlFor="biografia" className="label-base">Biografía (Perfil Público)</label>
            <textarea id="biografia" rows={3} {...register("biografia")} className="input-base border-slate-700" />
          </div>
          <div>
            <label htmlFor="resumen_profesional" className="label-base">Resumen Profesional (Admin)</label>
            <textarea id="resumen_profesional" rows={3} {...register("resumen_profesional")} className="input-base border-slate-700" />
          </div>
          <div>
            <label htmlFor="anos_experiencia" className="label-base">Años de Experiencia</label>
            <input type="number" id="anos_experiencia" {...register("anos_experiencia")} className="input-base border-slate-700" />
          </div>
        </>
      )}

      <div className="flex gap-4">
        <button type="submit" disabled={isSubmitting} className="w-full btn-primary disabled:opacity-50">
          {isSubmitting ? "Guardando..." : "Guardar Cambios"}
        </button>
        <button type="button" onClick={onCancel} className="w-full btn-secondary">
          Cancelar
        </button>
      </div>
    </form>
  );
}

// --- (Componente de Vista de Perfil) ---
function ProfileView({ profile }: { readonly profile: UserProfile }) {
  const InfoItem = ({ label, value }: { label: string, value: string | null | undefined | number }) => (
    <div>
      <dt className="text-sm font-medium text-slate-400">{label}</dt>
      <dd className="mt-1 text-base text-slate-100">{value || 'No especificado'}</dd>
    </div>
  );
  return (
    <dl className="space-y-4">
      <InfoItem label="Nombre Completo" value={`${profile.nombres} ${profile.primer_apellido} ${profile.segundo_apellido || ''}`} />
      <InfoItem label="RUT" value={profile.rut} />
      <InfoItem label="Correo" value={profile.correo} />
      <InfoItem label="Dirección" value={profile.direccion} />
      <InfoItem label="Rol" value={profile.rol} />
      
      {profile.rol.toLowerCase().trim() === 'prestador' && (
        <>
          <hr className="border-slate-700"/>
          <InfoItem label="Biografía" value={profile.biografia} />
          <InfoItem label="Resumen Profesional" value={profile.resumen_profesional} />
          <InfoItem label="Años de Experiencia" value={profile.anos_experiencia?.toString()} />
        </>
      )}
    </dl>
  );
}

// --- (Sección de Información) ---
function ProfileInfoSection({ profile }: { readonly profile: UserProfile }) {
  const [isEditing, setIsEditing] = useState(false);
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">
          {isEditing ? "Editar Información" : "Tu Información"}
        </h2>
        <button 
          onClick={() => setIsEditing(!isEditing)} 
          className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-700"
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
  );
}

type ProfileTab = 'perfil' | 'citas' | 'experiencia';

// --- (Componente Principal de la Página) ---
export default function UserProfilePage() {
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<ProfileTab>('perfil');

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
      formData.append('file', file);
      pictureMutation.mutate(formData);
    }
  };

  const getTabClass = (tabName: ProfileTab) => {
    const isActive = activeTab === tabName;
    return isActive
      ? 'border-amber-400 text-amber-400'
      : 'border-transparent text-slate-400 hover:border-slate-500 hover:text-slate-300';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <FaSpinner className="animate-spin text-amber-400 text-4xl" />
      </div>
    );
  }

  if (error || !profile) {
    return <div className="p-8 text-center text-red-400">Error al cargar tu perfil.</div>;
  }

  const esPrestador = profile.rol.toLowerCase().trim() === 'prestador';

  return (
    <div className="p-4 sm:p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-4xl font-bold text-white font-poppins mb-8 text-center [text-shadow:0_0_15px_rgba(234,179,8,0.4)]">
          Mi Perfil
        </h1>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 flex flex-col items-center gap-4 mb-6">
          {profile.foto_url ? (
            <img src={profile.foto_url} alt="Perfil" className="h-32 w-32 rounded-full object-cover border-4 border-slate-700" />
          ) : (
            <FaUserCircle className="h-32 w-32 text-slate-600" />
          )}
          <label className="cursor-pointer text-sm font-medium text-amber-400 hover:text-amber-300">
            {pictureMutation.isPending ? "Subiendo..." : "Cambiar foto de perfil"}
            <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" disabled={pictureMutation.isPending} />
          </label>
        </div>

        <div className="mb-6 border-b border-slate-700">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('perfil')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${getTabClass('perfil')}`}
            >
              Mi Perfil
            </button>
            <button
              onClick={() => setActiveTab('citas')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${getTabClass('citas')}`}
            >
              Mis Citas
            </button>
            
            {esPrestador && (
              <button
                onClick={() => setActiveTab('experiencia')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${getTabClass('experiencia')}`}
              >
                Mi Experiencia
              </button>
            )}

          </nav>
        </div>

        <div>
          {activeTab === 'perfil' && <ProfileInfoSection profile={profile} />}
          {/* --- 2. AQUÍ ESTÁ EL CAMBIO DE RENDERIZADO --- */}
          {activeTab === 'citas' && <MyCitasList />}
          {activeTab === 'experiencia' && esPrestador && <MyExperienceTab />}
        </div>

      </div>
    </div>
  );
}