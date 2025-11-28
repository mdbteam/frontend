import axios from 'axios';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
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

// ---------------- VALIDACIONES -----------------
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif"
];

const ACCEPTED_CERT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ...ACCEPTED_IMAGE_TYPES
];

const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/;

const applicationSchema = z.object({
  nombres: z.string()
    .min(1, "El nombre es requerido")
    .regex(nameRegex, "Solo se permiten letras"),
  primer_apellido: z.string()
    .min(1, "El apellido es requerido")
    .regex(nameRegex, "Solo se permiten letras"),
  segundo_apellido: z.string()
    .optional()
    .refine(val => !val || nameRegex.test(val), { message: "Solo se permiten letras" }),
  direccion: z.string().min(1, "La dirección es requerida"),
  telefono: z.string()
    .min(9, "Debe tener 9 dígitos")
    .max(9, "Debe tener exactamente 9 dígitos")
    .regex(/^[0-9]{9}$/, "Solo números"),
  oficio: z.string().min(1, "Debes seleccionar un oficio"),
  bio: z.string().min(50, "Tu biografía debe tener al menos 50 caracteres"),
  archivos_portafolio: z
    .instanceof(FileList)
    .refine(f => f.length > 0, "Debes subir al menos una imagen.")
    .refine(f => Array.from(f).every(file => ACCEPTED_IMAGE_TYPES.includes(file.type)),
      "Solo se permiten imágenes (JPG, PNG, WEBP, GIF).")
    .refine(f => Array.from(f).every(file => file.size <= MAX_FILE_SIZE),
      "Cada archivo no debe superar los 10MB."),
  archivos_certificados: z
    .instanceof(FileList)
    .refine(f => f.length > 0, "Debes subir al menos un certificado.")
    .refine(f => Array.from(f).every(file => ACCEPTED_CERT_TYPES.includes(file.type)),
      "Certificados válidos: PDF, Word (doc, docx) o imágenes.")
    .refine(f => Array.from(f).every(file => file.size <= MAX_FILE_SIZE),
      "Cada archivo no debe superar los 10MB."),
});

type ApplicationFormInputs = z.infer<typeof applicationSchema>;

// ---------------- API TYPES ----------------
interface UserProfile {
  nombres: string;
  primer_apellido: string;
  segundo_apellido: string | null;
  direccion: string | null;
  telefono: string | null;
}

interface PostulacionResponse {
  statusPostulacion: string;
}

// ---------------- API HELPERS ----------------
const fetchUserProfile = async (token: string | null): Promise<UserProfile> => {
  if (!token) throw new Error("No autenticado");
  const { data } = await axios.get('/api/profile/me', { 
    headers: { Authorization: `Bearer ${token}` } 
  });
  return data;
};

