import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { FaArrowRight, FaArrowAltCircleUp } from 'react-icons/fa';
import { useAuthStore } from '../../store/authStore';

export function HeroSection() {
  const { user, isAuthenticated } = useAuthStore();
  const rol = user?.rol?.toLowerCase() || '';

  // Condición para OCULTAR el botón:
  // Si está logueado Y es (prestador O híbrido O admin)
  const shouldHideProviderButton = isAuthenticated && (
    rol === 'prestador' || 
    rol === 'híbrido' || 
    rol === 'hibrido' || 
    rol === 'admin' || 
    rol === 'administrador'
  );

  // Destino del enlace:
  // Si está logueado (y es cliente), va a /postular.
  // Si NO está logueado, va a /registro.
  const providerLinkDestination = isAuthenticated ? "/postular" : "/registro";

  return (
    <section className="text-center max-w-3xl mx-auto">
      <h1 className="text-4xl sm:text-6xl font-bold text-white font-poppins [text-shadow:0_0_20px_rgba(234,179,8,0.5)]">
        Conecta con los mejores <span className="text-amber-400">profesionales</span> a tu alrededor.
      </h1>
      <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto">
        Desde gasfitería hasta electricidad, encuentra el prestador de servicios verificado que necesitas para tu hogar o negocio.
      </p>
      
      <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
        {/* Botón principal (Siempre visible) */}
        <Button 
          asChild 
          size="lg" 
          className="bg-amber-400 text-slate-900 hover:bg-amber-400/90 text-base"
        >
          <Link to="/prestadores">
            Encontrar un Prestador <FaArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>

        {/* Botón secundario (Condicional) */}
        {!shouldHideProviderButton && (
          <Button 
            asChild 
            size="lg" 
            variant="secondary"
            className="text-base bg-amber-400 text-slate-900 hover:bg-amber-400/90 border border-amber-400"
          >
            <Link to={providerLinkDestination}>
              Quiero ser Prestador <FaArrowAltCircleUp className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
    </section>
  );
}