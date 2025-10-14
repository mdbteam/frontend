import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import { useAuthStore } from '../store/authStore';
import { FileUpload } from '../components/form/FileUpload';

// --- MANEJO DE ERRORES ---
// (Similar al de RegisterPage, pero para la postulación)
interface ErrorResponse {
  message?: string;
  errors?: {
    field: string;
    message: string;
  }[];
}

function parsePostulacionError(data: ErrorResponse | undefined): string {
  if (data?.message) {
    return data.message;
  }
  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    return data.errors[0].message;
  }
  return 'Datos inválidos. Revisa el formato de los campos o archivos.';
}

function getPostulacionErrorMessage(err: unknown): string {
  console.error('Error de postulación:', err);

  if (!axios.isAxiosError(err)) {
    return 'Ocurrió un error inesperado.';
  }

  const { response } = err as AxiosError<ErrorResponse>;
  if (!response) {
    return 'Ocurrió un error de red o de respuesta.';
  }

  const { status, data } = response;
  switch (status) {
    case 401:
      return 'No autorizado. Debes iniciar sesión.';
    case 400:
    case 422:
      return parsePostulacionError(data);
    default:
      return 'Ocurrió un error inesperado en el servidor.';
  }
}

// --- COMPONENTE DE PÁGINA ---
function ProviderApplicationPage() {
  // 1. Estados para controlar el formulario
  const [oficio, setOficio] = useState('');
  const [bio, setBio] = useState('');
  const [portafolioFiles, setPortafolioFiles] = useState<File[]>([]);
  const [certificadoFiles, setCertificadoFiles] = useState<File[]>([]);
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 2. Obtenemos el token de autenticación del store
  const token = useAuthStore((state) => state.token);
  const navigate = useNavigate();

  // 3. Lógica de envío
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Verificación de autenticación
    if (!token) {
      setError('Debes iniciar sesión para poder postular.');
      return;
    }

    // 4. Creamos el FormData para enviar archivos
    const formData = new FormData();
    formData.append('oficio', oficio);
    formData.append('bio', bio);
    
    // Adjuntamos los archivos
    portafolioFiles.forEach(file => {
      formData.append('archivos_portafolio', file);
    });
    certificadoFiles.forEach(file => {
      formData.append('archivos_certificados', file);
    });

    try {
      // 5. Enviamos la solicitud (con el token y tipo de contenido)
      const response = await axios.post('/api/postulaciones', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess(response.data.mensaje || '¡Postulación enviada con éxito!');
      // Limpiamos el formulario
      setOficio('');
      setBio('');
      setPortafolioFiles([]);
      setCertificadoFiles([]);
      // (Idealmente, tu componente FileUpload debería tener un prop para resetearse)

      setTimeout(() => {
        // Redirigimos al perfil del usuario o al home
        navigate('/'); 
      }, 3000);

    } catch (err: unknown) {
      // 6. Manejo de errores
      const errorMessage = getPostulacionErrorMessage(err);
      setError(errorMessage);
    }
  };


  return (
    // 7. DISEÑO: Tema oscuro aplicado
    <div className="bg-slate-900 flex items-center justify-center min-h-screen p-4 sm:p-8">
      <div className="mx-auto w-full max-w-3xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white font-poppins [text-shadow:0_0_15px_rgba(34,211,238,0.4)]">
            Postula para ser Agente
          </h1>
          <p className="mt-3 text-lg text-slate-400">Únete a la red de profesionales de Chambee.</p>
        </div>

        {/* 8. Conectamos el formulario al handleSubmit */}
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* 9. LÓGICA: Sección de Identificación ELIMINADA */}

          <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-lg shadow-sm backdrop-blur-sm">
            <h2 className="text-xl font-semibold text-yellow-400 mb-6 font-poppins border-b border-slate-700 pb-3">Perfil Profesional</h2>
            <div>
              <label htmlFor="oficio" className="block mb-2 text-sm font-medium text-slate-300">Oficio o Profesión Principal</label>
              {/* 10. Conectamos los campos al estado */}
              <input 
                type="text" 
                id="oficio" 
                placeholder="Ej: Gasfitería, Electricidad Certificada" 
                className="w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-base text-white focus:border-cyan-400 focus:ring-cyan-400"
                value={oficio}
                onChange={(e) => setOficio(e.target.value)}
                required
              />
            </div>
            <div className="mt-6">
              <label htmlFor="bio" className="block mb-2 text-sm font-medium text-slate-300">Cuéntanos sobre ti y tu experiencia (Bio)</label>
              <textarea 
                id="bio" 
                rows={4} 
                className="w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-base text-white focus:border-cyan-400 focus:ring-cyan-400" 
                placeholder="Describe brevemente tus servicios, años de experiencia, etc."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                required
              ></textarea>
            </div>
          </div>

          <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-lg shadow-sm backdrop-blur-sm">
            <h2 className="text-xl font-semibold text-yellow-400 mb-6 font-poppins border-b border-slate-700 pb-3">Documentación</h2>
            <div className="space-y-6">
                <FileUpload
                    label="Portafolio de Trabajos"
                    helpText="Sube imágenes de tus mejores trabajos (JPG, PNG, GIF)"
                    acceptedFileTypes="image/*"
                    onFilesChange={(files) => setPortafolioFiles(files)}
                    files={portafolioFiles} // <-- AÑADE ESTA LÍNEA
                />
                <FileUpload
                    label="Certificados y Documentos"
                    helpText="Cédula de identidad, certificados de estudios, etc. (PDF, JPG, PNG)"
                    acceptedFileTypes=".pdf,image/jpeg,image.png"
                    onFilesChange={(files) => setCertificadoFiles(files)}
                    files={certificadoFiles} // <-- AÑADE ESTA LÍNEA
                />
            </div>
          </div>

          {/* 12. Mensajes de éxito y error */}
          {error && (
            <div className="text-center text-red-400 text-sm p-4 bg-red-900/20 border border-red-500 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="text-center text-green-400 text-sm p-4 bg-green-900/20 border border-green-500 rounded-lg">
              {success}
            </div>
          )}
          
          <div className="text-center pt-4">
            <button
              type="submit"
              disabled={!!success}
              className="w-full md:w-auto rounded-lg bg-cyan-500 px-10 py-4 text-lg font-bold text-white shadow-lg hover:bg-cyan-400 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              Enviar Postulación
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProviderApplicationPage;