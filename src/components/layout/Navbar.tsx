import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { FaUserCircle } from 'react-icons/fa';

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

  const isAdmin = user?.rol === 'administrador';
  const isPrestador = user?.rol === 'prestador';
  const isCliente = user?.rol === 'cliente';

  const getNavLinkClass = ({ isActive }: { isActive: boolean }): string =>
    `px-3 py-2 rounded-md text-sm font-medium ${
      isActive
        ? 'bg-slate-700 text-white'
        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`;

  const getMobileNavLinkClass = ({ isActive }: { isActive: boolean }): string =>
    `block px-3 py-2 rounded-md text-base font-medium ${
      isActive
        ? 'bg-slate-700 text-white'
        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`;

  const handleMobileLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <NavLink to="/" className="text-2xl font-bold text-white font-poppins">
              Chambee
            </NavLink>
          </div>

          {/* Menú Desktop */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <NavLink to="/" className={getNavLinkClass}>
                Inicio
              </NavLink>
              <NavLink to="/prestadores" className={getNavLinkClass}>
                Buscar Agentes
              </NavLink>

              {isCliente && (
                <NavLink to="/postular" className={getNavLinkClass}>
                  Postular
                </NavLink>
              )}
              {isPrestador && (
                <NavLink to="/calendario" className={getNavLinkClass}>
                  Mi Agenda
                </NavLink>
              )}
              {isAdmin && (
                <NavLink to="/administrador" className={getNavLinkClass}>
                  Admin
                </NavLink>
              )}
            </div>
          </div>

          {/* Botones de Autenticación (Desktop) */}
          <div className="hidden md:block">
            {isAuthenticated ? (
              <div className="ml-4 flex items-center md:ml-6 space-x-4">
                <NavLink to="/perfil" className="flex items-center text-sm font-medium text-slate-300 hover:text-white">
                  {user?.foto_url ? (
                    <img className="h-8 w-8 rounded-full object-cover" src={user.foto_url} alt="Mi Perfil" />
                  ) : (
                    <FaUserCircle className="h-8 w-8 text-slate-500" />
                  )}
                  <span className="ml-2">Hola, {user?.nombres.split(' ')[0]}</span>
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="bg-slate-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-600 transition-colors"
                >
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <NavLink
                  to="/registro"
                  className="text-cyan-400 border border-cyan-500 px-4 py-2 rounded-md text-sm font-medium hover:bg-cyan-500/10 transition-colors"
                >
                  Regístrate
                </NavLink>
                <NavLink
                  to="/login"
                  className="bg-cyan-500 text-slate-900 px-4 py-2 rounded-md text-sm font-medium hover:bg-cyan-400 transition-colors"
                >
                  Iniciar Sesión
                </NavLink>
              </div>
            )}
          </div>

          {/* Botón Menú Móvil */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="bg-slate-800 inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Abrir menú</span>
              {isOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Menú Móvil (Desplegable) */}
      {isOpen && (
        <div className="md:hidden border-b border-slate-700" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <NavLink to="/" className={getMobileNavLinkClass} onClick={handleMobileLinkClick}>Inicio</NavLink>
            <NavLink to="/prestadores" className={getMobileNavLinkClass} onClick={handleMobileLinkClick}>Buscar Agentes</NavLink>
            
            {isCliente && (
              <NavLink to="/postular" className={getMobileNavLinkClass} onClick={handleMobileLinkClick}>Postular</NavLink>
            )}
            {isPrestador && (
              <NavLink to="/calendario" className={getMobileNavLinkClass} onClick={handleMobileLinkClick}>Mi Agenda</NavLink>
            )}
            {isAdmin && (
              <NavLink to="/administrador" className={getMobileNavLinkClass} onClick={handleMobileLinkClick}>Admin</NavLink>
            )}
          </div>
          
          {/* Autenticación (Móvil) */}
          <div className="pt-4 pb-3 border-t border-slate-700">
            {isAuthenticated ? (
              <div className="px-2 space-y-2">
                <NavLink to="/perfil" className={getMobileNavLinkClass} onClick={handleMobileLinkClick}>
                  <div className="flex items-center">
                    {user?.foto_url ? (
                      <img className="h-10 w-10 rounded-full object-cover" src={user.foto_url} alt="Mi Perfil" />
                    ) : (
                      <FaUserCircle className="h-10 w-10 text-slate-500" />
                    )}
                    <div className="ml-3">
                      <div className="text-base font-medium text-white">{user?.nombres}</div>
                      {/* --- LÍNEA CORREGIDA --- */}
                      <div className="text-sm font-medium text-slate-400 capitalize">{user?.rol}</div>
                    </div>
                  </div>
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <div className="px-2 space-y-2">
                <NavLink to="/login" className="block w-full text-center bg-cyan-500 text-slate-900 px-3 py-2 rounded-md text-base font-medium hover:bg-cyan-400" onClick={handleMobileLinkClick}>
                  Iniciar Sesión
                </NavLink>
                <NavLink to="/registro" className="block w-full text-center text-cyan-400 border border-cyan-500 px-3 py-2 rounded-md text-base font-medium hover:bg-cyan-500/10" onClick={handleMobileLinkClick}>
                  Regístrate
                </NavLink>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}