import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export function AppNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const isAdmin = user?.rol === 'admin'; 

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'text-cyan-400 font-semibold' : 'text-slate-300 hover:text-cyan-400';

  const getMobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-3 py-2 rounded-md text-base font-medium ${
      isActive ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
    }`;

  return (
    <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <NavLink to="/" className="text-2xl font-bold text-white font-poppins">
              Chambee
            </NavLink>
          </div>

          {/* --- Menú de Escritorio (Enlaces) --- */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-6">
              <NavLink to="/" className={getNavLinkClass}>
                Inicio
              </NavLink>
              <NavLink to="/prestadores" className={getNavLinkClass}>
                Buscar Agentes
              </NavLink>
              
              {isAuthenticated && (
                <>
                  <NavLink to="/calendario" className={getNavLinkClass}>
                    Agenda
                  </NavLink>
                  <NavLink to="/postular" className={getNavLinkClass}>
                    Postular
                  </NavLink>
                </>
              )}
              {isAdmin && (
                <NavLink to="/administrador" className={getNavLinkClass}>
                  Admin
                </NavLink>
              )}
            </div>
          </div>

          {/* --- Botones de Registro/Usuario (Escritorio) --- */}
          <div className="hidden md:block">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-slate-300">
                  Hola, {user?.nombres.split(' ')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-slate-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-600 transition-colors"
                >
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                {/* --- CAMBIO DE UX APLICADO AQUÍ --- */}
                <NavLink
                  to="/registro" 
                  className="text-cyan-400 border border-cyan-500 px-4 py-2 rounded-md text-sm font-medium hover:bg-cyan-500/10 transition-colors"
                >
                  Regístrate
                </NavLink>
                <NavLink 
                  to="/login"
                  className="bg-cyan-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-cyan-400 transition-colors"
                >
                  Iniciar Sesión
                </NavLink>
                {/* ---------------------------------- */}
              </div>
            )}
          </div>

          {/* --- Botón de Menú Hamburguesa --- */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="bg-slate-800 inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Abrir menú principal</span>
              {!isOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* --- Menú Desplegable Móvil --- */}
      {isOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <NavLink to="/" className={getMobileNavLinkClass}>
              Inicio
            </NavLink>
            <NavLink to="/prestadores" className={getMobileNavLinkClass}>
              Buscar Agentes
            </NavLink>
            {isAuthenticated && (
              <>
                <NavLink to="/calendario" className={getMobileNavLinkClass}>
                  Agenda
                </NavLink>
                <NavLink to="/postular" className={getMobileNavLinkClass}>
                  Postular
                </NavLink>
              </>
            )}
            {isAdmin && (
              <NavLink to="/administrador" className={getMobileNavLinkClass}>
                Admin
              </NavLink>
            )}
          </div>
          <div className="pt-4 pb-3 border-t border-slate-700">
            {isAuthenticated ? (
              <div className="px-2 space-y-2">
                <div className="px-3">
                  <div className="text-base font-medium text-white">{user?.nombres}</div>
                  <div className="text-sm font-medium text-slate-400">{user?.rol}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left bg-rose-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-rose-500 block"
                >
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              // --- CAMBIO DE UX APLICADO AQUÍ (MÓVIL) ---
              // Iniciar Sesión (primario) va primero
              <div className="px-2 space-y-2">
                <NavLink 
                  to="/login" 
                  className="w-full text-center bg-cyan-500 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-cyan-400 block"
                >
                  Iniciar Sesión
                </NavLink>
                <NavLink 
                  to="/registro" 
                  className="w-full text-center text-cyan-400 border border-cyan-500 px-3 py-2 rounded-md text-sm font-medium hover:bg-cyan-500/10 block"
                >
                  Regístrate
                </NavLink>
              </div>
              // ------------------------------------------
            )}
          </div>
        </div>
      )}
    </header>
  );
}