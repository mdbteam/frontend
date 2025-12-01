import { useEffect, useState, useCallback } from 'react';
import { useForm, type SubmitHandler, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useDropzone } from 'react-dropzone'; 
import { 
    FaSpinner, FaPencilAlt, FaTimes, FaSave, FaUserCircle, 
    FaEnvelope, FaPhone, FaMapMarkerAlt, FaBriefcase, 
    FaCalendarAlt, FaQuoteLeft, FaCamera 
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
    resumen?: string;
    perfil?: {
        biografia?: string;
        resumen_profesional?: string;
        anos_experiencia?: number;
    }
}

interface ModalState {
    isOpen: boolean; 
    title: string; 
    description: string; 
    type: 'success' | 'error';
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

const updateProfilePicture = async ({ file, token }: { file: File; token: string | null }) => {
    if (!token) throw new Error("No token");
    const formData = new FormData();
    formData.append('file', file);
    
    return apiProveedores.put('/profile/me/picture', formData, {
        headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
        }
    });
};

// --- COMPONENTE PRINCIPAL ---
export function MyProfileForm() {
    const { token, setUser, user } = useAuthStore();
    const queryClient = useQueryClient();

    const [isEditing, setIsEditing] = useState(false);
    const [modalInfo, setModalInfo] = useState<ModalState>({
        isOpen: false,
        title: "",
        description: "",
        type: "success"
    });

    const { data: profileData, isLoading, error } = useQuery({
        queryKey: ['myProfile'],
        queryFn: () => fetchMyProfile(token),
        retry: false,
    });

    const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm<ProfileFormInputs>({
        resolver: zodResolver(profileUpdateSchema) as Resolver<ProfileFormInputs>,
        defaultValues: {
            nombres: "",
            primer_apellido: "",
            correo: ""
        }
    });

    // LÓGICA DE MAPEO DE DATOS
    useEffect(() => {
        if (profileData) {
            const bioValue = 
                profileData.biografia || 
                profileData.bio || 
                profileData.perfil?.biografia || 
                "";

            const resumenValue = 
                profileData.resumen_profesional || 
                profileData.resumen || 
                profileData.perfil?.resumen_profesional || 
                "";

            const experienciaValue = 
                profileData.anos_experiencia ?? 
                profileData.perfil?.anos_experiencia ?? 
                null;

            reset({
                nombres: profileData.nombres || "",
                primer_apellido: profileData.primer_apellido || "",
                segundo_apellido: profileData.segundo_apellido || "",
                direccion: profileData.direccion || "",
                genero: profileData.genero || "",
                fecha_nacimiento: profileData.fecha_nacimiento || "",
                biografia: bioValue,
                resumen_profesional: resumenValue,
                anos_experiencia: experienciaValue,
                correo: profileData.correo || "",
                telefono: profileData.telefono || "",
            });
        }
    }, [profileData, reset]);

    const mutation = useMutation({
        mutationFn: updateMyProfile,
        onSuccess: (response, variables) => {
            queryClient.invalidateQueries({ queryKey: ['myProfile'] });
            
            if (user) {
                setUser({ 
                    ...user, 
                    ...response.data,
                    ...variables.data 
                });
            }
            
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

    const photoMutation = useMutation({
        mutationFn: updateProfilePicture,
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['myProfile'] });
            if (user) setUser({ ...user, ...response.data });
            setModalInfo({
                isOpen: true,
                title: "Foto Actualizada",
                description: "Tu foto de perfil se ha actualizado.",
                type: "success"
            });
        },
        onError: () => {
            setModalInfo({
                isOpen: true,
                title: "Error",
                description: "No se pudo actualizar la foto.",
                type: "error"
            });
        }
    });
    
    // --- Lógica de Dropzone para la foto de perfil ---
    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            photoMutation.mutate({ file: acceptedFiles[0], token });
        } else {
            setModalInfo({
                isOpen: true,
                title: "Error de Archivo",
                description: "Tipo de archivo no válido o archivo demasiado grande.",
                type: "error"
            });
        }
    }, [photoMutation, token]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/jpeg': ['.jpeg', '.jpg'],
            'image/png': ['.png']
        },
        maxFiles: 1,
        noKeyboard: true, 
    });
    // --------------------------------------------------

    const onSubmit: SubmitHandler<ProfileFormInputs> = (formData) => {
        mutation.mutate({ data: formData, token });
    };

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

    const displayBio = 
        profileData.biografia || 
        profileData.bio || 
        profileData.perfil?.biografia || 
        "";

    const displayResumen = 
        profileData.resumen_profesional || 
        profileData.resumen || 
        profileData.perfil?.resumen_profesional || 
        "";

    const displayExperiencia = 
        profileData.anos_experiencia ?? 
        profileData.perfil?.anos_experiencia ?? 
        null;

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

                {/* HEADER CON FOTO EDITABLE (usando Dropzone) */}
                <div className="bg-slate-950/50 p-6 border-b border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            
                            {/* Área de Dropzone/Click */}
                            <div 
                                {...getRootProps()}
                                className={`h-20 w-20 rounded-full border-2 cursor-pointer transition-all duration-300 overflow-hidden flex items-center justify-center shadow-lg
                                    ${isDragActive ? 'border-cyan-400 bg-slate-700/50 scale-105' : 'border-cyan-500/50 bg-slate-800 hover:border-cyan-400'}`
                                }
                                aria-label="Haz clic o arrastra para cambiar la foto de perfil"
                                title="Cambiar foto de perfil"
                            >
                                <input {...getInputProps()} />

                                {profileData.foto_url ? (
                                    <img
                                        src={profileData.foto_url}
                                        alt="Profile"
                                        className="h-full w-full object-cover group-hover:opacity-50 transition-opacity"
                                    />
                                ) : (
                                    <FaUserCircle className="text-5xl text-slate-600 group-hover:text-slate-500 transition-colors" />
                                )}
                                
                                {/* Overlay de cámara/carga MEJORADO */}
                                <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300
                                    ${photoMutation.isPending || isDragActive ? 'opacity-100 bg-black/60' : 'opacity-0 group-hover:opacity-100 bg-black/40'}`}
                                >
                                    {photoMutation.isPending ? (
                                        <FaSpinner className="animate-spin text-cyan-400 text-xl" />
                                    ) : (
                                        <FaCamera className="text-white text-xl drop-shadow-md" />
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-white">
                                {profileData.nombres} {profileData.primer_apellido}
                            </h2>
                            <p className="text-cyan-400 text-sm font-medium uppercase tracking-wider flex items-center gap-2">
                                {profileData.rol || 'Usuario'}
                                {profileData.rol?.toLowerCase() === 'prestador' && <span className="bg-cyan-500/10 text-cyan-400 text-[10px] px-2 py-0.5 rounded-full border border-cyan-500/20">Verificado</span>}
                            </p>
                        </div>
                    </div>

                    {!isEditing && (
                        <Button
                            onClick={() => setIsEditing(true)}
                            className="bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 hover:border-cyan-500/50 transition-all shadow-sm"
                        >
                            <FaPencilAlt className="mr-2" /> Editar Perfil
                        </Button>
                    )}
                </div>

                {/* BODY */}
                <div className="p-6">

                    {!isEditing ? (
                        // --- MODO LECTURA ---
                        <div className="space-y-8 animate-in fade-in duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                                <InfoItem icon={<FaEnvelope />} label="Correo" value={profileData.correo} />
                                <InfoItem icon={<FaPhone />} label="Teléfono" value={profileData.telefono} />
                                <InfoItem icon={<FaCalendarAlt />} label="Nacimiento" value={profileData.fecha_nacimiento} />
                                <InfoItem icon={<FaUserCircle />} label="Género" value={profileData.genero} />
                                <InfoItem icon={<FaMapMarkerAlt />} label="Dirección" value={profileData.direccion} />
                                <InfoItem icon={<FaBriefcase />} label="Experiencia" value={
                                    displayExperiencia ? `${displayExperiencia} años` : null
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
                                            {displayResumen || (
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
                        // --- MODO EDICIÓN (REORDENADO Y BLOQUEADO) ---
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                            
                            {/* SECCIÓN 1: IDENTIDAD (Datos Personales) */}
                            <div className="space-y-4">
                                <h3 className="text-cyan-400 text-sm font-bold uppercase tracking-wider border-b border-slate-800 pb-2 mb-4">
                                    Información Personal
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div>
                                        <Label htmlFor="nombres">Nombres</Label>
                                        <Input id="nombres" {...register("nombres")} disabled={true} className="bg-slate-800 border-slate-700 text-slate-400 cursor-not-allowed mt-1.5" />
                                        {errors.nombres && <span className="text-red-400 text-xs">{errors.nombres.message}</span>}
                                    </div>
                                    <div>
                                        <Label htmlFor="primer_apellido">Primer Apellido</Label>
                                        <Input id="primer_apellido" {...register("primer_apellido")} disabled={true} className="bg-slate-800 border-slate-700 text-slate-400 cursor-not-allowed mt-1.5" />
                                        {errors.primer_apellido && <span className="text-red-400 text-xs">{errors.primer_apellido.message}</span>}
                                    </div>
                                    <div>
                                        <Label htmlFor="segundo_apellido">Segundo Apellido (Opcional)</Label>
                                        <Input id="segundo_apellido" {...register("segundo_apellido")} className="bg-slate-950 border-slate-700 mt-1.5" placeholder="Ej. Gómez" />
                                        {errors.segundo_apellido && <span className="text-red-400 text-xs">{errors.segundo_apellido.message}</span>}
                                    </div>
                                    <div>
                                        <Label htmlFor="fecha_nacimiento">Fecha Nacimiento (No editable)</Label>
                                        <Input id="fecha_nacimiento" type="date" {...register("fecha_nacimiento")} disabled={true} className="bg-slate-800 border-slate-700 text-slate-400 cursor-not-allowed mt-1.5" />
                                        {errors.fecha_nacimiento && <span className="text-red-400 text-xs">{errors.fecha_nacimiento.message}</span>}
                                    </div>
                                    <div>
                                        <Label htmlFor="genero">Género</Label>
                                        <select
                                            id="genero"
                                            {...register("genero")}
                                            className="bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-white w-full focus:outline-none focus:ring-2 focus:ring-cyan-500 mt-1.5 h-10"
                                        >
                                            <option value="">Selecciona</option>
                                            <option value="Masculino">Masculino</option>
                                            <option value="Femenino">Femenino</option>
                                            <option value="Prefiero no decirlo">Prefiero no decirlo</option>
                                        </select>
                                        {errors.genero && <span className="text-red-400 text-xs">{errors.genero.message}</span>}
                                    </div>
                                </div>
                            </div>

                            {/* SECCIÓN 2: CONTACTO */}
                            <div className="space-y-4">
                                <h3 className="text-cyan-400 text-sm font-bold uppercase tracking-wider border-b border-slate-800 pb-2 mb-4">
                                    Datos de Contacto
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div>
                                        <Label htmlFor="correo">Correo Electrónico</Label>
                                        <Input id="correo" {...register("correo")} disabled={true} className="bg-slate-800 border-slate-700 text-slate-400 cursor-not-allowed mt-1.5" />
                                        {errors.correo && <span className="text-red-400 text-xs">{errors.correo.message}</span>}
                                    </div>
                                    <div>
                                        <Label htmlFor="telefono">Teléfono</Label>
                                        <Input id="telefono" {...register("telefono")} maxLength={9} placeholder="912345678" className="bg-slate-950 border-slate-700 mt-1.5" />
                                        {errors.telefono && <span className="text-red-400 text-xs">{errors.telefono.message}</span>}
                                    </div>
                                    <div className="md:col-span-2 lg:col-span-1">
                                        <Label htmlFor="direccion">Dirección</Label>
                                        <Input id="direccion" {...register("direccion")} className="bg-slate-950 border-slate-700 mt-1.5" placeholder="Ej. Av. Providencia 1234" />
                                        {errors.direccion && <span className="text-red-400 text-xs">{errors.direccion.message}</span>}
                                    </div>
                                </div>
                            </div>

                            {/* SECCIÓN 3: PERFIL PROFESIONAL */}
                            <div className="space-y-4">
                                <h3 className="text-amber-400 text-sm font-bold uppercase tracking-wider border-b border-slate-800 pb-2 mb-4">
                                    Perfil Profesional
                                </h3>
                                <div className="space-y-6">
                                    <div className="w-full md:w-1/3">
                                        <Label htmlFor="anos_experiencia">Años de Experiencia</Label>
                                        <Input id="anos_experiencia" type="number" {...register("anos_experiencia")} className="bg-slate-950 border-slate-700 mt-1.5" placeholder="Ej. 5" />
                                        {errors.anos_experiencia && <span className="text-red-400 text-xs">{errors.anos_experiencia.message}</span>}
                                    </div>
                                    
                                    <div>
                                        <Label htmlFor="resumen_profesional">Resumen Profesional (Breve)</Label>
                                        <Textarea id="resumen_profesional" rows={3} {...register("resumen_profesional")} className="bg-slate-950 border-slate-700 mt-1.5" placeholder="Ej: Especialista en instalaciones eléctricas domiciliarias con certificación SEC." />
                                        {errors.resumen_profesional && <span className="text-red-400 text-xs">{errors.resumen_profesional.message}</span>}
                                    </div>
                                    
                                    <div>
                                        <Label htmlFor="biografia">Biografía Completa</Label>
                                        <Textarea id="biografia" rows={6} {...register("biografia")} className="bg-slate-950 border-slate-700 mt-1.5" placeholder="Cuenta tu historia, experiencia laboral completa, estudios, certificaciones, etc." />
                                        {errors.biografia && <span className="text-red-400 text-xs">{errors.biografia.message}</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-slate-800 sticky bottom-0 bg-slate-900 pb-2 z-10">
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
                                    className="bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-900/20"
                                >
                                    {isSubmitting ? <FaSpinner className="animate-spin mr-2" /> : <FaSave className="mr-2" />}
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

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | number | null; }) {
    return (
        <div className="flex items-start gap-3 group">
            <div className="mt-1 text-slate-500 group-hover:text-cyan-400 transition-colors">{icon}</div>
            <div>
                <p className="text-xs font-bold text-slate-500 uppercase group-hover:text-slate-400 transition-colors">{label}</p>
                <p className="text-slate-200 font-medium">
                    {value || <span className="text-slate-600 italic">No especificado</span>}
                </p>
            </div>
        </div>
    );
}