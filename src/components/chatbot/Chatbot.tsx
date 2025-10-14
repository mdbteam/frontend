// src/components/chatbot/Chatbot.tsx
// No es necesario importar React gracias al nuevo JSX Transform.
import { useState, useEffect } from 'react';
// Usamos un ícono de una biblioteca profesional para mayor claridad.
import { FaForumbee } from "react-icons/fa";

interface Message {
  id: number;
  text: string;
  sender: 'bot' | 'user';
}

const initialOptions = [
  'Gasfitería y Plomería',
  'Electricidad Certificada',
  'Carpintería y Mueblería',
  'Pintura y Decoración',
  'Jardinería y Paisajismo',
];

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false); 
  const [messages, setMessages] = useState<Message[]>([]);
  const [options, setOptions] = useState<string[]>(initialOptions);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        { 
          id: 1, 
          text: "¡Hola! Soy el asistente de la red Chambee. Mi misión es conectarte con el agente ideal. Para empezar, dime, ¿qué tipo de servicio necesitas?", 
          sender: 'bot' 
        }
      ]);
    }
  }, [isOpen, messages.length]);

  const handleOptionClick = (optionText: string) => {
    const userMessage: Message = { id: messages.length + 1, text: optionText, sender: 'user' };
    const botResponse: Message = { id: messages.length + 2, text: `¡Entendido! Buscando los mejores agentes en ${optionText}. Te mostraré la lista.`, sender: 'bot' };
    setMessages([...messages, userMessage, botResponse]);
    setOptions([]);
  };
  
  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-yellow-400 text-slate-900 rounded-full p-3 shadow-lg hover:bg-yellow-300 transition-transform hover:scale-110 animate-pulse"
        aria-label="Abrir chat"
      >
        <FaForumbee size={32} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96">
      <div className="bg-slate-800/80 backdrop-blur-md rounded-lg shadow-xl border border-slate-700 flex flex-col h-[500px]">
        <div className="p-3 border-b border-slate-700 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white font-poppins">Asistente Chambee</h3>
          <button onClick={handleClose} className="text-slate-400 hover:text-white text-2xl font-bold">&times;</button>
        </div>

        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {messages.map((message) => (
            // Usamos el 'id' del mensaje como 'key', que es la mejor práctica.
            <div key={message.id} className={`flex ${message.sender === 'bot' ? 'justify-start' : 'justify-end'}`}>
              <div className={`rounded-lg px-4 py-2 max-w-xs ${message.sender === 'bot' ? 'bg-slate-700 text-white' : 'bg-cyan-500 text-white'}`}>
                {message.text}
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-slate-700 flex flex-wrap gap-2 justify-center">
          {options.map((option) => (
            // Usamos el 'option' (un string único) como 'key' en lugar del índice.
            <button
              key={option}
              onClick={() => handleOptionClick(option)}
              className="bg-slate-700 text-cyan-300 border border-slate-600 rounded-full px-3 py-1 text-sm hover:bg-slate-600 hover:text-cyan-200 transition-colors"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}