import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../store/authStore';
import { ChatWindow } from './ChatWindow';
import axios from 'axios';
import { MessageSquare, Search, MessageSquareWarning} from 'lucide-react';

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
  photoUrl?: string; 
}

export function ChatDashboard() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedChat, setSelectedChat] = useState<SelectedChat | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  const token = useAuthStore((state) => state.token);

  const fetchContacts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/chat/conversaciones`, {
        baseURL: '/api',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setContacts(response.data || []);
    } catch (err: unknown) {
      console.error("Fallo al cargar contactos:", err);
      setError("No se pudo conectar al servicio de chat.");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetchContacts();
    const interval = setInterval(fetchContacts, 30000); 
    return () => clearInterval(interval);
  }, [token, fetchContacts]);

  const filteredContacts = contacts.filter(c => 
    c.otro_usuario_nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChatSelect = (contact: Contact) => {
    setSelectedChat({
      id: String(contact.otro_usuario_id),
      name: contact.otro_usuario_nombre,
      conversationId: contact.id_conversacion,
      photoUrl: contact.otro_usuario_foto_url
    });
  };

  const handleMarkAsRead = () => {
    fetchContacts();
  };

  return (
    <div className="flex h-[85vh] max-w-7xl mx-auto bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
      
      {/* === SIDEBAR (IZQUIERDA) === */}
      <aside className="w-full md:w-80 lg:w-96 bg-slate-900 border-r border-slate-800 flex flex-col">
        
        {/* Header del Sidebar */}
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white font-poppins flex items-center gap-2 mb-4">
            <MessageSquare className="text-cyan-400" size={24} />
            Mensajes
          </h2>
          
          {/* Buscador */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Buscar contacto..." 
              className="w-full bg-slate-800 text-slate-200 pl-10 pr-4 py-2 rounded-lg border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none text-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Lista de Contactos */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
            </div>
          ) : error ? (
            <div className="p-4 text-red-400 text-center text-sm">{error}</div>
          ) : filteredContacts.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <p>No se encontraron conversaciones.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-800/50">
              {filteredContacts.map((contact) => {
                const isActive = selectedChat?.conversationId === contact.id_conversacion;
                return (
                  <li 
                    key={contact.id_conversacion}
                    onClick={() => handleChatSelect(contact)}
                    className={`
                      p-4 cursor-pointer transition-all duration-200 hover:bg-slate-800
                      ${isActive ? 'bg-slate-800 border-l-4 border-cyan-500' : 'border-l-4 border-transparent'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="relative">
                        {contact.otro_usuario_foto_url ? (
                          <img src={contact.otro_usuario_foto_url} alt={contact.otro_usuario_nombre} className="w-12 h-12 rounded-full object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-white font-bold text-lg">
                            {contact.otro_usuario_nombre.charAt(0).toUpperCase()}
                          </div>
                        )}
                        {/* Indicador Online (Simulado) */}
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full"></span>
                      </div>

                      {/* Info Texto */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <h4 className={`font-semibold truncate ${isActive ? 'text-cyan-400' : 'text-slate-200'}`}>
                            {contact.otro_usuario_nombre}
                          </h4>
                          {contact.ultimo_mensaje && (
                            <span className="text-xs text-slate-500">
                              {new Date(contact.ultimo_mensaje.fecha_envio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between items-center">
                          <p className={`text-sm truncate max-w-[140px] ${contact.mensajes_no_leidos > 0 ? 'text-slate-100 font-medium' : 'text-slate-500'}`}>
                            {contact.ultimo_mensaje?.contenido || <span className="italic text-slate-600">Nueva conversación</span>}
                          </p>
                          {contact.mensajes_no_leidos > 0 && (
                            <span className="bg-cyan-500 text-slate-900 text-xs font-bold px-2 py-0.5 rounded-full shadow-lg shadow-cyan-500/20">
                              {contact.mensajes_no_leidos}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>

      {/* === MAIN AREA (DERECHA) === */}
      <main className="flex-1 bg-slate-950 relative flex flex-col">
        {selectedChat ? (
          // VISTA DE CHAT ACTIVO
          <ChatWindow 
            recipientId={selectedChat.id} 
            recipientName={selectedChat.name}
            conversationId={selectedChat.conversationId} 
            onMarkAsRead={handleMarkAsRead}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-950 bg-opacity-50" 
               style={{ backgroundImage: 'radial-gradient(circle at center, #1e293b 0%, #020617 100%)' }}>
            <div className="bg-slate-900 p-6 rounded-full mb-6 shadow-2xl border border-slate-800 animate-pulse-slow">
              <MessageSquareWarning className="w-16 h-16 text-cyan-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 font-poppins">
              Bienvenido a ChamBee Chat
            </h3>
            <p className="text-slate-400 max-w-md mb-8 leading-relaxed">
              Selecciona una conversación del panel izquierdo para coordinar detalles, enviar presupuestos o resolver dudas.
            </p>
            <div className="flex gap-2 text-sm text-slate-600">
              <span className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-full"></div> Conexión Segura</span>
              <span>•</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 bg-cyan-500 rounded-full"></div> Tiempo Real</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}