import axios from 'axios';
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

const OFICIOS_LISTA = [
  "Gasfitería", "Electricidad", "Pintura", "Albañilería", "Carpintería",
  "Jardinería", "Mecánica", "Plomería", "Cerrajería", 
  "Reparación de Electrodomésticos", "Instalación de Aire Acondicionado",
  "Servicios de Limpieza", "Techado", "Otro"
];

const applicationSchema = z.object({
  nombres: z.string().min(1, "El nombre es requerido"),
  primer_apellido: z.string().min(1, "El apellido es requerido"),
  segundo_apellido: z.string().optional(),
  direccion: z.string().min(1, "La dirección es requerida"),
  telefono: z.string().optional(),
  oficio: z.string().min(1, "Debes seleccionar un oficio"),
  bio: z.string().min(50, "Tu biografía debe tener al menos 50 caracteres"),
  
  archivos_portafolio: z.instanceof(FileList)
    .refine((files) => files.length > 0, "Debes subir al menos una imagen para tu portafolio.")
    .refine((files) => Array.from(files).every(file => file.size <= 5 * 1024 * 1024), "Cada archivo no debe superar los 5MB."),
    
  archivos_certificados: z.instanceof(FileList)
    .refine((files) => files.length > 0, "Debes subir al menos un certificado.")
    .refine((files) => Array.from(files).every(file => file.size <= 5 * 1024 * 1024), "Cada archivo no debe superar los 5MB."),
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

// --- CORRECCIÓN: Componente movido fuera del render principal ---
const InputError = ({ message }: { message?: string }) => 
  message ? <p className="mt-1 text-sm text-red-400">{message}</p> : null;

export default function ProviderApplicationPage() {
  const token = useAuthStore((state) => state.token);
  const navigate = useNavigate();
  
  const [modalInfo, setModalInfo] = useState<{ isOpen: boolean; title: string; description: string; type: 'success' | 'error' }>({
    isOpen: false,
    title: '',
    description: '',
    type: 'success',
  });

  const { register, handleSubmit, control, watch, reset, formState: { errors } } = useForm<ApplicationFormInputs>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      nombres: "",
      primer_apellido: "",
      segundo_apellido: "",
      direccion: "",
      telefono: "",
      bio: "",
    }
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
        description: `Tu postulación ha sido enviada con éxito. Estado actual: ${data.statusPostulacion}. Serás notificado cuando sea revisada.`,
        type: 'success',
      });
    },
    onError: (err) => {
      console.error(err);
      setModalInfo({
        isOpen: true,
        title: 'Error al Enviar',
        description: 'No se pudo enviar tu postulación. Por favor, revisa los campos e intenta de nuevo.',
        type: 'error',
      });
    }
  });
  
  const handleCloseModal = () => {
    setModalInfo({ ...modalInfo, isOpen: false });
    if (modalInfo.type === 'success') {
      navigate('/perfil');
    }
  };

  const onSubmit: SubmitHandler<ApplicationFormInputs> = (data) => {
    const formData = new FormData();
    formData.append('nombres', data.nombres);
    formData.append('primer_apellido', data.primer_apellido);
    if (data.segundo_apellido) formData.append('segundo_apellido', data.segundo_apellido);
    formData.append('direccion', data.direccion);
    if (data.telefono) formData.append('telefono', data.telefono);
    formData.append('oficio', data.oficio);
    formData.append('bio', data.bio);

    // --- CORRECCIÓN: Bucle for...of en lugar de forEach ---
    for (const file of Array.from(data.archivos_portafolio)) {
      formData.append('archivos_portafolio', file);
    }
    for (const file of Array.from(data.archivos_certificados)) {
      formData.append('archivos_certificados', file);
    }

    mutation.mutate({ formData, token });
  };
    
  const getFileLabel = (files: FileList | undefined) => {
    if (!files || files.length === 0) {
      return "Ningún archivo seleccionado";
    }
    if (files.length === 1) {
      return files[0].name;
    }
    return `${files.length} archivos seleccionados`;
  };

  if (isLoadingProfile) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <FaSpinner className="animate-spin text-amber-400 text-4xl" />
      </div>
    );
  }

  return (
    <>
      <InfoDialog
        isOpen={modalInfo.isOpen}
        onClose={handleCloseModal}
        title={modalInfo.title}
        description={modalInfo.description}
        type={modalInfo.type}
      />

      <div className="p-4 sm:p-8">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-4xl font-bold text-white font-poppins mb-8 text-center [text-shadow:0_0_15px_rgba(234,179,8,0.4)]">
            Postula para ser Prestador
          </h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="nombres">Nombres</Label>
                <Input type="text" id="nombres" {...register("nombres")} className={errors.nombres ? 'border-red-500' : ''} />
                <InputError message={errors.nombres?.message} />
              </div>
              <div>
                <Label htmlFor="primer_apellido">Primer Apellido</Label>
                <Input type="text" id="primer_apellido" {...register("primer_apellido")} className={errors.primer_apellido ? 'border-red-500' : ''} />
                <InputError message={errors.primer_apellido?.message} />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="segundo_apellido">Segundo Apellido (Opcional)</Label>
                <Input type="text" id="segundo_apellido" {...register("segundo_apellido")} />
              </div>
              <div>
                <Label htmlFor="telefono">Teléfono (Opcional)</Label>
                <Input type="tel" id="telefono" {...register("telefono")} />
              </div>
            </div>

            <div>
              <Label htmlFor="direccion">Dirección</Label>
              <Input type="text" id="direccion" {...register("direccion")} className={errors.direccion ? 'border-red-500' : ''} />
              <InputError message={errors.direccion?.message} />
            </div>

            <div>
              <Label htmlFor="oficio">Oficio Principal</Label>
              <Controller
                name="oficio"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className={errors.oficio ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecciona tu especialidad principal..." />
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
              <Label htmlFor="bio">Biografía (mín. 50 caracteres)</Label>
              <Textarea id="bio" rows={4} {...register("bio")} className={errors.bio ? 'border-red-500' : ''} placeholder="Habla sobre ti, tu experiencia..." />
              <InputError message={errors.bio?.message} />
            </div>

            <div>
              <Label>Portafolio (Imágenes de trabajos)</Label>
              <label 
                htmlFor="archivos_portafolio" 
                className={`flex h-10 w-full items-center rounded-md border border-slate-700 bg-slate-900/50 px-3 text-sm text-slate-100 ${errors.archivos_portafolio ? 'border-red-500' : ''} cursor-pointer`}
              >
                <span className="rounded-md bg-amber-400 text-slate-900 hover:bg-amber-400/90 px-4 py-1.5 text-sm font-semibold cursor-pointer">
                  Elegir archivos
                </span>
                <span className="ml-3 text-sm text-slate-400 truncate">
                  {getFileLabel(portfolioFiles)}
                </span>
              </label>
              <Input 
                type="file" 
                id="archivos_portafolio" 
                {...register("archivos_portafolio")} 
                multiple 
                accept="image/*" 
                className="hidden"
              />
              <InputError message={errors.archivos_portafolio?.message} />
            </div>
            
            <div>
              <Label>Certificados (PDF o Imágenes)</Label>
              <label 
                htmlFor="archivos_certificados" 
                className={`flex h-10 w-full items-center rounded-md border border-slate-700 bg-slate-900/50 px-3 text-sm text-slate-100 ${errors.archivos_certificados ? 'border-red-500' : ''} cursor-pointer`}
              >
                <span className="rounded-md bg-amber-400 text-slate-900 hover:bg-amber-400/90 px-4 py-1.5 text-sm font-semibold cursor-pointer">
                  Elegir archivos
                </span>
                <span className="ml-3 text-sm text-slate-400 truncate">
                  {getFileLabel(certificateFiles)}
                </span>
              </label>
              <Input 
                type="file" 
                id="archivos_certificados" 
                {...register("archivos_certificados")} 
                multiple 
                accept="image/*,application/pdf" 
                className="hidden"
              />
              <InputError message={errors.archivos_certificados?.message} />
            </div>

            <div>
              <Button 
                type="submit" 
                disabled={mutation.isPending} 
                className="w-full bg-amber-400 text-slate-900 hover:bg-amber-400/90"
              >
                {mutation.isPending ? "Enviando Postulación..." : "Enviar Postulación"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}