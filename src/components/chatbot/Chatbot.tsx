import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaForumbee, FaPaperPlane } from "react-icons/fa";

interface Message {
  id: number;
  text: string;
  sender: 'bot' | 'user';
}

// Lista de botones
const initialOptions = [
  'Gasfitería',
  'Electricidad',
  'Carpintería',
  'Pintura',
  'Jardinería',
];

// --- ¡LÓGICA MEJORADA! ---
// Palabras clave para "engañar"
const greetings = ['hola', 'buenos dias', 'buenas tardes', 'buenas noches', 'que tal'];
const farewells = ['gracias', 'adios', 'chao', 'nos vemos', 'hasta luego'];
const smallTalk = ['como estas', 'que haces', 'quien eres', 'ayuda'];

// Lista de CATEGORÍAS (para filtro ?categoria=)
const categoryKeywords = initialOptions.map(option => normalizeString(option));

// Lista de PALABRAS CLAVE GENERALES (para filtro ?q=)
const generalKeywords = [
  'reparar', 'instalar', 'maestro', 'arreglar', 'fuga', 'corte', 'filtracion',
  'luz', 'agua', 'gas', 'pintor', 'jardin', 'mueble', 'plomero', 'techo',
  'piso', 'ceramica', 'electricista', 'gasfiter'
];

function normalizeString(str: string | null): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false); 
  const [messages, setMessages] = useState<Message[]>([]);
  const [options, setOptions] = useState<string[]>(initialOptions);
  const [inputValue, setInputValue] = useState('');
  
  const navigate = useNavigate();
  const timerRef = useRef<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getInitialMessage = (): Message => ({ 
    id: 1, 
    text: "¡Hola! Soy el asistente de la red Chambee. Puedes presionar una categoría o escribir lo que buscas.", 
    sender: 'bot' 
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([getInitialMessage()]);
      setOptions(initialOptions);
    }
  }, [isOpen, messages.length]);

  const handleOptionClick = (optionText: string) => {
    const userMessage: Message = { id: messages.length + 1, text: optionText, sender: 'user' };
    const botResponse: Message = { 
      id: messages.length + 2, 
      text: `¡Entendido! Buscando los mejores agentes en ${optionText}. Te mostraré la lista...`, 
      sender: 'bot' 
    };
    
    setMessages([...messages, userMessage, botResponse]);
    setOptions([]);
    
    const normalizedOption = normalizeString(optionText); 
    const searchUrl = `/prestadores?categoria=${encodeURIComponent(normalizedOption)}`;

    timerRef.current = window.setTimeout(() => {
      navigate(searchUrl);
      handleClose(true);
    }, 1500);
  };
  
  // --- ¡LÓGICA DE "INTELIGENCIA" MEJORADA! ---
  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text) return;

    const normalizedText = normalizeString(text);
    const userMessage: Message = { id: messages.length + 1, text, sender: 'user' };
    
    let botResponseText = '';
    let shouldNavigate = false;
    let searchUrl = '';

    // 1. Revisar si es saludo
    if (greetings.some(g => normalizedText.startsWith(g))) {
      botResponseText = '¡Hola! ¿En qué te puedo ayudar hoy? (Puedes presionar un botón o escribir un oficio)';
    
    // 2. Revisar si es despedida
    } else if (farewells.some(f => normalizedText.includes(f))) {
      botResponseText = '¡De nada! Vuelve si necesitas algo más. Que tengas un buen día.';
    
    // 3. Revisar si es charla
    } else if (smallTalk.some(s => normalizedText.includes(s))) {
      botResponseText = '¡Estoy listo para ayudarte a buscar! Escribe un oficio (Ej: "gasfiter") o presiona un botón.';

    // 4. Revisar si es una BÚSQUEDA DE CATEGORÍA (?categoria=)
    } else if (categoryKeywords.some(keyword => normalizedText.includes(keyword))) {
      const foundCategory = initialOptions.find(option => normalizedText.includes(normalizeString(option))) || text;
      botResponseText = `¡Entendido! Buscando los mejores agentes en ${foundCategory}. Te mostraré la lista...`;
      shouldNavigate = true;
      searchUrl = `/prestadores?categoria=${encodeURIComponent(normalizeString(foundCategory))}`;
    
    // 5. Revisar si es una BÚSQUEDA GENERAL (?q=)
    } else if (generalKeywords.some(keyword => normalizedText.includes(keyword))) { 
      botResponseText = `¡Genial! Buscando resultados para "${text}". Te mostraré lo que encontré...`;
      shouldNavigate = true;
      searchUrl = `/prestadores?q=${encodeURIComponent(text)}`;

    // 6. Si no es nada de lo anterior, "no entiende" (¡AQUÍ ESTÁ TU REQUERIMIENTO!)
    } else {
      botResponseText = "No te he entendido bien. ¿Podrías ser más específico? Intenta escribir un oficio (como 'pintor') o el servicio que necesitas (ej: 'reparar fuga').";
      shouldNavigate = false;
    }

    const botMessage: Message = { 
      id: messages.length + 2, 
      text: botResponseText, 
      sender: 'bot' 
    };

    setMessages([...messages, userMessage, botMessage]);
    setOptions([]);
    setInputValue('');

    if (shouldNavigate) {
      timerRef.current = window.setTimeout(() => {
        navigate(searchUrl);
        handleClose(true);
      }, 1500);
    }
  };

  const handleClose = (navigating = false) => {
    setIsOpen(false);
    
    if (!navigating && timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    setTimeout(() => {
      setMessages([]);
      setOptions(initialOptions);
      setInputValue('');
    }, 300);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-yellow-400 text-slate-900 rounded-full p-3 shadow-lg hover:bg-yellow-300 transition-transform hover:scale-110 animate-pulse z-50"
        aria-label="Abrir chat"
      >
        <FaForumbee size={32} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-full max-w-sm sm:max-w-md z-50">
      <div className="bg-slate-800/80 backdrop-blur-md rounded-lg shadow-xl border border-slate-700 flex flex-col h-[500px]">
        
        <div className="p-3 border-b border-slate-700 flex justify-between items-center flex-shrink-0">
          <h3 className="text-lg font-bold text-white font-poppins">Concerje Chambee</h3>
          <button onClick={() => handleClose(false)} className="text-slate-400 hover:text-white text-2xl font-bold">&times;</button>
        </div>

        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'bot' ? 'justify-start' : 'justify-end'}`}>
              <div className={`rounded-lg px-4 py-2 max-w-xs break-words ${message.sender === 'bot' ? 'bg-slate-700 text-white' : 'bg-cyan-500 text-white'}`}>
                {message.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-3 border-t border-slate-700 flex-shrink-0">
          {options.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mb-3">
              {options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleOptionClick(option)}
                  className="bg-slate-700 text-cyan-300 border border-slate-600 rounded-full px-3 py-1 text-sm hover:bg-slate-600 hover:text-cyan-200 transition-colors"
                >
                  {option}
                </button>
              ))}
            </div>
          )}
          
          <form onSubmit={handleSendText} className="flex gap-2">
            <input 
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="O escribe lo que buscas..."
              className="flex-1 bg-slate-700 border border-slate-600 rounded-full px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <button
              type="submit"
              className="bg-cyan-500 text-white rounded-full p-2.5 h-10 w-10 flex-shrink-0 flex items-center justify-center hover:bg-cyan-400 transition-colors"
              aria-label="Enviar"
            >
              <FaPaperPlane />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}