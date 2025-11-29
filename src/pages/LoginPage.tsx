import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios, { type AxiosError } from 'axios';
import { useAuthStore } from '../store/authStore';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface ErrorResponse {
  message?: string;
  detail?: string | { msg: string }[];
}

// --- (Tu función de error, traída de vuelta) ---
function getLoginErrorMessage(err: unknown): string {
  console.error('Error de login:', err); // <-- ¡AQUÍ SE USA 'err'!
  if (!axios.isAxiosError(err)) return 'Ocurrió un error inesperado.';
  const { response } = err as AxiosError<ErrorResponse>;
  if (!response) return 'Ocurrió un error de red o de respuesta.';
  const { status, data } = response;
  if (status === 422 && data.detail && Array.isArray(data.detail)) return data.detail[0].msg;
  if (data?.detail && typeof data.detail === 'string') return data.detail;
  if (status === 401) return 'Correo o contraseña incorrectos.';
  return 'Ocurrió un error. Intenta de nuevo.';
}

const loginSchema = z.object({
  correo: z.string()
    .min(1, "El correo es requerido")
    .email("El formato del correo no es válido"),
  password: z.string()
    .min(1, "La contraseña es requerida")
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    setServerError(null); 
    try {
      const formData = new FormData();
      formData.append('username', data.correo);
      formData.append('password', data.password);
      
      const response = await axios.post(`/api/auth/login`, formData);
      
      const { token, usuario } = response.data;
      login(token, usuario);
      navigate('/');
    } catch (err: unknown) { 
      // --- (CORRECCIÓN: Usamos la función de error) ---
      const errorMessage = getLoginErrorMessage(err);
      setServerError(errorMessage);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg bg-slate-800/50 p-8 border border-slate-700 backdrop-blur-sm">
        <h2 className="text-3xl font-bold text-center text-white font-poppins mb-6">
          Iniciar Sesión
        </h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300">
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              {...register("correo")}
              className={`mt-1 block w-full px-3 py-2 bg-slate-900 border ${errors.correo ? 'border-red-500' : 'border-slate-700'} rounded-md text-white shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500`}
            />
            {errors.correo && (
              <p className="mt-1 text-sm text-red-400">{errors.correo.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300">
              Contraseña
            </label>
            <div className="relative mt-1">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                {...register("password")}
                className={`block w-full px-3 py-2 bg-slate-900 border ${errors.password ? 'border-red-500' : 'border-slate-700'} rounded-md text-white shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
            )}
          </div>

          {serverError && (
            <div className="text-center text-red-400 text-sm">
              {serverError}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-slate-900 bg-yellow-400 hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Entrando..." : "Entrar"}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          ¿No tienes una cuenta?{' '}
          <Link to="/registro" className="font-medium text-cyan-400 hover:text-cyan-300">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
}