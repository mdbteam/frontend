import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../store/authStore';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ACCEPTED_DOC_TYPES = ["application/pdf"];

const fileSchema = (types: string[]) =>
  z.instanceof(FileList)
    .refine(files => files.length === 1, "Este campo es requerido.")
    .refine(files => files.length > 0 && files[0].size <= MAX_FILE_SIZE, "El archivo no puede pesar más de 5MB.")
    .refine(files => files.length > 0 && types.includes(files[0].type), "Formato de archivo no soportado.");

const postulacionSchema = z.object({
  categoria: z.string().min(1, "Debes seleccionar una categoría"),
  anos_experiencia: z.coerce.number().min(0, "Debe ser un número positivo").max(50, "No puedes tener más de 50 años de experiencia"),
  comunas_cobertura: z.string().min(1, "Indica al menos una comuna"),
  resumen_profesional: z.string().min(50, "El resumen debe tener al menos 50 caracteres"),
  foto_carnet_frente: fileSchema(ACCEPTED_IMAGE_TYPES),
  foto_carnet_reverso: fileSchema(ACCEPTED_IMAGE_TYPES),
  certificado_antecedentes: fileSchema(ACCEPTED_DOC_TYPES),
});

type PostulacionFormInputs = z.infer<typeof postulacionSchema>;

