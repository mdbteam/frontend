import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { useAuthStore } from '../../store/authStore';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import axios from 'axios'; 
import { Send, MoreVertical, Info } from 'lucide-react';

const PROD_WS_URL = 'wss://communication-service-akj6.onrender.com';

interface Message {
  id_mensaje: number;
  id_conversacion: number;
  id_emisor: number; 
  emisor: string; 
  contenido: string;
  fecha_envio: string; 
}

interface ChatWindowProps {
  recipientId: string; 
  recipientName: string;
  conversationId: number; 
  onMarkAsRead: () => void;
}

// Helper para formatear fechas de separadores
function getDateLabel(dateString: string) {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const dStr = date.toDateString();
  const tStr = today.toDateString();
  const yStr = yesterday.toDateString();

  if (dStr === tStr) return "Hoy";
  if (dStr === yStr) return "Ayer";
  return date.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function ChatWindow({ recipientId, recipientName, conversationId, onMarkAsRead }: ChatWindowProps) {
  const navigate = useNavigate();
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const { user, token } = useAuthStore();
  const currentUserId = user && user.id ? String(user.id) : null; 
  const [socketUrl, setSocketUrl] = useState<string | null>(null);

  // 1. Config WebSocket URL
  useEffect(() => {
    if (token) {
      setSocketUrl(`${PROD_WS_URL}/ws?token=${token}`);
    }
  }, [token]);

  // 2. Cargar Historial
  useEffect(() => {
    const fetchHistory = async () => {
      if (!recipientId || !token) return;
      setMessages([]); 
      try {
        const response = await axios.get(`/chat/history/${recipientId}`, {
          baseURL: '/api', 
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setMessages(response.data || []);
      } catch (error) {
        console.error("No se pudo cargar el historial:", error);
      }
    };
    fetchHistory();
  }, [recipientId, token]); 
  
  // 3. Marcar como Leído
  useEffect(() => {
    if (conversationId && token) { 
        axios.post(`/chat/conversaciones/${conversationId}/leido`, null, { 
            baseURL: '/api',
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(() => onMarkAsRead());
    }
  }, [conversationId, token, messages.length]);

  // 4. WebSocket Hook
  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl || null, {
    shouldReconnect: () => true,
    reconnectAttempts: 10,
    reconnectInterval: 3000,
  });

  // 5. Manejo de Mensajes Entrantes
  useEffect(() => {
    if (lastMessage !== null && currentUserId) {
        try {
            const incoming: Message = JSON.parse(lastMessage.data);
            const incomingEmisorId = String(incoming.id_emisor);
            if (incomingEmisorId === currentUserId || incomingEmisorId === recipientId) {
                setMessages((prev) => [...prev, incoming]);
            }
        } catch (e) { console.error("Error WS:", e); }
    }
  }, [lastMessage, recipientId, currentUserId]); 

  // Scroll al fondo
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]); 

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === "" || readyState !== ReadyState.OPEN) return;
    
    sendMessage(JSON.stringify({
      id_destinatario: parseInt(recipientId), 
      contenido: newMessage.trim(),
    }));
    setNewMessage("");
  };

  const handleViewProfile = () => {
    navigate(`/prestadores/${recipientId}`); 
  };

  return (
    <div className="flex flex-col h-full bg-slate-950">
      
      {/* === HEADER DEL CHAT === */}
      <div className="h-16 px-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between shadow-md z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg">
            {recipientName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-lg leading-tight">{recipientName}</h3>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-slate-400">
          <button 
            onClick={handleViewProfile}
            aria-label="Ver perfil del usuario" 
            title="Ver perfil"
            className="p-2 hover:bg-slate-800 rounded-full transition-colors text-cyan-400 hover:text-cyan-300"
          >
            <Info size={20} />
          </button>
          
          <button 
            aria-label="Más opciones" 
            className="p-2 hover:bg-slate-800 rounded-full transition-colors"
          >
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* === ÁREA DE MENSAJES === */}
      <div className="flex-1 overflow-y-auto p-6 space-y-1 bg-slate-950 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
        {messages.map((msg, idx) => {
          const isMe = String(msg.id_emisor) === currentUserId;
          
          // Lógica de Fechas
          const prevMsg = messages[idx - 1];
          const showDateSeparator = !prevMsg || new Date(msg.fecha_envio).toDateString() !== new Date(prevMsg.fecha_envio).toDateString();
          
          // Agrupar mensajes visualmente (Si hay separador de fecha, forzamos mostrar avatar)
          const showAvatar = !isMe && (idx === 0 || showDateSeparator || String(messages[idx - 1].id_emisor) === currentUserId);
          
          // Redondear esquinas si es el último del grupo
          const isLastInGroup = idx === messages.length - 1 || 
                                String(messages[idx + 1].id_emisor) !== String(msg.id_emisor) ||
                                new Date(msg.fecha_envio).toDateString() !== new Date(messages[idx + 1].fecha_envio).toDateString();

          return (
            <div key={msg.id_mensaje}>
              
              {/* SEPARADOR DE FECHA */}
              {showDateSeparator && (
                <div className="flex justify-center my-6">
                  <span className="text-[11px] font-medium text-slate-400 bg-slate-800/80 border border-slate-700 px-3 py-1 rounded-full shadow-sm">
                    {getDateLabel(msg.fecha_envio)}
                  </span>
                </div>
              )}

              {/* MENSAJE */}
              <div className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} ${showAvatar ? 'mt-4' : 'mt-1'}`}>
                
                <div className={`flex max-w-[75%] ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                  
                  {/* Avatar (Solo mensajes recibidos) */}
                  {!isMe && (
                    <div className="w-8 flex-shrink-0">
                      {showAvatar ? (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-700 to-slate-700 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                          {recipientName.charAt(0).toUpperCase()}
                        </div>
                      ) : <div className="w-8" />} 
                    </div>
                  )}

                  {/* Burbuja */}
                  <div className={`
                    relative px-4 py-2 shadow-md text-sm leading-relaxed
                    ${isMe 
                      ? 'bg-cyan-600 text-white rounded-l-xl rounded-tr-xl' 
                      : 'bg-slate-800 text-slate-200 rounded-r-xl rounded-tl-xl border border-slate-700'}
                    ${isLastInGroup && isMe ? 'rounded-br-none' : 'rounded-br-xl'}
                    ${isLastInGroup && !isMe ? 'rounded-bl-none' : 'rounded-bl-xl'}
                  `}>
                    <p className="whitespace-pre-wrap break-words">{msg.contenido}</p>
                    <span className={`text-[10px] block text-right mt-1 opacity-70 ${isMe ? 'text-cyan-100' : 'text-slate-400'}`}>
                      {new Date(msg.fecha_envio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* === INPUT AREA === */}
      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <form onSubmit={handleSubmit} className="flex items-center gap-4 max-w-4xl mx-auto">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            disabled={readyState !== ReadyState.OPEN}
            className="flex-1 bg-slate-800 text-slate-200 placeholder-slate-500 border border-slate-700 rounded-full px-6 py-3 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            aria-label="Enviar mensaje"
            disabled={readyState !== ReadyState.OPEN || !newMessage.trim()}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 p-3 rounded-full shadow-lg shadow-cyan-500/20 transition-all transform hover:scale-105 disabled:opacity-50 disabled:scale-100 disabled:shadow-none flex items-center justify-center"
          >
            <Send size={20} className="ml-0.5" />
          </button>
        </form>
      </div>

    </div>
  );
}