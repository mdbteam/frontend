import { useState, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import { useAuthStore } from '../../store/authStore';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import axios from 'axios'; 

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
  onMarkAsRead: () => void; // Recibe el callback para forzar la recarga
}

export function ChatWindow({ recipientId, recipientName, conversationId, onMarkAsRead }: ChatWindowProps) {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  
  // *** CORRECCIÓN DE ID ***
  const currentUserId = user && user.id ? String(user.id) : null; 
  
  const [socketUrl, setSocketUrl] = useState<string | null>(null);

  // 1. Configuración de URL WebSocket
  useEffect(() => {
    if (token) {
      setSocketUrl(`${PROD_WS_URL}/ws?token=${token}`);
    }
  }, [token]);

  // 2. Carga del Historial
  useEffect(() => {
    const fetchHistory = async () => {
      if (!recipientId || !token) return;
      setMessages([]); 
      
      try {
        const response = await axios.get<Message[]>(
          `/chat/history/${recipientId}`, 
          {
            baseURL: '/api', 
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        setMessages(response.data || []);
        
      } catch (error) {
        console.error("No se pudo cargar el historial:", error);
      }
    };

    fetchHistory();
  }, [recipientId, token]); 
  
  // 3. ** Marcar como Leído al Abrir (Limpieza Inicial) **
  useEffect(() => {
    const validConversationId = typeof conversationId === 'number' && conversationId > 0;
    
    if (validConversationId && token) { 
        // Llama al POST usando la ruta que funciona
        axios.post(`/chat/conversaciones/${conversationId}/leido`, null, { 
            baseURL: '/api',
            headers: {
                'Authorization': `Bearer ${token}` 
            }
        })
        .then(() => {
            console.log(`Conversación ${conversationId} marcada como leída.`);
            // Dispara la recarga para limpiar el contador inmediatamente
            onMarkAsRead(); 
        })
        .catch(err => {
            console.error("Error al marcar como leída:", err); 
        });
    }
  }, [conversationId, token, onMarkAsRead]);

  // 4. Conexión WebSocket
  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl || null, {
    onOpen: () => console.log('WebSocket conectado!'),
    onClose: () => console.log('WebSocket desconectado'),
    shouldReconnect: () => true,
    reconnectAttempts: 10,
    reconnectInterval: 3000,
  });

  // 5. ** Manejo de Mensajes Entrantes (Echo y Actualización en Vivo) **
  useEffect(() => {
    if (lastMessage !== null && currentUserId) {
        try {
            const incomingMessage: Message = JSON.parse(lastMessage.data);
            const incomingEmisorId = String(incomingMessage.id_emisor);

            if (incomingEmisorId === currentUserId || incomingEmisorId === recipientId) {
                setMessages((prevMessages) => [...prevMessages, incomingMessage]);
                
                // *** ACTUALIZACIÓN EN VIVO: Si hay actividad, recarga el Dashboard para actualizar el último mensaje/contador. ***
                onMarkAsRead(); 
            }
        } catch (e) {
            console.error("Error al parsear el mensaje WebSocket:", e);
        }
    }
  }, [lastMessage, recipientId, currentUserId, onMarkAsRead]); 

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]); 


  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === "" || readyState !== ReadyState.OPEN) return;

    const messagePayload = {
      id_destinatario: parseInt(recipientId), 
      contenido: newMessage.trim(),
    };
    
    sendMessage(JSON.stringify(messagePayload));
    setNewMessage("");
  };

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Conectando...',
    [ReadyState.OPEN]: 'Conectado',
    [ReadyState.CLOSING]: 'Cerrando...',
    [ReadyState.CLOSED]: 'Desconectado',
    [ReadyState.UNINSTANTIATED]: 'No iniciado',
  }[readyState];

  if (!socketUrl || !user) {
    return (
      <div className="flex items-center justify-center h-[500px] max-w-md mx-auto bg-slate-800 border border-slate-700 rounded-lg shadow-xl">
        <p className="text-cyan-400">Cargando sesión de chat...</p>
      </div>
    );
  }

  // --- RENDERIZADO: Diferenciación Visual Aplicada ---
  return (
    <div className="flex flex-col h-[500px] max-w-md mx-auto bg-slate-800 border border-slate-700 rounded-lg shadow-xl">
      <div className="flex items-center justify-between p-3 border-b border-slate-700">
        <h3 className="text-lg font-bold text-white font-poppins">{recipientName}</h3>
        <span className={`text-xs ${readyState === ReadyState.OPEN ? 'text-cyan-400' : 'text-yellow-400'}`}>
          {connectionStatus}
        </span>
      </div>
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {messages.map((msg) => {
          const isMyMessage = String(msg.id_emisor) === currentUserId;
          return (
            <div 
              key={msg.id_mensaje} 
              className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`px-3 py-2 rounded-lg max-w-[80%] ${
                  isMyMessage 
                  ? 'bg-cyan-700 text-white' 
                  : 'bg-slate-600 text-white'
                }`}
              >
                <p className="text-sm">{msg.contenido}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex p-3 border-t border-slate-700">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 px-3 py-2 text-white bg-slate-700 rounded-l-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
          disabled={readyState !== ReadyState.OPEN}
        />
        <button
          type="submit"
          className="px-4 py-2 font-semibold text-white bg-cyan-600 rounded-r-md hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={readyState !== ReadyState.OPEN || newMessage.trim() === ""}
        >
          Enviar
        </button>
      </form>
    </div>
  );
}