import axios from 'axios';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FaSpinner, FaCloudUploadAlt, FaFileAlt } from 'react-icons/fa';

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

const OFICIOS_LISTA = [
  "Gasfitería", "Electricidad", "Pintura", "Albañilería", "Carpintería",
  "Jardinería", "Mecánica", "Plomería", "Cerrajería", 
  "Reparación de Electrodomésticos", "Instalación de Aire Acondicionado",
  "Servicios de Limpieza", "Techado", "Otro"
];

// --- 1. SCHEMAS ACTUALIZADOS PARA ACEPTAR CUALQUIER ARCHIVO ---
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const applicationSchema = z.object({
  nombres: z.string().min(1, "El nombre es requerido"),
  primer_apellido: z.string().min(1, "El apellido es requerido"),
  segundo_apellido: z.string().optional(),
  direccion: z.string().min(1, "La dirección es requerida"),
  telefono: z.string().optional(),
  oficio: z.string().min(1, "Debes seleccionar un oficio"),
  bio: z.string().min(50, "Tu biografía debe tener al menos 50 caracteres"),
  
  // Aceptamos cualquier archivo, solo validamos que exista y el peso
  archivos_portafolio: z.instanceof(FileList)
    .refine((files) => files.length > 0, "Debes subir al menos un archivo para tu portafolio.")
    .refine((files) => Array.from(files).every(file => file.size <= MAX_FILE_SIZE), "Cada archivo no debe superar los 10MB."),
    
  archivos_certificados: z.instanceof(FileList)
    .refine((files) => files.length > 0, "Debes subir al menos un certificado.")
    .refine((files) => Array.from(files).every(file => file.size <= MAX_FILE_SIZE), "Cada archivo no debe superar los 10MB."),
});

type ApplicationFormInputs = z.infer<typeof applicationSchema>;

interface UserProfile {
  nombres: string;
  primer_apellido: string;
  segundo_apellido: string | null;
  direccion: string | null;
  telefono: string | null;
}

const fetchUserProfile = async (token: string | null): Promise<UserProfile> => {
  if (!token) throw new Error("No autenticado");
  const { data } = await axios.get('/api/profile/me', { 
    headers: { Authorization: `Bearer ${token}` } 
  });
  return data;
};

