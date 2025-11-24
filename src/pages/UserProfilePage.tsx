import { useSearchParams } from 'react-router-dom';
import { FaUser, FaCalendarAlt, FaBriefcase, FaComments } from 'react-icons/fa';
import { useAuthStore } from '../store/authStore';
import { ProfileHeader } from '../components/profile/ProfileHeader';

import { MyCitasList } from '../components/profile/MyCitasList';
import { MyProfileForm } from '../components/profile/MyProfileForm';

// --- (Componentes Placeholder para las pestañas que faltan) ---
function MyExperienceTab() {
  return <div className="p-8 text-center text-slate-400 bg-slate-800/50 rounded-lg">Pestaña "Mi Experiencia" (Próximamente)</div>;
}
function MyReviewsTab() {
  return <div className="p-8 text-center text-slate-400 bg-slate-800/50 rounded-lg">Pestaña "Mis Reseñas" (Próximamente)</div>;
}
// ---

export default function UserProfilePage() {
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const tab = searchParams.get('tab') || 'citas';

  if (!user) {
    return <div>Cargando perfil...</div>;
  }
  
  const esPrestador = user.rol.toLowerCase() === 'prestador' || user.rol.toLowerCase() === 'hibrido';

  const tabs = [
    { id: 'citas', label: 'Mis Citas', icon: FaCalendarAlt, component: <MyCitasList />, show: true },
    { id: 'perfil', label: 'Mi Perfil', icon: FaUser, component: <MyProfileForm />, show: true },
    { id: 'experiencia', label: 'Mi Experiencia', icon: FaBriefcase, component: <MyExperienceTab />, show: esPrestador },
    { id: 'resenas', label: 'Mis Reseñas', icon: FaComments, component: <MyReviewsTab />, show: true },
  ];

  const activeTab = tabs.find(t => t.id === tab) || tabs[0];

  return (
    <div className="p-4 sm:p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        
        {/* --- ¡AQUÍ ESTÁN LAS CORRECCIONES! --- */}
        <ProfileHeader 
          nombres={user.nombres}
          primer_apellido={user.primer_apellido}
          fotoUrl={user.foto_url || null} 
          oficio={user.rol}
          resumen="Gestiona tu perfil, citas y experiencia."
          estaVerificado={true}
        />

        <div className="flex flex-col md:flex-row gap-8">
          <aside className="md:w-1/4">
            <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible">
              {tabs.filter(t => t.show).map(t => (
                <a
                  key={t.id}
                  href={`?tab=${t.id}`}
                  className={`
                    flex items-center gap-3 p-4 rounded-lg font-medium whitespace-nowrap
                    ${tab === t.id 
                      ? 'bg-slate-700 text-amber-400' 
                      : 'text-slate-300 hover:bg-slate-800/50 hover:text-slate-100'}
                  `}
                >
                  <t.icon className="h-5 w-5" />
                  <span>{t.label}</span>
                </a>
              ))}
            </nav>
          </aside>

          <main className="md:w-3/4">
            <div className="rounded-lg bg-slate-800/50 border border-slate-700 p-6 backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-yellow-400 font-poppins mb-6">{activeTab.label}</h2>
              {activeTab.component}
            </div>
          </main>
        </div>

      </div>
    </div>
  );
}