import { useState, useEffect } from 'react';
import type { FormEvent } from 'react'
import { useAuthStore } from '../../store/authStore';
import useWebSocket, { ReadyState } from 'react-use-websocket';

// --- (1) Esta es tu URL de PRODUCCIÓN ---
const PROD_WS_URL = 'wss://communication-service-akj6.onrender.com';

// (La interfaz Message y ChatWindowProps sigue igual)
interface Message {
  id_mensaje: number;
  id_conversacion: number;
  id_emisor: number;
  emisor: string; // "Pedro Paredes"
  contenido: string;
  fecha_envio: string; // '2025-10-21T03:30:19.903000'
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
    if (user && token) {
      // La URL correcta no incluye el user.id, solo el token
      setSocketUrl(`${PROD_WS_URL}/ws?token=${token}`);
    }
  }, [user, token]);


  // --- (4) Conexión al WebSocket ---
  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl, {
    onOpen: () => console.log('WebSocket conectado!'),
    onClose: () => console.log('WebSocket desconectado'),
    filter: () => false, 
    // Corregido: 'closeEvent' no se usaba
    shouldReconnect: () => true,
  });

  // (El resto del código 'useEffect' para cargar historial y recibir mensajes
  // sigue igual, con los // TODO: pendientes)

  // ... (useEffect para cargar historial simulado) ...

  // ... (useEffect para manejar lastMessage) ...
useEffect(() => {
  if (lastMessage !== null) {
    const incomingMessage: Message = JSON.parse(lastMessage.data);

    // Añadimos el nuevo mensaje al historial
    setMessageHistory((prevHistory) => {
      // Evitar duplicados
      if (prevHistory.find(msg => msg.id_mensaje === incomingMessage.id_mensaje)) {
        return prevHistory;
      }
      return [...prevHistory, incomingMessage];
    });
  }
}, [lastMessage, setMessageHistory]);

// --- (5) Enviar un mensaje (CORREGIDO) ---
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === "" || readyState !== ReadyState.OPEN) return;

    // ¡Este es el formato JSON que definimos en el backend! (Req 3.3)
    const messagePayload = {
      id_destinatario: parseInt(recipientId, 10), // Convertir el ID a número
      contenido: newMessage.trim(),
    };

    sendMessage(JSON.stringify(messagePayload));
    setNewMessage(""); // Limpiar el input
  };
    

  // --- (6) Estado de Conexión ---
const connectionStatus = {
    [ReadyState.CONNECTING]: 'Conectando...', // Corregido: Mayúsculas
    [ReadyState.OPEN]: 'Conectado',       // Corregido: Mayúsculas
    [ReadyState.CLOSING]: 'Cerrando...',
    [ReadyState.CLOSED]: 'Desconectado',
    [ReadyState.UNINSTANTIATED]: 'No iniciado',
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

      {/* Cuerpo de Mensajes (IMPLEMENTADO) */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {/* Ahora sí mapeamos el messageHistory */}
        {messageHistory.map((msg) => (
          <div 
            key={msg.id_mensaje} 
            // Comparamos el ID del emisor con el ID de nuestro usuario logueado
            className={`flex ${msg.id_emisor === Number(user?.id) ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`px-3 py-2 rounded-lg max-w-[80%] ${
                msg.id_emisor === Number(user?.id)
                ? 'bg-cyan-600 text-white' 
                : 'bg-slate-700 text-slate-300'
              }`}
            >
              {/* Mostramos el nombre del emisor si NO somos nosotros */}
              {msg.id_emisor !== Number(user?.id) && (
                <p className="text-xs font-bold text-cyan-300">{msg.emisor}</p>
              )}
              <p className="text-sm">{msg.contenido}</p>
              <p className="text-xs text-right opacity-70 mt-1">
                {new Date(msg.fecha_envio).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input de Mensaje (CORREGIDO) */}
      <form onSubmit={handleSubmit} className="flex p-3 border-t border-slate-700">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 px-3 py-2 text-sm text-white bg-slate-900 border border-slate-700 rounded-l-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
          // Corregido: Mayúsculas
          disabled={readyState !== ReadyState.OPEN}
        />
        <button
          type="submit"
          className="px-4 py-2 font-semibold text-white bg-cyan-600 rounded-r-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
          // Corregido: Mayúsculas
          disabled={readyState !== ReadyState.OPEN || newMessage.trim() === ""}
        >
          Enviar
        </button>
      </form>
    </div>
  );
}