const sendPostulacion = async ({ formData, token }: { formData: FormData; token: string | null; }): Promise<PostulacionResponse> => {
  if (!token) throw new Error("No autenticado");
  const { data } = await axios.post('/api/postulaciones', formData, {
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

// ---------------- COMPONENT ----------------
export default function ProviderApplicationPage() {
  const token = useAuthStore((state) => state.token);
  const navigate = useNavigate();

  const [modalInfo, setModalInfo] = useState<{ isOpen: boolean; title: string; description: string; type: 'success' | 'error' }>({
    isOpen: false, title: '', description: '', type: 'success'
  });

  // preview states
  const [portfolioPreviews, setPortfolioPreviews] = useState<string[]>([]);
  const [certificatePreviews, setCertificatePreviews] = useState<string[]>([]);
  // drag states
  const [draggingPortfolio, setDraggingPortfolio] = useState(false);
  const [draggingCertificates, setDraggingCertificates] = useState(false);

  // refs to revoke object URLs
  const portfolioUrlsRef = useRef<string[]>([]);
  const certificateUrlsRef = useRef<string[]>([]);

  const { register, handleSubmit, control, watch, reset, formState: { errors, isSubmitting } } =
    useForm<ApplicationFormInputs>({
      resolver: zodResolver(applicationSchema),
      defaultValues: {
        nombres: "",
        primer_apellido: "",
        segundo_apellido: "",
        direccion: "",
        telefono: "",
        oficio: "",
        bio: ""
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

  // cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      portfolioUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
      certificateUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  const mutation = useMutation<PostulacionResponse, unknown, { formData: FormData; token: string | null }>({
    mutationFn: sendPostulacion,
    onSuccess: (data) => {
      setModalInfo({ isOpen: true, title: '¡Postulación Enviada!', description: `Tu postulación ha sido enviada con éxito. Estado: ${data.statusPostulacion}.`, type: 'success' });
    },
    onError: () => {
      setModalInfo({ isOpen: true, title: 'Error al Enviar', description: 'No se pudo enviar tu postulación. Revisa los datos.', type: 'error' });
    }
  });

  const closeModal = () => {
    setModalInfo(prev => ({ ...prev, isOpen: false }));
    if (modalInfo.type === 'success') navigate('/perfil');
  };

  const onSubmit: SubmitHandler<ApplicationFormInputs> = (data) => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'archivos_portafolio' && key !== 'archivos_certificados' && value !== undefined) {
        formData.append(key, value as string);
      }
    });

    for (const file of Array.from(data.archivos_portafolio)) {
      formData.append('archivos_portafolio', file);
    }
    for (const file of Array.from(data.archivos_certificados)) {
      formData.append('archivos_certificados', file);
    }

    mutation.mutate({ formData, token });
  };

  // Helper for labels
  const portfolioFiles = watch("archivos_portafolio");
  const certificateFiles = watch("archivos_certificados");

  const getFileLabel = (files: FileList | undefined, placeholder: string) => {
    if (!files || files.length === 0) return placeholder;
    if (files.length === 1) return files[0].name;
    return `${files.length} archivos seleccionados`;
  };

  // Handlers for file selection + previews
  const handlePortfolioFiles = (files: FileList | null) => {
    // revoke previous URLs
    portfolioUrlsRef.current.forEach(u => URL.revokeObjectURL(u));
    portfolioUrlsRef.current = [];

    if (!files) {
      setPortfolioPreviews([]);
      return;
    }

    const fileArr = Array.from(files);
    const images = fileArr.filter(f => f.type.startsWith('image/'));

    const urls = images.map(f => {
      const u = URL.createObjectURL(f);
      portfolioUrlsRef.current.push(u);
      return u;
    });

    setPortfolioPreviews(urls);
  };

  const handleCertificateFiles = (files: FileList | null) => {
    certificateUrlsRef.current.forEach(u => URL.revokeObjectURL(u));
    certificateUrlsRef.current = [];

    if (!files) {
      setCertificatePreviews([]);
      return;
    }

    const fileArr = Array.from(files);
    const images = fileArr.filter(f => f.type.startsWith('image/'));

    const urls = images.map(f => {
      const u = URL.createObjectURL(f);
      certificateUrlsRef.current.push(u);
      return u;
    });

    setCertificatePreviews(urls);
  };

  // Drag & drop handlers for portfolio
  const onPortfolioDrop = (e: React.DragEvent<HTMLLabelElement>, fieldOnChange: (value: FileList | null) => void) => {
    e.preventDefault();
    setDraggingPortfolio(false);
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    fieldOnChange(files);
    handlePortfolioFiles(files);
  };

  // Drag & drop handlers for certificates
  const onCertificatesDrop = (e: React.DragEvent<HTMLLabelElement>, fieldOnChange: (value: FileList | null) => void) => {
    e.preventDefault();
    setDraggingCertificates(false);
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    fieldOnChange(files);
    handleCertificateFiles(files);
  };

  if (isLoadingProfile) return <div className="flex justify-center items-center min-h-[50vh]"><FaSpinner className="animate-spin text-amber-400 text-4xl" /></div>;

  // ---------------- UI
  return (
    <>
      <InfoDialog isOpen={modalInfo.isOpen} onClose={closeModal} title={modalInfo.title} description={modalInfo.description} type={modalInfo.type} />

      <div className="p-4 sm:p-8 bg-slate-950 min-h-screen">
        <div className="mx-auto max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-3xl font-bold text-white mb-2 text-center">Postulación a Prestador</h1>
          <p className="text-slate-400 text-center mb-8 text-sm">Únete a nuestra red de expertos y haz crecer tu negocio.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* ---------------- DATOS PERSONALES ---------------- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="nombres">Nombres</Label>
                <Input id="nombres" placeholder="Ej: Juan Carlos" {...register("nombres")} className="bg-slate-800 border-slate-700" />
                <InputError message={errors.nombres?.message} />
              </div>

              <div>
                <Label htmlFor="primer_apellido">Primer Apellido</Label>
                <Input id="primer_apellido" placeholder="Ej: Fernández" {...register("primer_apellido")} className="bg-slate-800 border-slate-700" />
                <InputError message={errors.primer_apellido?.message} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="segundo_apellido">Segundo Apellido (Opcional)</Label>
                <Input id="segundo_apellido" placeholder="Ej: Bravo" {...register("segundo_apellido")} className="bg-slate-800 border-slate-700" />
                <InputError message={errors.segundo_apellido?.message} />
              </div>

              <div>
                <Label htmlFor="telefono">Teléfono</Label>
                <Input id="telefono" placeholder="Ej: 987654321" maxLength={9} inputMode="numeric" {...register("telefono")} className="bg-slate-800 border-slate-700" />
                <InputError message={errors.telefono?.message} />
              </div>
            </div>

            <div>
              <Label htmlFor="direccion">Dirección</Label>
              <Input id="direccion" placeholder="Ej: Av. Siempre Viva 742" {...register("direccion")} className="bg-slate-800 border-slate-700" />
              <InputError message={errors.direccion?.message} />
            </div>

            {/* ---------------- PERFIL PROFESIONAL ---------------- */}
            <div className="pt-4 border-t border-slate-800">
              <h3 className="text-lg font-semibold text-white mb-4">Perfil Profesional</h3>

              <div className="mb-4">
                <Label htmlFor="oficio">Oficio Principal</Label>
                <Controller name="oficio" control={control} render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
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
                <Label htmlFor="bio">Biografía Profesional</Label>
                <Textarea id="bio" rows={4} placeholder="Describe tu experiencia y herramientas que manejas..." {...register("bio")} className="bg-slate-800 border-slate-700" />
                <InputError message={errors.bio?.message} />
              </div>
            </div>

            {/* ---------------- ARCHIVOS ---------------- */}
            <div className="pt-4 border-t border-slate-800 space-y-5">
              <h3 className="text-lg font-semibold text-white">Documentación</h3>

              {/* PORTAFOLIO */}
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <FaCloudUploadAlt className="text-cyan-400" /> Portafolio (Solo imágenes)
                </Label>

                <Controller
                  name="archivos_portafolio"
                  control={control}
                  render={({ field }) => (
                    <>
                      <label
                        htmlFor="archivos_portafolio"
                        onDragOver={(e) => { e.preventDefault(); setDraggingPortfolio(true); }}
                        onDragLeave={() => setDraggingPortfolio(false)}
                        onDrop={(e) => onPortfolioDrop(e, field.onChange)}
                        className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer
                          hover:bg-slate-800/50 transition-colors
                          ${errors.archivos_portafolio ? 'border-red-500 bg-red-900/10' : (draggingPortfolio ? 'border-cyan-400 bg-slate-800/50' : 'border-slate-700 bg-slate-800/30')}
                        `}
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <p className="text-sm text-slate-400 font-medium truncate max-w-xs">{getFileLabel(portfolioFiles, "Arrastra imágenes o haz clic para subir")}</p>
                        </div>

                        <Input
                          id="archivos_portafolio"
                          type="file"
                          {...register("archivos_portafolio")}
                          accept="image/*"
                          multiple
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const files = e.target.files;
                            field.onChange(files);
                            handlePortfolioFiles(files);
                          }}
                          className="hidden"
                        />
                      </label>

                      {/* previews */}
                      {portfolioPreviews.length > 0 && (
                        <div className="mt-3 grid grid-cols-3 gap-3">
                          {portfolioPreviews.map((src, i) => (
                            <div key={i} className="relative">
                              <img src={src} alt={`preview-${i}`} className="w-full h-24 object-cover rounded-lg border border-slate-700" />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* file list */}
                      {field.value && (Array.from(field.value).length > 0) && (
                        <ul className="mt-3 bg-slate-800 p-3 rounded-lg border border-slate-700 text-slate-300 text-sm">
                          {Array.from(field.value).map((file, idx) => (
                            <li key={idx} className="flex justify-between items-center py-1">
                              <span className="truncate max-w-xs">{file.name}</span>
                              <span className="text-slate-400 text-xs">{(file.size / 1024).toFixed(0)} KB</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                />

                <InputError message={errors.archivos_portafolio?.message} />
              </div>

              {/* CERTIFICADOS — PDF, WORD, IMÁGENES */}
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <FaFileAlt className="text-amber-400" /> Certificados (PDF, Word, Imágenes)
                </Label>

                <Controller
                  name="archivos_certificados"
                  control={control}
                  render={({ field }) => (
                    <>
                      <label
                        htmlFor="archivos_certificados"
                        onDragOver={(e) => { e.preventDefault(); setDraggingCertificates(true); }}
                        onDragLeave={() => setDraggingCertificates(false)}
                        onDrop={(e) => onCertificatesDrop(e, field.onChange)}
                        className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer
                          hover:bg-slate-800/50 transition-colors
                          ${errors.archivos_certificados ? 'border-red-500 bg-red-900/10' : (draggingCertificates ? 'border-cyan-400 bg-slate-800/50' : 'border-slate-700 bg-slate-800/30')}
                        `}
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <p className="text-sm text-slate-400 font-medium truncate max-w-xs">{getFileLabel(certificateFiles, "Arrastra o haz clic para subir PDFs, Word o imágenes")}</p>
                        </div>

                        <Input
                          id="archivos_certificados"
                          type="file"
                          {...register("archivos_certificados")}
                          multiple
                          accept="application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, image/*"
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const files = e.target.files;
                            field.onChange(files);
                            handleCertificateFiles(files);
                          }}
                          className="hidden"
                        />
                      </label>

                      {/* previews (only images) */}
                      {certificatePreviews.length > 0 && (
                        <div className="mt-3 grid grid-cols-3 gap-3">
                          {certificatePreviews.map((src, i) => (
                            <div key={i} className="relative">
                              <img src={src} alt={`cert-preview-${i}`} className="w-full h-24 object-cover rounded-lg border border-slate-700" />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* file list */}
                      {field.value && (Array.from(field.value).length > 0) && (
                        <ul className="mt-3 bg-slate-800 p-3 rounded-lg border border-slate-700 text-slate-300 text-sm">
                          {Array.from(field.value).map((file, idx) => (
                            <li key={idx} className="flex justify-between items-center py-1">
                              <span className="truncate max-w-xs">{file.name}</span>
                              <span className="text-slate-400 text-xs">{(file.size / 1024).toFixed(0)} KB</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                />

                <InputError message={errors.archivos_certificados?.message} />
              </div>
            </div>

            {/* ---------------- BOTÓN ENVIAR ---------------- */}
            <div className="pt-4">
              <Button type="submit" disabled={isSubmitting || mutation.isPending} className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-bold py-6 text-lg hover:from-amber-500 hover:to-orange-600 shadow-lg">
                {isSubmitting || mutation.isPending ? "Enviando..." : "Enviar Postulación"}
              </Button>
            </div>

          </form>
        </div>
      </div>
    </>
  );
}
