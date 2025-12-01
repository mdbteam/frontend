import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Menu, X, MessageSquare, User, LogOut, Search, LayoutGrid, Briefcase, CalendarCheck, ShieldAlert } from 'lucide-react';
import { Button } from '../ui/button';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    navigate('/login');
  };

  const getLinkClass = (path: string) => 
    `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
      location.pathname === path 
        ? 'text-cyan-400 bg-slate-800 shadow-[0_0_10px_rgba(34,211,238,0.1)]' 
        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
    }`;

  const getProviderLinkClass = (path: string) => 
    `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-bold transition-all duration-200 border border-transparent ${
      location.pathname === path 
        ? 'text-amber-400 bg-slate-800 border-amber-400/20 shadow-[0_0_10px_rgba(251,191,36,0.15)]' 
        : 'text-amber-500 hover:text-amber-300 hover:bg-amber-400/10'
    }`;

  // --- LÓGICA DE DERIVACIÓN SEGÚN ROL ---
  const getDashboardConfig = () => {
    const rol = user?.rol?.toLowerCase() || '';
    
    
    if (rol === 'admin' || rol === 'administrador') {
        return {
            path: '/administrador', 
            label: 'Panel Admin',
            icon: ShieldAlert,
            styleClass: getProviderLinkClass 
        };
    }

    // 2. Si es PRESTADOR/HIBRIDO -> Su Agenda (Calendario)
    if (rol === 'prestador' || rol === 'hibrido') {
        return {
            path: '/calendario',
            label: 'Mi Agenda',
            icon: Briefcase,
            styleClass: getProviderLinkClass
        };
    }

    // 3. Si es CLIENTE FINAL -> Sus Citas realizadas (En el perfil)
    return {
        path: '/perfil?tab=citas',
        label: 'Mis Citas',
        icon: CalendarCheck,
        styleClass: getLinkClass 
    };
  };

  const dashboardConfig = getDashboardConfig();
  const DashboardIcon = dashboardConfig.icon;

  return (
    <nav className="bg-slate-950/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* --- LOGO --- */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex-shrink-0 flex items-center gap-3 group"
              title="Ir a la página de inicio"
            >
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-amber-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
                <img 
                  src="/assets/logo.jpg" 
                  alt="Logotipo de Chambee" 
                  className="relative h-9 w-auto rounded-full" 
                />
              </div>
              <span className="text-white font-bold text-xl tracking-tight group-hover:text-cyan-400 transition-colors">Chambee</span>
            </Link>
          </div>

          {/* --- MENÚ DESKTOP (CENTRO) --- */}
          <div className="hidden md:flex items-center space-x-2">
            <Link to="/" className={getLinkClass('/')} title="Inicio">
              <LayoutGrid size={18} />
              <span className="hidden lg:inline">Inicio</span>
            </Link>
            <Link to="/prestadores" className={getLinkClass('/prestadores')} title="Buscar prestadores">
              <Search size={18} />
              <span>Buscar Expertos</span>
            </Link>
            
            {isAuthenticated && (
              <Link to="/mensajes" className={getLinkClass('/mensajes')} title="Mis mensajes">
                <MessageSquare size={18} />
                <span>Mensajes</span>
              </Link>
            )}
          </div>

          {/* --- MENÚ DERECHA --- */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                
                <div className="h-6 w-[1px] bg-slate-800 mx-1"></div> 
                
                {/*  BOTÓN DINÁMICO SEGÚN ROL */}
                <Link 
                    to={dashboardConfig.path} 
                    className={dashboardConfig.styleClass(dashboardConfig.path)} 
                    title={dashboardConfig.label}
                >
                  <DashboardIcon size={18} />
                  <span>{dashboardConfig.label}</span>
                </Link>

                {/* Perfil Miniatura */}
                <Link to="/perfil" className="group flex items-center gap-2 pl-2" title="Ir a mi perfil">
                  <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 group-hover:border-cyan-500 transition-colors overflow-hidden">
                    {user?.foto_url ? (
                      <img 
                        src={user.foto_url} 
                        alt={`Foto de perfil de ${user.nombres}`} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <span className="text-cyan-400 font-bold">{user?.nombres?.[0] || <User size={16} />}</span>
                    )}
                  </div>
                </Link>

                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleLogout}
                  className="text-slate-500 hover:text-red-400 hover:bg-red-900/10 rounded-full w-9 h-9"
                  title="Cerrar Sesión"
                  aria-label="Cerrar Sesión"
                >
                  <LogOut size={18} />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button 
                    variant="ghost" 
                    className="text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link to="/registro">
                  <Button 
                    className="bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white border-none font-semibold shadow-lg shadow-cyan-900/20 transition-all hover:scale-105"
                  >
                    Regístrate
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* --- BOTÓN MÓVIL --- */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-400 hover:text-white p-2"
              aria-label="Abrir menú de navegación"
              title="Menú"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* --- MENÚ MÓVIL --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 animate-in slide-in-from-top-5 duration-200">
          <div className="px-3 pt-3 pb-4 space-y-1">
            <Link 
              to="/" 
              className={getLinkClass('/') + " w-full justify-start text-base"} 
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <LayoutGrid size={20} /> Inicio
            </Link>
            <Link 
              to="/prestadores" 
              className={getLinkClass('/prestadores') + " w-full justify-start text-base"} 
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Search size={20} /> Buscar Expertos
            </Link>

            {isAuthenticated && (
              <>
                <Link 
                  to="/mensajes" 
                  className={getLinkClass('/mensajes') + " w-full justify-start text-base"} 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <MessageSquare size={20} /> Mensajes
                </Link>

                {/* BOTÓN MÓVIL DINÁMICO */}
                <div className="my-2 border-t border-slate-800/50 pt-2">
                    <Link 
                    to={dashboardConfig.path} 
                    className="flex items-center gap-3 px-3 py-3 rounded-lg bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20 active:bg-amber-500/20"
                    onClick={() => setIsMobileMenuOpen(false)}
                    >
                    <DashboardIcon size={20} />
                    {dashboardConfig.label}
                    </Link>
                </div>

                <div className="border-t border-slate-800 my-2 pt-2">
                  <Link 
                    to="/perfil" 
                    className="flex items-center gap-3 px-3 py-3 text-slate-300 hover:bg-slate-800 rounded-md"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs overflow-hidden">
                        {user?.foto_url ? (
                          <img 
                            src={user.foto_url} 
                            alt={`Foto de perfil de ${user.nombres}`} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User size={14}/>
                        )}
                    </div>
                    Mi Perfil
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-3 text-red-400 hover:bg-red-900/20 rounded-md mt-1"
                    title="Cerrar Sesión"
                  >
                    <LogOut size={20} /> Cerrar Sesión
                  </button>
                </div>
              </>
            )}

            {!isAuthenticated && (
              <div className="flex flex-col gap-3 px-1 pt-4 pb-2">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800">
                    Iniciar Sesión
                  </Button>s
                </Link>
                <Link to="/registro" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold">
                    Regístrate Gratis
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}