export default function ProviderApplicationPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(postulacionSchema),
  });

  const onSubmit: SubmitHandler<PostulacionFormInputs> = async (data) => {
    setServerError(null);

    const formData = new FormData();
    formData.append('categoria', data.categoria);
    formData.append('anos_experiencia', String(data.anos_experiencia));
    formData.append('comunas_cobertura', data.comunas_cobertura);
    formData.append('resumen_profesional', data.resumen_profesional);
    formData.append('foto_carnet_frente', data.foto_carnet_frente[0]);
    formData.append('foto_carnet_reverso', data.foto_carnet_reverso[0]);
    formData.append('certificado_antecedentes', data.certificado_antecedentes[0]);

    try {
      await axios.post(`/api/postulaciones`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        }
      });

      navigate('/perfil?postulacion=exitosa');

    } catch (err: unknown) {
      let message = "Ocurrió un error al enviar tu postulación. Revisa los archivos e intenta de nuevo.";
      if (axios.isAxiosError(err) && err.response?.status === 422) {
        message = "Los archivos enviados no son válidos o están corruptos.";
      }
      setServerError(message);
    }
  };

  const InputError = ({ message }: { message?: string }) =>
    message ? <p className="mt-1 text-sm text-red-400">{message}</p> : null;

  const getBorderClass = (fieldName: keyof PostulacionFormInputs) =>
    errors[fieldName] ? 'border-red-500' : 'border-slate-700';

  return (
    <div className="flex justify-center items-start min-h-screen p-4 sm:p-8 bg-slate-900">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-bold text-white font-poppins mb-4 text-center [text-shadow:0_0_15px_rgba(34,211,238,0.4)]">
          Postular como Agente
        </h1>

        <p className="text-center text-sm text-slate-300 mb-6">
          Completa tu perfil profesional. <span className="text-cyan-400">*</span> Campos obligatorios
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 sm:p-8 space-y-6 backdrop-blur-sm shadow-lg">

          <fieldset className="space-y-4">
            <legend className="text-lg font-semibold text-white">Información Profesional</legend>

            <div>
              <label htmlFor="categoria" className="block text-sm font-medium text-slate-300">Categoría Principal *</label>
              <select id="categoria" {...register("categoria")}
                className={`mt-1 block w-full input-base rounded-md bg-slate-800 text-white p-3 border ${getBorderClass('categoria')} focus:border-cyan-400 focus:ring focus:ring-cyan-400/30`}>
                <option value="">Selecciona tu especialidad</option>
                <option value="plomeria">Plomería (Gasfitería)</option>
                <option value="electricidad">Electricidad</option>
                <option value="carpinteria">Carpintería</option>
                <option value="pintura">Pintura</option>
                <option value="albanileria">Albañilería</option>
              </select>
              <InputError message={errors.categoria?.message} />
            </div>

            <div>
              <label htmlFor="anos_experiencia" className="block text-sm font-medium text-slate-300">Años de Experiencia *</label>
              <input type="number" id="anos_experiencia" {...register("anos_experiencia")}
                className={`mt-1 block w-full input-base rounded-md bg-slate-800 text-white p-3 border ${getBorderClass('anos_experiencia')} focus:border-cyan-400 focus:ring focus:ring-cyan-400/30`} />
              <InputError message={errors.anos_experiencia?.message} />
            </div>

            <div>
              <label htmlFor="comunas_cobertura" className="block text-sm font-medium text-slate-300">Comunas de Cobertura *</label>
              <input type="text" id="comunas_cobertura" {...register("comunas_cobertura")}
                placeholder="Ej: Las Condes, Providencia, Santiago"
                className={`mt-1 block w-full input-base rounded-md bg-slate-800 text-white p-3 border ${getBorderClass('comunas_cobertura')} focus:border-cyan-400 focus:ring focus:ring-cyan-400/30`} />
              <InputError message={errors.comunas_cobertura?.message} />
            </div>

            <div>
              <label htmlFor="resumen_profesional" className="block text-sm font-medium text-slate-300">Resumen Profesional *</label>
              <textarea id="resumen_profesional" rows={4} {...register("resumen_profesional")}
                placeholder="Habla sobre ti, tu experiencia y lo que te destaca. (Mín. 50 caracteres)"
                className={`mt-1 block w-full input-base rounded-md bg-slate-800 text-white p-3 border ${getBorderClass('resumen_profesional')} focus:border-cyan-400 focus:ring focus:ring-cyan-400/30`} />
              <InputError message={errors.resumen_profesional?.message} />
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-lg font-semibold text-white">Documentación de Identidad</legend>

            <div>
              <label htmlFor="foto_carnet_frente" className="block text-sm font-medium text-slate-300">Cédula de Identidad (Frente) *</label>
              <input type="file" id="foto_carnet_frente" accept={ACCEPTED_IMAGE_TYPES.join(',')} {...register("foto_carnet_frente")}
                className={`mt-1 block w-full text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-cyan-500 file:text-white hover:file:bg-cyan-400 ${getBorderClass('foto_carnet_frente')}`} />
              <InputError message={errors.foto_carnet_frente?.message} />
            </div>

            <div>
              <label htmlFor="foto_carnet_reverso" className="block text-sm font-medium text-slate-300">Cédula de Identidad (Reverso) *</label>
              <input type="file" id="foto_carnet_reverso" accept={ACCEPTED_IMAGE_TYPES.join(',')} {...register("foto_carnet_reverso")}
                className={`mt-1 block w-full text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-cyan-500 file:text-white hover:file:bg-cyan-400 ${getBorderClass('foto_carnet_reverso')}`} />
              <InputError message={errors.foto_carnet_reverso?.message} />
            </div>

            <div>
              <label htmlFor="certificado_antecedentes" className="block text-sm font-medium text-slate-300">Certificado de Antecedentes (PDF) *</label>
              <input type="file" id="certificado_antecedentes" accept={ACCEPTED_DOC_TYPES.join(',')} {...register("certificado_antecedentes")}
                className={`mt-1 block w-full text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-cyan-500 file:text-white hover:file:bg-cyan-400 ${getBorderClass('certificado_antecedentes')}`} />
              <InputError message={errors.certificado_antecedentes?.message} />
            </div>
          </fieldset>

          {serverError && (
            <div className="text-center text-red-400 text-sm">{serverError}</div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-3 px-4 rounded-md text-base font-medium text-white bg-cyan-500 hover:bg-cyan-400 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Enviando Postulación..." : "Enviar Postulación"}
          </button>
        </form>
      </div>
    </div>
  );
}
