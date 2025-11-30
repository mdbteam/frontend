import axios, { type AxiosError } from 'axios';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FaSpinner } from 'react-icons/fa';

import { InfoDialog } from '../components/ui/InfoDialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '../components/ui/select';

import { FileUpload } from '../components/form/FileUpload';

// Definición de tipos de modal
interface ModalState {
    isOpen: boolean; 
    title: string; 
    description: string; 
    type: 'success' | 'error';
}

// Lista de Oficios
const OFICIOS_LISTA = [
    "Gasfiteria", "Electricidad", "Pintura", "Albanileria", "Carpinteria",
    "Jardineria", "Mecanica", "Retiro de Escombros", "Cerrajeria", 
    "Reparacion de Electrodomesticos", "Flete y Mudanza",
    "Servicios de Limpieza", "Techado", "Otro"
];

// Constantes de Validación (omito la definición, asumo que son correctas)
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
const ACCEPTED_IMAGE_TYPES_STRING = ACCEPTED_IMAGE_TYPES.join(',');
const ACCEPTED_CERT_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", ...ACCEPTED_IMAGE_TYPES];
const ACCEPTED_CERT_TYPES_STRING = ACCEPTED_CERT_TYPES.join(',');
const nameRegex = /^[A-Za-z\u00C0-\u017F ]+$/; 

// Esquema de Validación Zod (omito la definición, asumo que es correcta)
const applicationSchema = z.object({
    nombres: z.string() 
        .refine(val => !val || nameRegex.test(val), { message: "Solo se permiten letras" })
        .or(z.string().min(1, "El nombre es requerido").regex(nameRegex, "Solo se permiten letras")),
    primer_apellido: z.string()
        .refine(val => !val || nameRegex.test(val), { message: "Solo se permiten letras" })
        .or(z.string().min(1, "El apellido es requerido").regex(nameRegex, "Solo se permiten letras")),
    segundo_apellido: z.string()
        .optional()
        .nullable()
        .refine(val => !val || nameRegex.test(val), { message: "Solo se permiten letras" }),
    
    direccion: z.string().min(1, "La direccion es requerida"),
    telefono: z.string()
        .min(9, "Debe tener 9 digitos")
        .max(9, "Debe tener exactamente 9 digitos")
        .regex(/^[0-9]{9}$/, "Solo numeros"),
    oficio: z.string().min(1, "Debes seleccionar un oficio"),
    bio: z.string().min(50, "Tu biografia debe tener al menos 50 caracteres"),
    
    archivos_portafolio: z
        .custom<File[]>()
        .refine(f => f && f.length > 0, "Debes subir al menos una imagen.")
        .refine(f => Array.from(f).every(file => file.size <= MAX_FILE_SIZE), "Cada archivo de portafolio no debe superar los 10MB."),
    
    archivos_certificados: z
        .custom<File[]>()
        .refine(f => f && f.length > 0, "Debes subir al menos un certificado.")
        .refine(f => Array.from(f).every(file => file.size <= MAX_FILE_SIZE), "Cada archivo de certificado no debe superar los 10MB."),
});

type ApplicationFormInputs = z.infer<typeof applicationSchema>;

// ---------------- API TYPES ----------------
interface UserProfile {
    nombres: string;
    primer_apellido: string;
    segundo_apellido: string | null;
    direccion: string | null;
    telefono: string | null;
    avatar_url?: string;
}

interface PostulacionResponse {
    statusPostulacion: string;
}

// ---------------- BASE URL CONFIGURATION ----------------
const apiProveedores = axios.create({
    // URL base, crucial para evitar 404 y 403 por destino incorrecto.
    baseURL: 'https://provider-service-mjuj.onrender.com' 
});

// ---------------- API HELPERS----------------
const fetchUserProfile = async (token: string | null): Promise<UserProfile> => {
    if (!token) throw new Error("No autenticado");
    // === CORRECCIÓN DEL ENDPOINT ===
    // Se corrige la ruta a '/profile/me' que es la que se confirmó en la documentación
    const { data } = await apiProveedores.get('/profile/me', { 
        headers: { Authorization: `Bearer ${token}` } 
    });
    return data; 
};

const sendPostulacion = async ({ formData, token }: { formData: FormData; token: string | null; }): Promise<PostulacionResponse> => {
    if (!token) throw new Error("No autenticado");
    // Usamos la instancia de axios con la URL base
    const { data } = await apiProveedores.post('/postulaciones', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
        }
    });
    return data;
};

// ---------------- UI HELPERS ----------------
const InputError = ({ message }: { message?: string }) =>
    message ? <p className="mt-1 text-sm text-red-400" role="alert">{message}</p> : null;


