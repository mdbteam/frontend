import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaPaperPlane, FaTimes, FaMinus, FaForumbee, FaUser 
} from "react-icons/fa";

const CHATBOT_API_URL = '/api/chatbot/query';
const PROVIDER_API_URL = 'https://provider-service-mjuj.onrender.com/prestadores';

// --- TIPOS ---
interface Message {
  id: number;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
}

interface ChatMessageAPI {
  role: 'user' | 'model';
  parts: { text: string }[];
}

interface ChatbotData {
  oficio?: string;
  genero?: string;
  [key: string]: unknown;
}

interface ChatbotResponseAPI {
  respuesta_texto: string;
  intent: string;
  data: ChatbotData | null;
  history: ChatMessageAPI[];
}

interface PendingAction {
  type: 'alternative_search';
  data: { oficio?: string };
}

const initialOptions = [
  'Gasfitería', 'Electricidad', 'Carpintería', 'Pintura', 'Jardinería'
];

// --- HELPER: NORMALIZAR CATEGORÍAS (IA -> DB) ---
const normalizeCategory = (text: string): string => {
  if (!text) return "";
  
  // CORRECCIÓN: Usamos 'const' porque no se reasigna
  const normalized = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  
  // Mapeos manuales
  if (normalized.includes("aire")) return "Instalacion de Aire Acondicionado";
  if (normalized.includes("electro")) return "Reparacion de Electrodomesticos";
  if (normalized.includes("limpieza") || normalized.includes("aseo")) return "Servicios de Limpieza";
  if (normalized.includes("albanil")) return "Albanileria"; 

  // Capitalizar primera letra
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

// --- COMPONENTE INDICADOR ---
const TypingIndicator = () => (
  <div className="flex space-x-1 p-2 bg-slate-700/50 rounded-2xl rounded-tl-none w-16 items-center justify-center">
    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
  </div>
);

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [options, setOptions] = useState<string[]>(initialOptions);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages, isTyping, isOpen]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setIsTyping(true);
      setTimeout(() => {
        setMessages([{
          id: 1,
          text: "¡Hola! Soy Bee 🐝. Puedo filtrar por género o especialidad. Prueba: 'Busco una electricista mujer'.",
          sender: 'bot',
          timestamp: new Date()
        }]);
        setIsTyping(false);
      }, 600);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && !isMinimized) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen, isMinimized]);

  // --- LÓGICA DE VERIFICACIÓN ---
  const checkAvailability = async (oficioNormalizado?: string, genero?: string) => {
    try {
      const { data } = await axios.get(PROVIDER_API_URL, {
        params: { 
            categoria: oficioNormalizado, 
            genero: genero 
        }
      });
      return Array.isArray(data) && data.length > 0;
    } catch (error) {
      console.error("Error verificando disponibilidad:", error);
      return false;
    }
  };

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;
    
    const text = inputValue.trim();
    addMessage(text, 'user');
    setInputValue('');
    setOptions([]);
    
    if (pendingAction) handleAlternativeResponse(text);
    else processMessage(text);
  };

  const handleOptionClick = (optionText: string) => {
    addMessage(optionText, 'user');
    setOptions([]);
    if (pendingAction) handleAlternativeResponse(optionText);
    else processMessage(optionText);
  };

  const handleAlternativeResponse = (text: string) => {
    const isAffirmative = text.toLowerCase().match(/s[íi]|claro|bueno|yes|ok|dale|mostrar|ver/);
    
    if (isAffirmative && pendingAction) {
        addMessage("¡Entendido! Te muestro los mejores profesionales disponibles sin filtro de género.", 'bot');
        
        const params = new URLSearchParams();
        if (pendingAction.data.oficio) {
            params.append('categoria', normalizeCategory(pendingAction.data.oficio));
        }
        
        const searchUrl = `/prestadores?${params.toString()}`;
        
        setTimeout(() => {
            navigate(searchUrl);
            setIsMinimized(true);
            setPendingAction(null);
        }, 1500);

    } else {
        addMessage("Comprendo. Avísame si necesitas buscar otra cosa.", 'bot');
        setPendingAction(null);
        setOptions(initialOptions);
    }
  };

  const addMessage = (text: string, sender: 'bot' | 'user') => {
    setMessages(prev => [...prev, { id: Date.now(), text, sender, timestamp: new Date() }]);
  };

  const processMessage = async (text: string) => {
    setIsTyping(true);

    try {
      const apiHistory: ChatMessageAPI[] = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      const { data } = await axios.post<ChatbotResponseAPI>(CHATBOT_API_URL, {
        mensaje: text,
        history: apiHistory,
      });

      setTimeout(async () => {
        
        if (data.intent === 'buscar_prestador') {
            const rawOficio = data.data?.oficio;
            const genero = data.data?.genero;

            const oficioNormalizado = rawOficio ? normalizeCategory(rawOficio) : undefined;

            let hayResultados = true;
            
            if (genero) {
                hayResultados = await checkAvailability(oficioNormalizado, genero);
            }

            setIsTyping(false);

            if (hayResultados) {
                addMessage(data.respuesta_texto, 'bot');
                
                const params = new URLSearchParams();
                if (oficioNormalizado) params.append('categoria', oficioNormalizado);
                if (genero) params.append('genero', genero);
                
                if (!oficioNormalizado && !genero) params.append('q', text);

                setTimeout(() => {
                    navigate(`/prestadores?${params.toString()}`);
                    setIsMinimized(true);
                }, 2000);

            } else {
                const msgAlternativo = `No encontré ${genero === 'femenino' ? 'mujeres' : 'profesionales'} disponibles en ${rawOficio || 'esa categoría'} ahora mismo. 😔\n\n¿Quieres ver los profesionales con mejor puntuación?`;
                
                addMessage(msgAlternativo, 'bot');
                setPendingAction({ type: 'alternative_search', data: { oficio: rawOficio } });
                setOptions(['Sí, mostrar mejores', 'No, gracias']);
            }

        } else {
            addMessage(data.respuesta_texto, 'bot');
            setIsTyping(false);
        }

      }, 600);

    } catch (error) {
      console.error("Error chatbot:", error);
      setIsTyping(false);
      addMessage("Ups, tuve un problema de conexión. ¿Podrías repetirlo?", 'bot');
    }
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 rounded-full p-4 shadow-[0_0_20px_rgba(251,191,36,0.4)] hover:scale-110 transition-all duration-300 z-50 group"
        aria-label="Abrir asistente virtual"
        title="Abrir asistente virtual"
      >
        <FaForumbee size={32} className="group-hover:rotate-12 transition-transform" />
        <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
        <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>
      </button>
    );
  }

  const containerClasses = `fixed bottom-6 right-6 w-[90vw] sm:w-[400px] flex flex-col bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden transition-all duration-300 ease-in-out origin-bottom-right ${
    isMinimized ? 'h-14 opacity-90 hover:opacity-100' : 'h-[600px] opacity-100'
  }`;

  return (
    <div className={containerClasses}>
      <div 
        className="bg-slate-800/90 backdrop-blur-sm p-4 flex justify-between items-center cursor-pointer border-b border-slate-700"
        onClick={() => isMinimized && setIsMinimized(false)}
        role="button"
        tabIndex={0}
        aria-label={isMinimized ? "Maximizar chat" : undefined}
        title={isMinimized ? "Maximizar chat" : undefined}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && isMinimized && setIsMinimized(false)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
            <FaForumbee className="text-slate-900 text-lg" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Asistente Chambee</h3>
            {!isMinimized && <p className="text-[10px] text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> En línea</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} 
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-700 transition-colors"
            aria-label={isMinimized ? "Maximizar chat" : "Minimizar chat"}
            title={isMinimized ? "Maximizar chat" : "Minimizar chat"}
          >
            {isMinimized ? <span className="text-xs font-bold px-2">Abrir</span> : <FaMinus size={12} />}
          </button>
          {!isMinimized && (
            <button 
              type="button"
              onClick={() => setIsOpen(false)} 
              className="text-slate-400 hover:text-red-400 p-1 rounded hover:bg-slate-700 transition-colors"
              aria-label="Cerrar chat"
              title="Cerrar chat"
            >
              <FaTimes size={14} />
            </button>
          )}
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="flex-1 p-4 overflow-y-auto custom-scrollbar bg-slate-900/50 relative">
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
            <div className="space-y-4 relative z-10">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'bot' ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                  {msg.sender === 'bot' && (
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                      <FaForumbee className="text-amber-400 text-lg" />
                    </div>
                  )}
                  <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.sender === 'bot' ? 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700' : 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-white rounded-tr-none'}`}>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <span className={`text-[10px] block mt-1 opacity-60 text-right ${msg.sender === 'user' ? 'text-cyan-100' : 'text-slate-400'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {msg.sender === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-cyan-900/30 border border-cyan-500/30 flex items-center justify-center ml-2 flex-shrink-0 mt-1">
                      <FaUser className="text-cyan-400 text-xs" />
                    </div>
                  )}
                </div>
              ))}
              {isTyping && <div className="flex justify-start animate-in fade-in duration-300"><div className="w-8 h-8 mr-2" /><TypingIndicator /></div>}
              <div ref={messagesEndRef} />
            </div>
          </div>
          <div className="p-3 bg-slate-800 border-t border-slate-700">
            {options.length > 0 && !isTyping && (
              <div className="flex flex-wrap gap-2 mb-3 max-h-24 overflow-y-auto px-1 custom-scrollbar">
                {options.map((option) => (
                  <button
                    type="button"
                    key={option}
                    onClick={() => handleOptionClick(option)}
                    className="text-xs bg-slate-700 hover:bg-cyan-600 text-slate-200 hover:text-white border border-slate-600 hover:border-cyan-500 px-3 py-1.5 rounded-full transition-all duration-200 animate-in zoom-in-95"
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
            <form onSubmit={handleSendText} className="flex items-end gap-2">
              <input ref={inputRef} type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Escribe tu consulta..." className="flex-1 bg-slate-900 border border-slate-600 text-slate-100 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition-all placeholder:text-slate-500" disabled={isTyping} />
              <button type="submit" disabled={!inputValue.trim() || isTyping} className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 p-3 rounded-xl transition-all disabled:opacity-50" aria-label="Enviar" title="Enviar"><FaPaperPlane size={16} /></button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}