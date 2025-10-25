import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import { useAuthStore } from '../store/authStore';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; 

interface ErrorResponse {
  message?: string;
  detail?: string | { msg: string }[];
}

function getLoginErrorMessage(err: unknown): string {
  console.error('Error de login:', err);
  if (!axios.isAxiosError(err)) return 'Ocurrió un error inesperado.';
  const { response } = err as AxiosError<ErrorResponse>;
  if (!response) return 'Ocurrió un error de red o de respuesta.';
  const { status, data } = response;
  if (status === 422 && data.detail && Array.isArray(data.detail)) return data.detail[0].msg;
  if (data?.detail && typeof data.detail === 'string') return data.detail;
  if (status === 401) return 'Correo o contraseña incorrectos.';
  return 'Ocurrió un error. Intenta de nuevo.';
}

export default function LoginPage() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false); 
  
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); 
    try {
      const formData = new FormData();
      formData.append('username', correo);
      formData.append('password', password);
      const response = await axios.post(`/api/auth/login`, formData);
      const { token, usuario } = response.data;
      login(token, usuario);
      navigate('/');
    } catch (err: unknown) { 
      const errorMessage = getLoginErrorMessage(err);
      setError(errorMessage);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg bg-slate-800/50 p-8 border border-slate-700 backdrop-blur-sm">
        <h2 className="text-3xl font-bold text-center text-white font-poppins mb-6">
          Iniciar Sesión
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label 
              htmlFor="email"
              className="block text-sm font-medium text-slate-300"
            >
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>

          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-slate-300"
            >
              Contraseña
            </label>
            <div className="relative mt-1">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="block w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 pr-10"
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
          </div>

          {error && (
            <div className="text-center text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-slate-900 bg-yellow-400 hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
            >
              Entrar
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