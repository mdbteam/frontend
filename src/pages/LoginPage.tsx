
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios, { AxiosError } from 'axios'; 
import { useAuthStore } from '../store/authStore';


export default function LoginPage() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); 

    try {
      const response = await axios.post(`/api/auth/login`, {
        correo: correo,
        password: password,
      });

      const { token, usuario } = response.data;
      login(token, usuario);
      navigate('/');

    } catch (err: unknown) { 
      console.error('Error de login:', err);
      let errorMessage = 'Ocurrió un error. Intenta de nuevo.';

      
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError; 
        if (axiosError.response && axiosError.response.status === 401) {
          errorMessage = 'Correo o contraseña incorrectos.';
        }
      }
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
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
            />
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