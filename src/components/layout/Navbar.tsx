import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Menu, X, MessageSquare, User, LogOut, Search, LayoutGrid } from 'lucide-react';
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
    `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      location.pathname === path 
        ? 'text-cyan-400 bg-slate-800' 
        : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
    }`;

  return (
    <nav className="bg-slate-950 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* --- LOGO --- */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              {/* Ruta corregida del logo */}
              <img src="/assets/logo.jpg" alt="Chambee Logo" className="h-8 w-auto" />
              <span className="text-white font-bold text-xl tracking-tight">Chambee</span>
            </Link>
          </div>

          {/* --- MENÚ DESKTOP (CENTRO) --- */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className={getLinkClass('/')}>
              <LayoutGrid size={18} />
              Inicio
            </Link>
            <Link to="/prestadores" className={getLinkClass('/prestadores')}>
              <Search size={18} />
              Buscar Expertos
            </Link>
            
            {isAuthenticated && (
              <Link to="/mensajes" className={getLinkClass('/mensajes')}>
                <MessageSquare size={18} />
                Mensajes
              </Link>
            )}
          </div>

          {/* --- MENÚ DERECHA (AUTH) --- */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link to="/perfil" className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 text-cyan-400 font-bold overflow-hidden">
                    {user?.foto_url ? (
                      <img src={user.foto_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      user?.nombres?.[0] || <User size={16} />
                    )}
                  </div>
                  <span className="font-medium hidden lg:block">{user?.nombres}</span>
                </Link>

                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                >
                  <LogOut size={18} />
                </Button>
              </div>
            ) : (
              // 👇 AQUÍ ESTÁ LA CORRECCIÓN DE UX/COLORES
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button 
                    variant="ghost" 
                    // CORRECCIÓN: hover:bg-slate-800 asegura que el fondo sea oscuro al pasar el mouse
                    className="text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link to="/registro">
                  <Button 
                    // CTA (Call to Action) destacado
                    className="bg-cyan-600 hover:bg-cyan-500 text-white border-none font-semibold shadow-lg shadow-cyan-900/20 transition-all hover:scale-105"
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
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* --- MENÚ MÓVIL --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 animate-in slide-in-from-top-5 duration-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link 
              to="/" 
              className={getLinkClass('/') + " block"} 
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <LayoutGrid size={18} /> Inicio
            </Link>
            <Link 
              to="/prestadores" 
              className={getLinkClass('/prestadores') + " block"} 
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Search size={18} /> Buscar Expertos
            </Link>

            {isAuthenticated && (
              <Link 
                to="/mensajes" 
                className={getLinkClass('/mensajes') + " block"} 
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <MessageSquare size={18} /> Mensajes
              </Link>
            )}

            <div className="border-t border-slate-800 my-2 pt-2">
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/perfil" 
                    className="flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User size={18} /> Mi Perfil ({user?.nombres})
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-900/20 rounded-md mt-1"
                  >
                    <LogOut size={18} /> Cerrar Sesión
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-3 px-3 pt-2 pb-4">
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button 
                        variant="ghost" 
                        className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
                    >
                      Iniciar Sesión
                    </Button>
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
        </div>
      )}
    </nav>
  );
}