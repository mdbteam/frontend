
import { Link } from 'react-router-dom';

// Componente de ícono para los campos del formulario
const InputIcon = ({ children }: { children: React.ReactNode }) => (
  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
    {children}
  </div>
);

function LoginPage() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Encabezado */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Iniciar Sesión
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Bienvenido de nuevo a la red Chambee.
          </p>
        </div>

        {/* Formulario */}
        <div className="rounded-lg bg-white p-8 shadow-lg border border-gray-200">
          <form className="space-y-6">
            {/* Campo de Correo Electrónico */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo Electrónico
              </label>
              <div className="relative mt-1">
                <InputIcon>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
                </InputIcon>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full rounded-md border-gray-300 pl-10 shadow-sm transition duration-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50"
                  placeholder="tu@correo.cl"
                />
              </div>
            </div>

            {/* Campo de Contraseña */}
            <div>
              <label htmlFor="password"className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="relative mt-1">
                <InputIcon>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </InputIcon>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="block w-full rounded-md border-gray-300 pl-10 shadow-sm transition duration-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Opciones Adicionales */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Recordarme
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-cyan-600 hover:text-cyan-500">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            </div>

            {/* Botón de Envío */}
            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md border border-transparent bg-cyan-600 py-3 px-4 text-sm font-medium text-white shadow-lg transition-all duration-300 hover:bg-cyan-700 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 transform hover:scale-105"
              >
                Ingresar
              </button>
            </div>
          </form>
        </div>

        {/* Enlace de Registro */}
        <p className="text-center text-sm text-gray-600">
          ¿No eres miembro?{' '}
          <Link to="/registro" className="font-medium text-cyan-600 hover:text-cyan-500">
            ¡Regístrate aquí!
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;