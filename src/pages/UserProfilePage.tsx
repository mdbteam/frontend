import { useSearchParams } from 'react-router-dom';
import { FaUser, FaCalendarAlt, FaBriefcase, FaComments } from 'react-icons/fa';
import { useAuthStore } from '../store/authStore';
import { ProfileHeader } from '../components/profile/ProfileHeader';

import { MyCitasList } from '../components/profile/MyCitasList';
import { MyProfileForm } from '../components/profile/MyProfileForm';

// --- (Componentes Placeholder) ---
function MyExperienceTab() {
  return (
    <div className="p-8 text-center text-slate-400 bg-slate-800/50 rounded-lg border border-slate-700">
      <h3 className="text-xl text-white font-bold mb-2">Mi Experiencia y Portafolio</h3>
      <p>Aquí podrás gestionar tus trabajos previos y certificados. (Próximamente)</p>
    </div>
  );
}

function MyReviewsTab() {
  return (
    <div className="p-8 text-center text-slate-400 bg-slate-800/50 rounded-lg border border-slate-700">
      <h3 className="text-xl text-white font-bold mb-2">Reseñas y Calificaciones</h3>
      <p>Aquí verás lo que dicen los usuarios sobre tus servicios o tus opiniones dadas. (Próximamente)</p>
    </div>
  );
}
// ---

export default function UserProfilePage() {
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  
  // Obtenemos el tab de la URL, por defecto intentamos que sea 'citas'
  const tabParam = searchParams.get('tab');

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-950 text-cyan-400">
        Cargando perfil...
      </div>
    );
  }
  
  // 1. Lógica de Roles
  const rol = user.rol?.toLowerCase() || '';
  const isAdmin = rol === 'admin' || rol === 'administrador';
  const esPrestador = rol === 'prestador' || rol === 'hibrido';
  // El cliente es cualquiera que no sea admin ni prestador (o explícitamente cliente)
  
  // 2. Configuración de Pestañas
  const tabs = [
    { 
      id: 'citas', 
      label: 'Mis Citas', 
      icon: FaCalendarAlt, 
      component: <MyCitasList />, 
      show: !isAdmin // Admin no tiene citas propias en esta vista
    },
    { 
      id: 'perfil', 
      label: 'Mi Perfil', 
      icon: FaUser, 
      component: <MyProfileForm />, 
      show: true // Todos pueden editar su perfil
    },
    { 
      id: 'experiencia', 
      label: 'Mi Experiencia', 
      icon: FaBriefcase, 
      component: <MyExperienceTab />, 
      show: esPrestador // Solo prestadores tienen portafolio
    },
    { 
      id: 'resenas', 
      label: 'Mis Reseñas', 
      icon: FaComments, 
      component: <MyReviewsTab />, 
      show: !isAdmin // Admin no recibe/da reseñas en esta vista
    },
  ];

  // 3. Filtrar pestañas visibles y determinar la activa
  const visibleTabs = tabs.filter(t => t.show);
  
  // Si no hay tab en URL o el tab solicitado no es visible para este rol, usar el primero visible
  const activeTab = visibleTabs.find(t => t.id === tabParam) || visibleTabs[0];

  return (
    <div className="p-4 sm:p-8 bg-slate-950 min-h-screen">
      <div className="mx-auto max-w-5xl space-y-8">
        
        {/* Header del Perfil */}
        <ProfileHeader 
          nombres={user.nombres}
          primer_apellido={user.primer_apellido}
          fotoUrl={user.foto_url || null} 
          oficio={user.rol} // Mostramos el rol real
          resumen={isAdmin ? "Administrador del Sistema" : "Gestiona tu actividad y reputación en Chambee."}
          estaVerificado={esPrestador} // Asumimos verificado si es prestador por ahora
        />

        <div className="flex flex-col md:flex-row gap-8">
          {/* BARRA LATERAL DE NAVEGACIÓN */}
          <aside className="md:w-1/4">
            <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible gap-2 pb-2 md:pb-0">
              {visibleTabs.map(t => (
                <a
                  key={t.id}
                  href={`?tab=${t.id}`}
                  className={`
                    flex items-center gap-3 p-4 rounded-xl font-medium whitespace-nowrap transition-all duration-200
                    ${activeTab.id === t.id 
                      ? 'bg-slate-800 text-amber-400 shadow-lg border border-slate-700' 
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 hover:pl-5'}
                  `}
                >
                  <t.icon className={activeTab.id === t.id ? "text-amber-400" : "text-slate-500"} />
                  <span>{t.label}</span>
                </a>
              ))}
            </nav>
          </aside>

          {/* CONTENIDO PRINCIPAL */}
          <main className="md:w-3/4">
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl min-h-[400px]">
              <h2 className="text-2xl font-bold text-white font-poppins mb-6 flex items-center gap-2">
                <span className="w-2 h-8 bg-cyan-500 rounded-full mr-2"></span>
                {activeTab.label}
              </h2>
              
              {/* Renderizado del componente activo */}
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {activeTab.component}
              </div>
            </div>
          </main>
        </div>

      </div>
    </div>
  );
}