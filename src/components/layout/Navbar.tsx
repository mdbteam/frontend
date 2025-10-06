import  { useState } from 'react';
import { NavLink } from 'react-router-dom';

export function AppNavbar() {
  const [isOpen, setIsOpen] = useState(false);

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'text-cyan-500 font-semibold' : 'text-gray-700 hover:text-cyan-500';

  const getMobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-3 py-2 rounded-md text-base font-medium ${
      isActive ? 'bg-cyan-500 text-white' : 'text-gray-700 hover:bg-gray-50'
    }`;

  return (
    <header className="border-b border-slate-200 bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <NavLink to="/" className="text-2xl font-bold text-slate-800">
              ChamBee
            </NavLink>
          </div>

          {/* --- Menú de Escritorio --- */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <NavLink to="/" className={getNavLinkClass}>
                Inicio
              </NavLink>
              <NavLink to="/prestadores" className={getNavLinkClass}>
                Buscar Prestadores
              </NavLink>
              <NavLink to="/postular" className={getNavLinkClass}>
                Postular
              </NavLink>
              <NavLink to="/calendario" className={getNavLinkClass}>
                Calendario
              </NavLink>
              <NavLink to="/administrador" className={getNavLinkClass}>
                Admin
              </NavLink>
              {/* -------------------- */}
            </div>
          </div>

          <div className="hidden md:block">
            <button className="bg-cyan-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-cyan-700">
              Iniciar Sesión
            </button>
          </div>

          {/* --- Botón de Menú Hamburguesa --- */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Abrir menú principal</span>
              {!isOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
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
              Buscar Prestadores
            </NavLink>
            <NavLink to="/postular" className={getMobileNavLinkClass}>
              Postular
            </NavLink>
            <NavLink to="/calendario" className={getMobileNavLinkClass}>
              Calendario
            </NavLink>
            <NavLink to="/administrador" className={getMobileNavLinkClass}>
              Admin
            </NavLink>
            {/* -------------------- */}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="px-2">
              <button className="w-full bg-cyan-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-cyan-700">
                Iniciar Sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}