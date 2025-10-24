import { useState, useEffect, useRef, FormEvent } from 'react';
import { useAuthStore } from '../../store/authStore';
import useWebSocket, { ReadyState } from 'react-use-websocket';

// --- (1) Esta es tu URL de PRODUCCIÓN ---
const PROD_WS_URL = 'wss://communication-service-akj6.onrender.com';

// (La interfaz Message y ChatWindowProps sigue igual)
interface Message {
  id: string;
  sender_id: string;
  content: string;
  timestamp: string;
}

interface ChatWindowProps {
  recipientId: string;
  recipientName: string;
}

export function ChatWindow({ recipientId, recipientName }: ChatWindowProps) {
  const [messageHistory, setMessageHistory] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  
  // --- (2) Obtenemos el usuario y token del store ---
  const { user, token } = useAuthStore((state) => ({ 
    user: state.user, 
    token: state.token 
  }));

  // --- (3) Construimos la URL dinámicamente ---
  const [socketUrl, setSocketUrl] = useState<string | null>(null);

  useEffect(() => {
    // Solo intentamos conectar si tenemos el ID del usuario y el token
    if (user && token) {
      setSocketUrl(`${PROD_WS_URL}/ws/${user.id}?token=${token}`);
    }
  }, [user, token]); // Se ejecuta cuando el store se carga


  // --- (4) Conexión al WebSocket ---
  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl, {
    // El hook 'useWebSocket' esperará a que socketUrl tenga un valor para conectarse
    onOpen: () => {
      console.log('WebSocket conectado!');
      // ¡Ya no necesitamos el evento 'authenticate', el token va en la URL!
    },
    onClose: () => console.log('WebSocket desconectado'),
    filter: () => false, 
    shouldReconnect: (closeEvent) => true,
  });

  // (El resto del código 'useEffect' para cargar historial y recibir mensajes
  // sigue igual, con los // TODO: pendientes)

  // ... (useEffect para cargar historial simulado) ...

  // ... (useEffect para manejar lastMessage) ...
  useEffect(() => {
    if (lastMessage !== null) {
      // TODO: Adaptar al formato real del mensaje entrante
      const incomingMessage: Message = JSON.parse(lastMessage.data);
      // ...
    }
  }, [lastMessage]);


  // --- (5) Enviar un mensaje (AÚN PENDIENTE) ---
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;

    // TODO: AÚN NECESITAMOS SABER ESTO
    // ¿Cuál es el formato JSON para ENVIAR un mensaje?
    const messagePayload = {
      type: 'sendMessage', // <-- Esto es un ejemplo, probablemente sea diferente
      recipient_id: recipientId,
      content: newMessage.trim(),
    };

    sendMessage(JSON.stringify(messagePayload));
    
    // ... (UI Optimista) ...
    setNewMessage("");
  };

  // --- (6) Estado de Conexión ---
  const connectionStatus = {
    [ReadyState.Connecting]: 'Conectando...',
    [ReadyState.Open]: 'Conectado',
    // ... (otros estados)
  }[readyState];


  // --- (7) Renderizado ---
  // Si aún no tenemos la URL (porque el usuario no se ha cargado),
  // mostramos un 'cargando'.
  if (!socketUrl) {
    return (
      <div className="flex items-center justify-center h-[500px] max-w-md mx-auto bg-slate-800 border border-slate-700 rounded-lg shadow-xl">
        <p className="text-cyan-400">Cargando sesión de chat...</p>
      </div>
    );
  }

  // (Aquí va el JSX del chat: cabecera, cuerpo de mensajes, input)
  // (Este JSX no cambia respecto al código anterior)
  return (
    <div className="flex flex-col h-[500px] max-w-md mx-auto bg-slate-800 border border-slate-700 rounded-lg shadow-xl">
      {/* Cabecera del Chat */}
      <div className="flex items-center justify-between p-3 border-b border-slate-700">
        <h3 className="text-lg font-bold text-white font-poppins">{recipientName}</h3>
        <span className="text-xs text-cyan-400">{connectionStatus}</span>
      </div>

      {/* Cuerpo de Mensajes */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {/* ... (mapeo de messageHistory) ... */}
      </div>

      {/* Input de Mensaje */}
      <form onSubmit={handleSubmit} className="flex p-3 border-t border-slate-700">
        <input
          type="text"
          value={newMessage}
          // ... (otros props)
          disabled={readyState !== ReadyState.Open}
        />
        <button
          type="submit"
          // ... (otros props)
          disabled={readyState !== ReadyState.Open || newMessage.trim() === ""}
        >
          Enviar
        </button>
      </form>
    </div>
  );
}