import { Link } from 'react-router-dom'; 

export function AppFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-200 shadow-sm">
      <div className="w-full max-w-7xl mx-auto p-4 md:py-6 md:flex md:items-center md:justify-between">

        <span className="text-sm text-gray-500 sm:text-center">
          © {currentYear} <Link to="/" className="hover:underline">MDB™ for ChamBee</Link>. Todos los derechos reservados.
        </span>

        <ul className="flex flex-wrap items-center mt-3 text-sm font-medium text-gray-500 sm:mt-0">
          <li>
            <Link to="/nosotros" className="hover:underline me-4 md:me-6">
              Nosotros
            </Link>
          </li>
          <li>
            <Link to="/privacidad" className="hover:underline me-4 md:me-6">
              Política de Privacidad
            </Link>
          </li>
          <li>
            <Link to="/contacto" className="hover:underline">
              Contacto
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}