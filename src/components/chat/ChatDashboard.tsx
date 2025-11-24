import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../store/authStore';
import { ChatWindow } from './ChatWindow';
import axios from 'axios'; 
import { MessageSquareWarning } from 'lucide-react'; 

interface Contact {
  id_conversacion: number; 
  otro_usuario_id: number;
  otro_usuario_nombre: string;
  otro_usuario_foto_url: string;
  mensajes_no_leidos: number;
  ultimo_mensaje: {
    contenido: string;
    fecha_envio: string;
  } | null;
}

interface SelectedChat {
    id: string; 
    name: string;
    conversationId: number; 
}

export function ChatDashboard() {
  
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedChat, setSelectedChat] = useState<SelectedChat | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = useAuthStore((state) => state.token);

  // 1. Función de carga de contactos (usando useCallback)
  const fetchContacts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // ESTA RUTA GET FUNCIONA: /chat/conversaciones
      const response = await axios.get(`/chat/conversaciones`, {
        baseURL: '/api', 
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setContacts(response.data || []); 

    } catch (err: unknown) {
      console.error("Fallo en la llamada (axios):", err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || "No se pudo conectar al servicio de chat.");
      } else {
        setError("Ocurrió un error inesperado.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // 2. useEffect principal: se ejecuta con cambios de token o cuando forzamos la recarga.
  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      setError("No estás autenticado.");
      return;
    }
    fetchContacts();
  }, [token, fetchContacts]); 

  // --- RENDERIZADO ---

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
        </div>
    );
  }

  if (error) {
    return <div className="p-4 text-center text-red-400 bg-red-900/20 rounded-lg m-4">Error: {error}</div>;
  }

  // VISTA DE CHAT ACTIVO
if (selectedChat) {
    return (
      <div className="flex flex-col h-[600px] max-w-2xl mx-auto bg-slate-900 border border-slate-700 rounded-lg shadow-2xl overflow-hidden">
        <div className="bg-slate-800 p-2 border-b border-slate-700">
            <button 
            onClick={() => setSelectedChat(null)}
            className="px-3 py-1 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors flex items-center gap-1"
            >
            &larr; Volver a mis conversaciones
            </button>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <ChatWindow 
          recipientId={selectedChat.id} 
          recipientName={selectedChat.name}
          conversationId={selectedChat.conversationId} 
          onMarkAsRead={() => {}}
          />
        </div>
      </div>
    );
  }

  // VISTA DEL "LOBBY" (LISTA DE CONTACTOS)
  return (
    <div className="max-w-md mx-auto bg-slate-800 border border-slate-700 rounded-lg shadow-xl mt-8">
      <div className="p-4 border-b border-slate-700 bg-slate-800/50">
        <h3 className="text-xl font-bold text-white font-poppins flex items-center gap-2">
            Mis Mensajes <span className="text-xs bg-cyan-600 text-white px-2 py-0.5 rounded-full">{contacts.length}</span>
        </h3>
      </div>
      
      <div className="max-h-[500px] overflow-y-auto">
        {contacts.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center">
            <MessageSquareWarning className="w-12 h-12 text-slate-500 mb-3" />
            <p className="text-slate-300 font-medium text-lg">No tienes chats activos</p>
            <p className="text-slate-500 text-sm mt-2 max-w-xs">
                Los chats se habilitarán automáticamente cuando un Prestador acepte una solicitud de servicio (Match).
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-700">
            {contacts.map((contact) => (
              <li 
                key={contact.otro_usuario_id}
                className="p-4 flex items-center space-x-4 cursor-pointer hover:bg-slate-700/50 transition-colors group"
                onClick={() => setSelectedChat({ 
                    id: String(contact.otro_usuario_id), 
                    name: contact.otro_usuario_nombre,
                    conversationId: contact.id_conversacion 
                })}
              >
                {/* Avatar simple generado con iniciales */}
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-105 transition-transform">
                    {contact.otro_usuario_nombre.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-slate-100 truncate group-hover:text-cyan-400 transition-colors">
                    {contact.otro_usuario_nombre}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {contact.ultimo_mensaje?.contenido || "Sin mensajes"}
                  </p>
                  
                  {/* Indicador de mensajes no leídos */}
                  {contact.mensajes_no_leidos > 0 && (
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full ml-auto">
                          {contact.mensajes_no_leidos}
                      </span>
                  )}
                </div>
                
                <div className="text-slate-500 group-hover:text-cyan-400">
                    &rarr;
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}