// ---------------- COMPONENTE PRINCIPAL ----------------
export default function ProviderApplicationPage() {
    const token = useAuthStore((state) => state.token);
    const navigate = useNavigate();

    const [modalInfo, setModalInfo] = useState<ModalState>({
        isOpen: false, title: '', description: '', type: 'success'
    });

    const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } =
        useForm<ApplicationFormInputs>({
            resolver: zodResolver(applicationSchema),
            defaultValues: {
                nombres: "",
                primer_apellido: "",
                segundo_apellido: "",
                direccion: "",
                telefono: "",
                oficio: "",
                bio: "",
                archivos_portafolio: [],
                archivos_certificados: [],
            }
        });

    // === Carga de datos del perfil para pre-llenado ===
    const { data: profile, isLoading: isLoadingProfile, isError: isProfileError } = useQuery({
        queryKey: ['userProfile'],
        queryFn: () => fetchUserProfile(token),
        // La consulta solo se ejecuta si hay un token
        enabled: !!token, 
        // Desactiva reintentos si falla para ver el error (403/404)
        retry: false, 
    });
    
    // === FUNCIÓN CLAVE PARA PRE-LLENAR EL FORMULARIO ===
    useEffect(() => {
        if (profile) {
            console.log("Datos de perfil cargados, rellenando formulario:", profile);
            reset({
                // Campos de nombre y apellido: se rellenan y DESHABILITAN en el UI
                nombres: profile.nombres || '',
                primer_apellido: profile.primer_apellido || '',
                segundo_apellido: profile.segundo_apellido || '',
                
                // Campos de contacto/dirección: se rellenan y son EDITABLES
                direccion: profile.direccion || '',
                telefono: profile.telefono || '', 
                
                // Campos específicos de la postulación: se mantienen vacíos para que el usuario los complete
                oficio: "", 
                bio: "", 
                archivos_portafolio: [],
                archivos_certificados: [],
            });
        }
    }, [profile, reset]);

    // --- MUTATION para la postulacion ---
    const mutation = useMutation<PostulacionResponse, AxiosError, { formData: FormData; token: string | null }>({
        mutationFn: sendPostulacion,
        onSuccess: (data) => {
            setModalInfo({ isOpen: true, title: '¡Postulacion Enviada! 🚀', description: `Tu postulacion ha sido enviada con exito. Estado: ${data.statusPostulacion}.`, type: 'success' });
        },
        onError: (error) => {
            // Manejo de errores detallado (como en el código original)
            let errorMessage = 'No se pudo enviar tu postulacion. Revisa los datos.';
            if (error.response?.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
                errorMessage = (error.response.data as { message: string }).message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            setModalInfo({ isOpen: true, title: 'Error al Enviar ❌', description: errorMessage, type: 'error' });
        }
    });

    const closeModal = () => {
        setModalInfo((prev: ModalState) => ({ ...prev, isOpen: false })); 
        if (modalInfo.type === 'success') navigate('/perfil');
    };

    const onSubmit: SubmitHandler<ApplicationFormInputs> = (data) => {
        // Lógica de construcción de FormData (como en el código original)
        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
            if (key !== 'archivos_portafolio' && key !== 'archivos_certificados' && value !== undefined && value !== null) {
                formData.append(key, value as string);
            }
        });

        for (const file of data.archivos_portafolio || []) {
            formData.append('archivos_portafolio', file);
        }
        for (const file of data.archivos_certificados || []) {
            formData.append('archivos_certificados', file);
        }

        mutation.mutate({ formData, token });
    };

    if (isLoadingProfile) return <div className="flex justify-center items-center min-h-[50vh]"><FaSpinner className="animate-spin text-amber-400 text-4xl" /></div>;
    
    if (isProfileError) {
        // Muestra un mensaje amigable, pero permite al usuario llenar el formulario
        console.error("Error al cargar el perfil. El usuario puede seguir llenando el formulario:", errors);
    }

    // ---------------- UI ----------------
    return (
        <>
            <InfoDialog isOpen={modalInfo.isOpen} onClose={closeModal} title={modalInfo.title} description={modalInfo.description} type={modalInfo.type} />

            <div className="p-4 sm:p-8 bg-slate-950 min-h-screen">
                <div className="mx-auto max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
                    <h1 className="text-3xl font-bold text-white mb-2 text-center">Postulacion a Prestador 🛠️</h1>
                    <p className="text-slate-400 text-center mb-8 text-sm">Completa la informacion para que los clientes puedan conocerte y contratarte.</p>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                        <div className="border-t border-slate-800" />
                        
                        {/* ---------------- DATOS PERSONALES Y CONTACTO ---------------- */}
                        <section className="space-y-6">
                            <h3 className="text-xl font-bold text-white mb-4">1. Informacion Personal y Contacto</h3>
                            
                            {/* Nombres y Apellidos (Horizontal) - DESACTIVADOS para edición */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div>
                                    <Label htmlFor="nombres">Nombres</Label>
                                    <Input id="nombres" placeholder="Ej: Juan Carlos" {...register("nombres")} className="bg-slate-800 border-slate-700" disabled={true} />
                                    <p className="text-xs text-slate-500 mt-1">Solo editable en la sección de Perfil.</p>
                                </div>

                                <div>
                                    <Label htmlFor="primer_apellido">Primer Apellido</Label>
                                    <Input id="primer_apellido" placeholder="Ej: Fernandez" {...register("primer_apellido")} className="bg-slate-800 border-slate-700" disabled={true} />
                                </div>

                                <div>
                                    <Label htmlFor="segundo_apellido">Segundo Apellido (Opcional)</Label>
                                    <Input id="segundo_apellido" placeholder="Ej: Bravo" {...register("segundo_apellido")} className="bg-slate-800 border-slate-700" disabled={true} />
                                </div>
                            </div>
                            
                            {/* Telefono y Direccion (Horizontal) - EDITABLES */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <Label htmlFor="telefono">Teléfono (9 digitos)</Label>
                                    <Input id="telefono" placeholder="Ej: 987654321" maxLength={9} inputMode="numeric" {...register("telefono")} className="bg-slate-950 border-slate-700" />
                                    <InputError message={errors.telefono?.message} />
                                </div>

                                <div>
                                    <Label htmlFor="direccion">Dirección</Label>
                                    <Input id="direccion" placeholder="Ej: Av. Siempre Viva 742" {...register("direccion")} className="bg-slate-950 border-slate-700" />
                                    <InputError message={errors.direccion?.message} />
                                </div>
                            </div>
                        </section>
                        
                        <div className="border-t border-slate-800" />

                        {/* ---------------- PERFIL PROFESIONAL ---------------- */}
                        <section className="space-y-6">
                            <h3 className="text-xl font-bold text-white mb-4">2. Habilidades y Presentacion</h3>

                            <div className="mb-4">
                                <Label htmlFor="oficio">Oficio Principal</Label>
                                <Controller name="oficio" control={control} render={({ field }) => (
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                                            <SelectValue placeholder="Selecciona tu especialidad..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {OFICIOS_LISTA.map(oficio => <SelectItem key={oficio} value={oficio}>{oficio}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                )} />
                                <InputError message={errors.oficio?.message} />
                            </div>

                            <div>
                                <Label htmlFor="bio">Biografia Profesional (Minimo 50 caracteres)</Label>
                                <Textarea id="bio" rows={4} placeholder="Describe tu experiencia, certificaciones relevantes..." {...register("bio")} className="bg-slate-950 border-slate-700" />
                                <InputError message={errors.bio?.message} />
                            </div>
                        </section>
                        
                        <div className="border-t border-slate-800" />

                        {/* ---------------- DOCUMENTACION Y PORTAFOLIO ---------------- */}
                        <section className="space-y-8">
                            <h3 className="text-xl font-bold text-white">3. Documentacion y Portafolio</h3>

                            {/* PORTAFOLIO CON FileUpload */}
                            <Controller
                                name="archivos_portafolio"
                                control={control}
                                rules={{ validate: (files) => files && files.length > 0 || "Debes subir al menos una imagen."}}
                                render={({ field }) => (
                                    <div>
                                        <FileUpload
                                            label="Portafolio (Solo imagenes)"
                                            helpText="Sube al menos una imagen (JPG, PNG, WEBP, GIF). Max. 10MB por archivo."
                                            acceptedFileTypes={ACCEPTED_IMAGE_TYPES_STRING}
                                            files={field.value || []}
                                            onFilesChange={field.onChange}
                                        />
                                        <InputError message={errors.archivos_portafolio?.message} />
                                    </div>
                                )}
                            />

                            {/* CERTIFICADOS CON FileUpload */}
                            <Controller
                                name="archivos_certificados"
                                control={control}
                                rules={{ validate: (files) => files && files.length > 0 || "Debes subir al menos un certificado."}}
                                render={({ field }) => (
                                    <div>
                                        <FileUpload
                                            label="Certificados de Especialidad"
                                            helpText="Sube documentos que acrediten tus habilidades (PDF, Word, imagenes). Max. 10MB por archivo."
                                            acceptedFileTypes={ACCEPTED_CERT_TYPES_STRING}
                                            files={field.value || []}
                                            onFilesChange={field.onChange}
                                        />
                                        <InputError message={errors.archivos_certificados?.message} />
                                    </div>
                                )}
                            />
                        </section>
                        
                        <div className="border-t border-slate-800" />

                        {/* ---------------- BOTÓN ENVIAR ---------------- */}
                        <div className="pt-4">
                            <Button 
                                type="submit" 
                                disabled={isSubmitting || mutation.isPending} 
                                className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-bold py-3 text-lg hover:from-amber-500 hover:to-orange-600 shadow-lg transition-all"
                            >
                                {isSubmitting || mutation.isPending ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <FaSpinner className="animate-spin" /> Enviando Postulacion...
                                    </span>
                                ) : "Enviar Postulacion"}
                            </Button>
                        </div>

                    </form>
                </div>
            </div>
        </>
    );
}