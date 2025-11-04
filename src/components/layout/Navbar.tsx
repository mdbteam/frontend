import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { FaBars, FaTimes } from 'react-icons/fa';
import { User, LogOut, Calendar, UserCheck, FileText } from 'lucide-react'; 
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

const MobileNavLink: React.FC<{ to: string, children: React.ReactNode, onClick: () => void }> = ({ to, children, onClick }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `block px-3 py-2 rounded-md text-base font-medium ${
        isActive ? 'bg-amber-500 text-slate-900' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
      }`
    }
    onClick={onClick}
  >
    {children}
  </NavLink>
);

const DesktopNavLink: React.FC<{ to: string, children: React.ReactNode }> = ({ to, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive ? 'text-amber-400' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
      }`
    }
  >
    {children}
  </NavLink>
);

const UserAvatar: React.FC<{ user: { foto_url?: string | null, nombres?: string | null } | null }> = ({ user }) => {
  const fallbackInitial = user?.nombres ? user.nombres.charAt(0).toUpperCase() : <User size={18} />;
  
  return (
    <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-medium overflow-hidden">
      {user?.foto_url ? (
        <img src={user.foto_url} alt="Perfil" className="h-full w-full object-cover" />
      ) : (
        <span>{fallbackInitial}</span>
      )}
    </div>
  );
};


export default function AppNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  console.log("ROL ACTUAL:", user?.rol);
  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const closeMenu = () => setIsOpen(false);

  const esAdmin = isAuthenticated && user && user.rol.toLowerCase().trim() === 'administrador';
  const esPrestador = isAuthenticated && user && user.rol.toLowerCase().trim() === 'prestador';
  const esCliente = isAuthenticated && user && user.rol.toLowerCase().trim() === 'cliente';


  return (
    <nav className="bg-slate-800/80 backdrop-blur-md shadow-md sticky top-0 z-40 border-b border-slate-700">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-amber-400 font-poppins">
              Cham<span className="text-white">Bee</span>
            </Link>
          </div>

          {/* Links de Escritorio */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <DesktopNavLink to="/">Inicio</DesktopNavLink>
              <DesktopNavLink to="/prestadores">Buscar Prestadores</DesktopNavLink>
              
              {esAdmin && (
                <DesktopNavLink to="/administrador">Admin</DesktopNavLink>
              )}
              
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button 
                      type="button" 
                      aria-label="Abrir menú de usuario"
                      className="rounded-full focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-800"
                    >
                      <UserAvatar user={user} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel>
                      <div className="font-medium text-white">{user?.nombres}</div>
                      <div className="text-xs text-slate-400 font-normal capitalize">{user?.rol}</div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={() => navigate('/perfil')}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Mi Perfil</span>
                      </DropdownMenuItem>
                      
                      {/* Links condicionales por Rol */}
                      {esPrestador && (
                        <DropdownMenuItem onClick={() => navigate('/calendario')}>
                          <Calendar className="mr-2 h-4 w-4" />
                          <span>Mi Agenda</span>
                        </DropdownMenuItem>
                      )}
                      
                      {esCliente && (
                        <>
                          <DropdownMenuItem onClick={() => navigate('/perfil')}>
                            <UserCheck className="mr-2 h-4 w-4" />
                            <span>Mis Citas</span>
                          </DropdownMenuItem>
                          
                          {/* --- 2. ¡AQUÍ ESTÁ EL ARREGLO! --- */}
                          <DropdownMenuItem onClick={() => navigate('/postular')}>
                            <FileText className="mr-2 h-4 w-4" />
                            <span>Postular como Prestador</span>
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-400 focus:bg-red-900/50 focus:text-red-300">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Cerrar Sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <DesktopNavLink to="/login">Iniciar Sesión</DesktopNavLink>
              )}
            </div>
          </div>

          {/* ... (El resto del código, Botón Móvil y Menú Móvil, no cambia) ... */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center rounded-md bg-slate-700 p-2 text-slate-300 hover:bg-slate-600 hover:text-white"
            >
              <span className="sr-only">Abrir menú</span>
              {isOpen ? <FaTimes className="block h-6 w-6" /> : <FaBars className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú Móvil (este ya estaba correcto) */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden border-t border-slate-700`} id="mobile-menu">
        {isAuthenticated && user && (
          <div className="px-5 pt-4 pb-3 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <UserAvatar user={user} />
              <div>
                <div className="text-base font-medium text-white">{user.nombres}</div>
                <div className="text-sm font-medium text-slate-400 capitalize">{user.rol}</div>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
          <MobileNavLink to="/" onClick={closeMenu}>Inicio</MobileNavLink>
          <MobileNavLink to="/prestadores" onClick={closeMenu}>Buscar Prestadores</MobileNavLink>
          
          {esAdmin && (
            <MobileNavLink to="/administrador" onClick={closeMenu}>Admin</MobileNavLink>
          )}

          {esPrestador && (
            <MobileNavLink to="/calendario" onClick={closeMenu}>Mi Agenda</MobileNavLink>
          )}
          {esCliente && (
            <MobileNavLink to="/postular" onClick={closeMenu}>Postular</MobileNavLink>
          )}

          {isAuthenticated ? (
            <>
              <MobileNavLink to="/perfil" onClick={closeMenu}>Mi Perfil</MobileNavLink>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                Cerrar Sesión
              </button>
            </>
          ) : (
            <MobileNavLink to="/login" onClick={closeMenu}>Iniciar Sesión</MobileNavLink>
          )}
        </div>
      </div>
    </nav>
  );
}