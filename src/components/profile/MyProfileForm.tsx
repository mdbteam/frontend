import { useEffect, useState } from 'react';
import { useForm, type SubmitHandler, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { 
  FaSpinner, FaPencilAlt, FaTimes, FaSave, FaUserCircle, 
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaBriefcase, 
  FaCalendarAlt, FaQuoteLeft 
} from 'react-icons/fa';

import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { InfoDialog } from '../ui/InfoDialog';

// --- 1. ESQUEMA ZOD ---
const profileUpdateSchema = z.object({
  nombres: z.string().min(2, "El nombre es muy corto").regex(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/, "Solo letras"),
  primer_apellido: z.string().min(2, "Apellido corto").regex(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/, "Solo letras"),
  segundo_apellido: z.string().optional().nullable().refine((val) => !val || /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/.test(val), "Solo letras"),
  direccion: z.string().optional().nullable(),
  genero: z.string().optional().nullable(),
  fecha_nacimiento: z.string().optional().nullable(),
  biografia: z.string().optional().nullable(),
  resumen_profesional: z.string().optional().nullable(),
  anos_experiencia: z.preprocess(
    (val) => (val === "" || val === null ? null : Number(val)),
    z.number().min(0).optional().nullable()
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
  bio?: string;
}

// --- 2. API ---
const apiProveedores = axios.create({
  baseURL: 'https://provider-service-mjuj.onrender.com'
});

const fetchMyProfile = async (token: string | null): Promise<MyProfileData> => {
  if (!token) throw new Error("No token");
  const { data } = await apiProveedores.get<MyProfileData>('/profile/me', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

const updateMyProfile = async ({
  data,
  token
}: {
  data: Partial<ProfileFormInputs>;
  token: string | null;
}) => {
  if (!token) throw new Error("No token");
  return apiProveedores.patch('/profile/me', data, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// --- COMPONENTE PRINCIPAL ---
export function MyProfileForm() {
  const { token, setUser, user } = useAuthStore();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    isOpen: false,
    title: "",
    description: "",
    type: "success" as "success" | "error"
  });

  const { data: profileData, isLoading, error } = useQuery({
    queryKey: ['myProfile'],
    queryFn: () => fetchMyProfile(token),
    retry: false,
  });

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<ProfileFormInputs>({
    resolver: zodResolver(profileUpdateSchema) as Resolver<ProfileFormInputs>,
    defaultValues: {
      nombres: "",
      primer_apellido: "",
      correo: ""
    }
  });

  useEffect(() => {
    if (profileData) {
      const bioValue = profileData.biografia || profileData.bio || "";

      reset({
        nombres: profileData.nombres || "",
        primer_apellido: profileData.primer_apellido || "",
        segundo_apellido: profileData.segundo_apellido || "",
        direccion: profileData.direccion || "",
        genero: profileData.genero || "",
        fecha_nacimiento: profileData.fecha_nacimiento || "",
        biografia: bioValue,
        resumen_profesional: profileData.resumen_profesional || "",
        anos_experiencia: profileData.anos_experiencia ?? null,
        correo: profileData.correo || "",
        telefono: profileData.telefono || "",
      });
    }
  }, [profileData, reset]);

  const formValues = watch();

  const mutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
      if (user) setUser({ ...user, ...response.data });
      setModalInfo({
        isOpen: true,
        title: "Guardado",
        description: "Perfil actualizado correctamente.",
        type: "success"
      });
      setIsEditing(false);
    },
    onError: () =>
      setModalInfo({
        isOpen: true,
        title: "Error",
        description: "No se pudo guardar.",
        type: "error"
      })
  });

  const onSubmit: SubmitHandler<ProfileFormInputs> = (formData) => {
    mutation.mutate({ data: formData, token });
  };

  const maxDate = new Date().toISOString().split("T")[0];

  if (isLoading)
    return (
      <div className="flex justify-center h-40 items-center">
        <FaSpinner className="animate-spin text-3xl text-cyan-400" />
      </div>
    );

  if (error || !profileData)
    return (
      <div className="text-center text-red-400 p-8">
        Error cargando perfil.
      </div>
    );

  const displayData: ProfileFormInputs = isEditing
    ? formValues
    : {
        nombres: profileData.nombres,
        primer_apellido: profileData.primer_apellido,
        segundo_apellido: profileData.segundo_apellido,
        direccion: profileData.direccion,
        genero: profileData.genero,
        fecha_nacimiento: profileData.fecha_nacimiento,
        biografia: profileData.biografia,
        resumen_profesional: profileData.resumen_profesional,
        anos_experiencia: profileData.anos_experiencia,
        correo: profileData.correo,
        telefono: profileData.telefono
      };

  const displayBio =
    displayData.biografia ||
    profileData.biografia ||
    profileData.bio ||
    "";

  return (
    <>
      <InfoDialog
        isOpen={modalInfo.isOpen}
        onClose={() => setModalInfo({ ...modalInfo, isOpen: false })}
        title={modalInfo.title}
        description={modalInfo.description}
        type={modalInfo.type}
      />

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">

        {/* HEADER */}
        <div className="bg-slate-950/50 p-6 border-b border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-slate-800 border-2 border-cyan-500/50 flex items-center justify-center overflow-hidden">
              {profileData.foto_url
                ? (
                  <img
                    src={profileData.foto_url}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                )
                : <FaUserCircle className="text-4xl text-slate-600" />}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {profileData.nombres} {profileData.primer_apellido}
              </h2>
              <p className="text-cyan-400 text-sm font-medium uppercase tracking-wider">
                {profileData.rol || 'Usuario'}
              </p>
            </div>
          </div>

          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700"
            >
              <FaPencilAlt className="mr-2" /> Editar Perfil
            </Button>
          )}
        </div>

        {/* BODY */}
        <div className="p-6">

          {!isEditing ? (
            // --- MODO LECTURA ---
            <div className="space-y-8">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                <InfoItem icon={<FaEnvelope />} label="Correo" value={profileData.correo} />
                <InfoItem icon={<FaPhone />} label="Teléfono" value={profileData.telefono} />
                <InfoItem icon={<FaCalendarAlt />} label="Nacimiento" value={profileData.fecha_nacimiento} />
                <InfoItem icon={<FaUserCircle />} label="Género" value={profileData.genero} />
                <InfoItem icon={<FaMapMarkerAlt />} label="Dirección" value={profileData.direccion} />
                <InfoItem icon={<FaBriefcase />} label="Experiencia" value={
                  profileData.anos_experiencia
                    ? `${profileData.anos_experiencia} años`
                    : null
                } />
              </div>

              <div className="border-t border-slate-800 my-6" />

              <div className="space-y-8">

                <div>
                  <h3 className="text-slate-500 text-xs uppercase font-bold mb-3 tracking-wider">
                    Resumen Profesional
                  </h3>
                  <div className="relative bg-slate-800/40 p-6 rounded-xl border border-slate-700/50">
                    <FaQuoteLeft className="absolute top-4 left-4 text-slate-700/50 text-2xl" />
                    <p className="relative z-10 text-slate-300 italic text-sm leading-relaxed pl-6">
                      {profileData.resumen_profesional || (
                        <span className="text-slate-600 not-italic">
                          No has añadido un resumen profesional.
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-slate-500 text-xs uppercase font-bold mb-3 tracking-wider">
                    Biografía
                  </h3>
                  <div className="text-slate-300 text-sm leading-7 whitespace-pre-wrap">
                    {displayBio || (
                      <span className="text-slate-600 italic">
                        Sin biografía disponible.
                      </span>
                    )}
                  </div>
                </div>

              </div>
            </div>
          ) : (

            // --- MODO EDICIÓN ---
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
            >

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Nombres</Label>
                    <Input {...register("nombres")} className="bg-slate-950 border-slate-700" />
                    {errors.nombres && <span className="text-red-400 text-xs">{errors.nombres.message}</span>}
                  </div>

                  <div>
                    <Label>Primer Apellido</Label>
                    <Input {...register("primer_apellido")} className="bg-slate-950 border-slate-700" />
                    {errors.primer_apellido && <span className="text-red-400 text-xs">{errors.primer_apellido.message}</span>}
                  </div>

                  <div>
                    <Label>Segundo Apellido</Label>
                    <Input {...register("segundo_apellido")} className="bg-slate-950 border-slate-700" />
                    {errors.segundo_apellido && <span className="text-red-400 text-xs">{errors.segundo_apellido.message}</span>}
                  </div>

                  <div>
                    <Label>Correo</Label>
                    <Input {...register("correo")} className="bg-slate-950 border-slate-700" />
                    {errors.correo && <span className="text-red-400 text-xs">{errors.correo.message}</span>}
                  </div>

                  <div>
                    <Label>Teléfono</Label>
                    <Input {...register("telefono")} maxLength={9} placeholder="912345678" className="bg-slate-950 border-slate-700" />
                    {errors.telefono && <span className="text-red-400 text-xs">{errors.telefono.message}</span>}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Fecha Nacimiento</Label>
                    <Input type="date" max={maxDate} {...register("fecha_nacimiento")} className="bg-slate-950 border-slate-700" />
                    {errors.fecha_nacimiento && <span className="text-red-400 text-xs">{errors.fecha_nacimiento.message}</span>}
                  </div>

                  <div>
                    <Label>Dirección</Label>
                    <Input {...register("direccion")} className="bg-slate-950 border-slate-700" />
                  </div>

                  <div>
                    <Label>Años Experiencia</Label>
                    <Input type="number" {...register("anos_experiencia")} className="bg-slate-950 border-slate-700" />
                  </div>

                  <div>
                    <Label>Género</Label>
                    <Input {...register("genero")} placeholder="Ej: Masculino, Femenino" className="bg-slate-950 border-slate-700" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Resumen Profesional</Label>
                  <Textarea
                    rows={3}
                    {...register("resumen_profesional")}
                    className="bg-slate-950 border-slate-700"
                    placeholder="Ej: Experto en carpintería..."
                  />
                </div>

                <div>
                  <Label>Biografía</Label>
                  <Textarea
                    rows={6}
                    {...register("biografia")}
                    className="bg-slate-950 border-slate-700"
                    placeholder="Cuenta tu historia..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => { setIsEditing(false); reset(); }}
                  className="text-slate-400 hover:text-white"
                >
                  <FaTimes className="mr-2" /> Cancelar
                </Button>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white"
                >
                  {isSubmitting ? (
                    <FaSpinner className="animate-spin mr-2" />
                  ) : (<FaSave className="mr-2" />)}
                  Guardar Cambios
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

function InfoItem({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 text-slate-500">{icon}</div>
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase">{label}</p>
        <p className="text-slate-200 font-medium">
          {value || <span className="text-slate-600 italic">No especificado</span>}
        </p>
      </div>
    </div>
  );
}
