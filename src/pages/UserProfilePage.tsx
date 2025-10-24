import { useState, useEffect, type ChangeEvent } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { FaEdit, FaSpinner, FaUserCircle } from 'react-icons/fa';

interface UserProfile {
  id: string;
  nombres: string;
  primer_apellido: string;
  segundo_apellido?: string | null;
  rut?: string | null;
  correo?: string | null;
  direccion?: string | null;
  rol: string;
  genero: string | null;
  fecha_nacimiento: string | null;
  foto_url: string | null;
  biografia: string | null;
  resumen_profesional: string | null;
  anos_experiencia: number | null;
}

function formatDate(dateString: string | null) {
  if (!dateString) return 'No especificado';
  try {
    const date = new Date(`${dateString}T00:00:00`);
    return date.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch (e) {
    console.error("Error al formatear la fecha:", e);
    return dateString;
  }
}

function InfoItem({ label, value }: { label: string; value: string | null | undefined | number }) {
  return (
    <div>
      <p className="text-sm font-semibold text-cyan-400">{label}</p>
      <p className="text-lg text-slate-200">{value || 'No especificado'}</p>
    </div>
  );
}

export default function UserProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const token = useAuthStore((state) => state.token);
  const login = useAuthStore((state) => state.login);
  const storeUser = useAuthStore((state) => state.user);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setError('No estás autenticado.');
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get('/api/users/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setProfile(response.data);
      } catch (err: unknown) {
        console.error('Error al cargar el perfil:', err);
        let msg = 'Error al cargar el perfil.';
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          msg = 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.';
        }
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const handlePictureUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('picture', file); 

    try {
      const response = await axios.put('/api/profile/me/picture', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const newProfileData: UserProfile = response.data;
      
      setProfile(newProfileData);

      if (token && newProfileData) {
        const updatedStoreUser = {
          ...storeUser, 
          id: String(newProfileData.id), 
          nombres: newProfileData.nombres,
          rol: newProfileData.rol,
          foto_url: newProfileData.foto_url || undefined,
        };
       
        login(token, updatedStoreUser);
      }

    } catch (err) {
      console.error("Error al subir imagen:", err);
      setUploadError("Error al subir la imagen. Intenta con un archivo más pequeño.");
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-white">Cargando perfil...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-400">{error}</div>;
  }

  if (!profile) {
    return <div className="p-8 text-center text-white">No se pudo cargar el perfil.</div>;
  }

  const isPrestador = profile.rol === 'prestador';

  return (
    <div className="flex justify-center items-start min-h-screen p-4 sm:p-8">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-bold text-white font-poppins mb-8 text-center [text-shadow:0_0_15px_rgba(34,211,238,0.4)]">
          Mi Perfil
        </h1>
        
        <div className="flex justify-center mb-6">
          <div className="relative">
            {profile.foto_url ? (
              <img 
                src={profile.foto_url} 
                alt="Foto de perfil" 
                className="h-32 w-32 rounded-full object-cover border-4 border-slate-700"
              />
            ) : (
              <FaUserCircle className="h-32 w-32 text-slate-600" />
            )}
            
            <label 
              htmlFor="profile-picture-upload"
              className="absolute -bottom-2 -right-2 bg-cyan-500 p-2 rounded-full text-white cursor-pointer hover:bg-cyan-400 transition-colors"
            >
              {isUploading ? <FaSpinner className="animate-spin" /> : <FaEdit />}
              <input 
                type="file" 
                id="profile-picture-upload"
                className="hidden"
                accept="image/png, image/jpeg"
                onChange={handlePictureUpload}
                disabled={isUploading}
              />
            </label>
          </div>
        </div>
        {uploadError && <p className="text-red-400 text-center mb-4">{uploadError}</p>}
        
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 sm:p-8 space-y-5 backdrop-blur-sm">
          <InfoItem label="Nombres" value={profile.nombres} />
          <InfoItem 
            label="Apellidos" 
            value={`${profile.primer_apellido} ${profile.segundo_apellido || ''}`} 
          />
          <InfoItem label="RUT" value={profile.rut} />
          <InfoItem label="Correo" value={profile.correo} />
          <InfoItem label="Dirección" value={profile.direccion} />
          <InfoItem label="Fecha de Nacimiento" value={formatDate(profile.fecha_nacimiento)} />
          <InfoItem label="Género" value={profile.genero} />
          <InfoItem label="Rol" value={profile.rol} />

          {isPrestador && (
            <>
              <hr className="border-slate-700" />
              <InfoItem label="Biografía" value={profile.biografia} />
              <InfoItem label="Resumen Profesional" value={profile.resumen_profesional} />
              <InfoItem label="Años de Experiencia" value={profile.anos_experiencia} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}