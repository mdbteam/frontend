import { useState, useEffect, useRef, FormEvent } from 'react';
import { useAuthStore } from '../../store/authStore';
import useWebSocket, { ReadyState } from 'react-use-websocket';

const PROD_WS_URL = 'wss://communication-service-akj6.onrender.com';

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
 
  const { user, token } = useAuthStore((state) => ({ 
    user: state.user, 
    token: state.token 
  }));

  const [socketUrl, setSocketUrl] = useState<string | null>(null);

  useEffect(() => {
   
    if (user && token) {
      setSocketUrl(`${PROD_WS_URL}/ws/${user.id}?token=${token}`);
    }
  }, [user, token]); 


  
  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl, {
    onOpen: () => {
      console.log('WebSocket conectado!');
    },
    onClose: () => console.log('WebSocket desconectado'),
    filter: () => false, 
    shouldReconnect: (closeEvent) => true,
  });

  useEffect(() => {
    if (lastMessage !== null) {
      const incomingMessage: Message = JSON.parse(lastMessage.data);
      
    }
  }, [lastMessage]);


  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;

    
    const messagePayload = {
      type: 'sendMessage', 
      recipient_id: recipientId,
      content: newMessage.trim(),
    };

    sendMessage(JSON.stringify(messagePayload));
    
    setNewMessage("");
  };

  const connectionStatus = {
    [ReadyState.Connecting]: 'Conectando...',
    [ReadyState.Open]: 'Conectado',
    
  }[readyState];

  if (!socketUrl) {
    return (
      <div className="flex items-center justify-center h-[500px] max-w-md mx-auto bg-slate-800 border border-slate-700 rounded-lg shadow-xl">
        <p className="text-cyan-400">Cargando sesión de chat...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[500px] max-w-md mx-auto bg-slate-800 border border-slate-700 rounded-lg shadow-xl">
     
      <div className="flex items-center justify-between p-3 border-b border-slate-700">
        <h3 className="text-lg font-bold text-white font-poppins">{recipientName}</h3>
        <span className="text-xs text-cyan-400">{connectionStatus}</span>
      </div>

    
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
       
      </div>

      <form onSubmit={handleSubmit} className="flex p-3 border-t border-slate-700">
        <input
          type="text"
          value={newMessage}
          
          disabled={readyState !== ReadyState.Open}
        />
        <button
          type="submit"
          
          disabled={readyState !== ReadyState.Open || newMessage.trim() === ""}
        >
          Enviar
        </button>
      </form>
    </div>
  );
}