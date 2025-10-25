import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { FaUserCircle } from 'react-icons/fa';

export function AppNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
    navigate('/');
  };

  const isAdmin = user?.rol === 'administrador';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileMenuRef]);

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'text-cyan-400 font-semibold' : 'text-slate-300 hover:text-cyan-400';

  const getMobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-3 py-2 rounded-md text-base font-medium ${
      isActive ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
    }`;
  
  const handleMobileLinkClick = () => setIsMobileMenuOpen(false);

  return (
    <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <NavLink to="/" className="text-2xl font-bold text-white font-poppins">
              Chambee
            </NavLink>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-6">
              <NavLink to="/" className={getNavLinkClass}>Inicio</NavLink>
              <NavLink to="/prestadores" className={getNavLinkClass}>Buscar Agentes</NavLink>
              
              {isAuthenticated && user?.rol === 'cliente' && (
                <>
                  <NavLink to="/calendario" className={getNavLinkClass}>Agenda</NavLink>
                  <NavLink to="/postular" className={getNavLinkClass}>Postular</NavLink>
                </>
              )}
              {isAdmin && (
                <NavLink to="/administrador" className={getNavLinkClass}>Admin</NavLink>
              )}
            </div>
          </div>

          <div className="hidden md:block">
            {isAuthenticated ? (
              <div className="ml-4 relative" ref={profileMenuRef}>
                <div>
                  <button
                    type="button"
                    className="bg-slate-800 flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500"
                    id="user-menu-button"
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    aria-expanded={isProfileMenuOpen ? "true" : "false"}
                    aria-haspopup="true"
                  >
                    <span className="sr-only">Abrir menú de usuario</span>
                    {user?.foto_url ? (
                      <img
                        className="h-8 w-8 rounded-full object-cover"
                        src={user.foto_url}
                        alt="Foto de perfil"
                      />
                    ) : (
                      <FaUserCircle className="h-8 w-8 text-slate-500" />
                    )}
                  </button>
                </div>

                {isProfileMenuOpen && (
                  <div
                    className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg py-1 bg-slate-800 ring-1 ring-black ring-opacity-5 focus:outline-none border border-slate-700"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                  >
                    <div className="px-4 py-3 border-b border-slate-700">
                      <p className="text-sm font-medium text-white truncate">{user?.nombres}</p>
                      <p className="text-xs text-slate-400 truncate">{user?.rol}</p>
                    </div>
                    <Link
                      to="/perfil"
                      className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
                      role="menuitem"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      Mi Perfil
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left block px-4 py-2 text-sm text-red-400 hover:bg-slate-700 hover:text-red-300"
                      role="menuitem"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <NavLink to="/registro" className="text-cyan-400 border border-cyan-500 px-4 py-2 rounded-md text-sm font-medium hover:bg-cyan-500/10 transition-colors">
                  Regístrate
                </NavLink>
                <NavLink to="/login" className="bg-cyan-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-cyan-400 transition-colors">
                  Iniciar Sesión
                </NavLink>
              </div>
            )}
          </div>

          {/* --- Botón Hamburguesa --- */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              type="button"
              className="bg-slate-800 inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen ? "true" : "false"}
            >
              <span className="sr-only">Abrir menú principal</span>
              
              {/* --- LÓGICA INVERTIDA PARA SONARQUBE --- */}
              {isMobileMenuOpen ? (
                // Icono 'X' (Cerrar)
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                // Icono Hamburguesa (Abrir)
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* --- Menú Desplegable Móvil --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <NavLink to="/" className={getMobileNavLinkClass} onClick={handleMobileLinkClick}>Inicio</NavLink>
            <NavLink to="/prestadores" className={getMobileNavLinkClass} onClick={handleMobileLinkClick}>Buscar Agentes</NavLink>
            {isAuthenticated && user?.rol === 'cliente' && (
              <>
                <NavLink to="/calendario" className={getMobileNavLinkClass} onClick={handleMobileLinkClick}>Agenda</NavLink>
                <NavLink to="/postular" className={getMobileNavLinkClass} onClick={handleMobileLinkClick}>Postular</NavLink>
              </>
            )}
            {isAdmin && (
              <NavLink to="/administrador" className={getMobileNavLinkClass} onClick={handleMobileLinkClick}>Admin</NavLink>
            )}
          </div>
          <div className="pt-4 pb-3 border-t border-slate-700">
            {isAuthenticated ? (
              <div className="px-2 space-y-2">
                <div className="flex items-center px-3 mb-2">
                  {user?.foto_url ? (
                    <img className="h-10 w-10 rounded-full object-cover" src={user.foto_url} alt="Foto de perfil" />
                  ) : (
                    <FaUserCircle className="h-10 w-10 text-slate-500" />
                  )}
                  <div className="ml-3">
                    <div className="text-base font-medium text-white">{user?.nombres}</div>
                    <div className="text-sm font-medium text-slate-400">{user?.rol}</div>
                  </div>
                </div>
                
                <NavLink to="/perfil" className={getMobileNavLinkClass} onClick={handleMobileLinkClick}>
                  Mi Perfil
                </NavLink>

                <button
                  onClick={handleLogout}
                  className="w-full text-left bg-rose-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-rose-500 block"
                >
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <div className="px-2 space-y-2">
                <NavLink to="/login" className="w-full text-center bg-cyan-500 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-cyan-400 block" onClick={handleMobileLinkClick}>
                  Iniciar Sesión
                </NavLink>
                <NavLink to="/registro" className="w-full text-center text-cyan-400 border border-cyan-500 px-3 py-2 rounded-md text-sm font-medium hover:bg-cyan-500/10 block" onClick={handleMobileLinkClick}>
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