const sendPostulacion = async ({ formData, token }: { formData: FormData, token: string | null }) => {
  if (!token) throw new Error("No autenticado");
  const { data } = await axios.post('/api/postulaciones', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`
    }
  });
  return data;
};

const InputError = ({ message }: { message?: string }) => 
  message ? <p className="mt-1 text-sm text-red-400">{message}</p> : null;

export default function ProviderApplicationPage() {
  const token = useAuthStore((state) => state.token);
  const navigate = useNavigate();
  
  const [modalInfo, setModalInfo] = useState<{ isOpen: boolean; title: string; description: string; type: 'success' | 'error' }>({
    isOpen: false, title: '', description: '', type: 'success',
  });

  const { register, handleSubmit, control, watch, reset, formState: { errors } } = useForm<ApplicationFormInputs>({
    resolver: zodResolver(applicationSchema),
    defaultValues: { nombres: "", primer_apellido: "", direccion: "", bio: "" }
  });
  
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => fetchUserProfile(token),
    enabled: !!token,
  });

  useEffect(() => {
    if (profile) {
      reset({
        nombres: profile.nombres || '',
        primer_apellido: profile.primer_apellido || '',
        segundo_apellido: profile.segundo_apellido || '',
        direccion: profile.direccion || '',
        telefono: profile.telefono || '',
      });
    }
  }, [profile, reset]);

  const portfolioFiles = watch("archivos_portafolio");
  const certificateFiles = watch("archivos_certificados");

  const mutation = useMutation({
    mutationFn: sendPostulacion,
    onSuccess: (data) => {
      setModalInfo({
        isOpen: true,
        title: '¡Postulación Enviada!',
        description: `Tu postulación ha sido enviada con éxito. Estado: ${data.statusPostulacion}.`,
        type: 'success',
      });
    },
    onError: (err) => {
      console.error(err);
      setModalInfo({
        isOpen: true,
        title: 'Error al Enviar',
        description: 'No se pudo enviar tu postulación. Revisa los datos.',
        type: 'error',
      });
    }
  });
  
  const handleCloseModal = () => {
    setModalInfo({ ...modalInfo, isOpen: false });
    if (modalInfo.type === 'success') navigate('/perfil');
  };

  const onSubmit: SubmitHandler<ApplicationFormInputs> = (data) => {
    const formData = new FormData();
    // Append datos básicos...
    Object.entries(data).forEach(([key, value]) => {
        if (key !== 'archivos_portafolio' && key !== 'archivos_certificados' && value) {
            formData.append(key, value as string);
        }
    });

    // Append archivos
    for (const file of Array.from(data.archivos_portafolio)) formData.append('archivos_portafolio', file);
    for (const file of Array.from(data.archivos_certificados)) formData.append('archivos_certificados', file);

    mutation.mutate({ formData, token });
  };
    
  // Helper visual para mostrar qué se seleccionó
  const getFileLabel = (files: FileList | undefined, placeholder: string) => {
    if (!files || files.length === 0) return placeholder;
    if (files.length === 1) return files[0].name;
    return `${files.length} archivos seleccionados`;
  };

  if (isLoadingProfile) return <div className="flex justify-center items-center min-h-[50vh]"><FaSpinner className="animate-spin text-amber-400 text-4xl" /></div>;

  return (
    <>
      <InfoDialog isOpen={modalInfo.isOpen} onClose={handleCloseModal} title={modalInfo.title} description={modalInfo.description} type={modalInfo.type} />

      <div className="p-4 sm:p-8 bg-slate-950 min-h-screen">
        <div className="mx-auto max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-3xl font-bold text-white mb-2 text-center">Postulación a Prestador</h1>
          <p className="text-slate-400 text-center mb-8 text-sm">Únete a nuestra red de expertos y haz crecer tu negocio.</p>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Datos Personales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="nombres">Nombres</Label>
                <Input id="nombres" {...register("nombres")} className="bg-slate-800 border-slate-700" />
                <InputError message={errors.nombres?.message} />
              </div>
              <div>
                <Label htmlFor="primer_apellido">Primer Apellido</Label>
                <Input id="primer_apellido" {...register("primer_apellido")} className="bg-slate-800 border-slate-700" />
                <InputError message={errors.primer_apellido?.message} />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="segundo_apellido">Segundo Apellido (Opcional)</Label>
                <Input id="segundo_apellido" {...register("segundo_apellido")} className="bg-slate-800 border-slate-700" />
              </div>
              <div>
                <Label htmlFor="telefono">Teléfono</Label>
                <Input type="tel" id="telefono" {...register("telefono")} className="bg-slate-800 border-slate-700" />
              </div>
            </div>

            <div>
              <Label htmlFor="direccion">Dirección</Label>
              <Input id="direccion" {...register("direccion")} className="bg-slate-800 border-slate-700" />
              <InputError message={errors.direccion?.message} />
            </div>

            {/* Datos Profesionales */}
            <div className="pt-4 border-t border-slate-800">
                <h3 className="text-lg font-semibold text-white mb-4">Perfil Profesional</h3>
                
                <div className="mb-4">
                    <Label htmlFor="oficio">Oficio Principal</Label>
                    <Controller
                        name="oficio"
                        control={control}
                        render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                            <SelectValue placeholder="Selecciona tu especialidad..." />
                            </SelectTrigger>
                            <SelectContent>
                            {OFICIOS_LISTA.map((oficio) => (
                                <SelectItem key={oficio} value={oficio}>{oficio}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        )}
                    />
                    <InputError message={errors.oficio?.message} />
                </div>

                <div>
                    <Label htmlFor="bio">Biografía Profesional</Label>
                    <Textarea id="bio" rows={4} {...register("bio")} className="bg-slate-800 border-slate-700" placeholder="Describe tu experiencia, herramientas que manejas, etc..." />
                    <InputError message={errors.bio?.message} />
                </div>
            </div>

            {/* Carga de Archivos */}
            <div className="pt-4 border-t border-slate-800 space-y-5">
                <h3 className="text-lg font-semibold text-white">Documentación</h3>

                {/* Portafolio */}
                <div>
                    <Label className="flex items-center gap-2 mb-2">
                        <FaCloudUploadAlt className="text-cyan-400" /> Portafolio (Fotos, PDF, etc.)
                    </Label>
                    <label 
                        htmlFor="archivos_portafolio" 
                        className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-slate-800/50 transition-colors ${errors.archivos_portafolio ? 'border-red-500 bg-red-900/10' : 'border-slate-700 bg-slate-800/30'}`}
                    >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <p className="text-sm text-slate-400 font-medium truncate max-w-xs">
                                {getFileLabel(portfolioFiles, "Haz clic para subir archivos")}
                            </p>
                        </div>
                        <Input 
                            type="file" 
                            id="archivos_portafolio" 
                            {...register("archivos_portafolio")} 
                            multiple 
                            // 2. CORRECCIÓN: Quitamos accept para permitir todo
                            className="hidden"
                        />
                    </label>
                    <InputError message={errors.archivos_portafolio?.message} />
                </div>
                
                {/* Certificados */}
                <div>
                    <Label className="flex items-center gap-2 mb-2">
                        <FaFileAlt className="text-amber-400" /> Certificados y Antecedentes
                    </Label>
                    <label 
                        htmlFor="archivos_certificados" 
                        className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-slate-800/50 transition-colors ${errors.archivos_certificados ? 'border-red-500 bg-red-900/10' : 'border-slate-700 bg-slate-800/30'}`}
                    >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <p className="text-sm text-slate-400 font-medium truncate max-w-xs">
                                {getFileLabel(certificateFiles, "Sube tus certificados aquí")}
                            </p>
                        </div>
                        <Input 
                            type="file" 
                            id="archivos_certificados" 
                            {...register("archivos_certificados")} 
                            multiple 
                            // 2. CORRECCIÓN: Sin restricciones de tipo
                            className="hidden"
                        />
                    </label>
                    <InputError message={errors.archivos_certificados?.message} />
                </div>
            </div>

            <div className="pt-4">
              <Button 
                type="submit" 
                disabled={mutation.isPending} 
                className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-bold py-6 text-lg hover:from-amber-500 hover:to-orange-600 shadow-lg"
              >
                {mutation.isPending ? "Enviando..." : "Enviar Postulación"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}