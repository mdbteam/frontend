import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "../ui/select";
import { 
  FaCheckCircle, FaTimesCircle, FaFilePdf, FaImage, 
  FaUser, FaMapMarkerAlt, FaPhone, FaEnvelope, 
  FaExclamationTriangle, FaArrowLeft, FaSpinner 
} from "react-icons/fa";
import { useAuthStore } from "../../store/authStore";

// --- TIPOS ---
// Lo que esperamos que devuelva el NUEVO endpoint de detalle
export interface PostulacionDetalle {
  id_postulacion: number;
  id_usuario: number;
  nombres: string;
  primer_apellido: string;
  segundo_apellido?: string;
  correo: string;
  telefono?: string;     // Ahora sí vendrá
  direccion?: string;    // Ahora sí vendrá
  oficio: string;        // Ahora sí vendrá
  bio?: string;          // Ahora sí vendrá
  archivos_portafolio?: string[];   // Ahora sí vendrán
  archivos_certificados?: string[]; // Ahora sí vendrán
  fecha_postulacion: string;
  estado: string;
}

interface ReviewModalProps {
  postulacionId: number | null; // Recibimos ID para hacer el fetch
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: number) => void;
  onReject: (id: number, motivo: string) => void;
  isProcessing: boolean;
}

const RECHAZO_MOTIVOS = [
  "Documentación incompleta o ilegible",
  "No cumple con los requisitos de experiencia",
  "Perfil incompleto (Falta foto o biografía)",
  "Datos de contacto erróneos",
  "Duplicidad de cuenta",
  "Otro motivo"
];

// Instancia API para el modal
const api = axios.create({ baseURL: 'https://provider-service-mjuj.onrender.com' });

const fetchPostulacionDetail = async (id: number, token: string | null) => {
  if (!token) throw new Error("No token");
  // 🚀 LLAMADA AL NUEVO ENDPOINT QUE CREARÁ EL BACKEND
  const { data } = await api.get<PostulacionDetalle>(`/postulaciones/${id}`, {
    params: { token },
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

export function ReviewApplicationModal({ postulacionId, isOpen, onClose, onApprove, onReject, isProcessing }: ReviewModalProps) {
  const { token } = useAuthStore();
  const [isRejectMode, setIsRejectMode] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  // FETCH AUTOMÁTICO AL ABRIR
  const { data: postulacion, isLoading, error } = useQuery({
    queryKey: ['postulacionDetail', postulacionId],
    queryFn: () => fetchPostulacionDetail(postulacionId!, token),
    enabled: !!postulacionId && isOpen, // Solo ejecuta si hay ID y está abierto
    retry: 1
  });

  const handleClose = () => {
    setIsRejectMode(false);
    setSelectedReason("");
    setCustomReason("");
    onClose();
  };

  const handleConfirmReject = () => {
    const finalReason = selectedReason === "Otro motivo" ? customReason : `${selectedReason}. ${customReason}`;
    if (!finalReason.trim()) return;
    if (postulacion) onReject(postulacion.id_postulacion, finalReason);
  };

  if (!postulacionId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
        
        {/* LOADING STATE */}
        {isLoading ? (
            <div className="flex flex-col justify-center items-center py-20 gap-4">
                <FaSpinner className="animate-spin text-4xl text-amber-400" />
                <p className="text-slate-400">Cargando detalles de la postulación...</p>
            </div>
        ) : error ? (
            <div className="text-center text-red-400 py-10 bg-red-900/10 rounded-lg border border-red-900/20">
                <p className="font-bold">Error al cargar el detalle.</p>
                <p className="text-sm">Es posible que el backend aún no haya desplegado el endpoint <code>/postulaciones/{postulacionId}</code>.</p>
                <Button variant="ghost" onClick={handleClose} className="mt-4 text-white hover:bg-white/10">Cerrar</Button>
            </div>
        ) : postulacion ? (
            <>
                {/* HEADER */}
                <DialogHeader className="border-b border-slate-800 pb-4">
                <div className="flex justify-between items-start">
                    <div>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        {postulacion.nombres} {postulacion.primer_apellido}
                        <span className="text-sm font-normal bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/50">
                        {postulacion.oficio || "Oficio General"}
                        </span>
                    </DialogTitle>
                    <DialogDescription className="text-slate-400 mt-1">
                        Postulado el: {new Date(postulacion.fecha_postulacion).toLocaleDateString()}
                    </DialogDescription>
                    </div>
                </div>
                </DialogHeader>

                {/* BODY */}
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 py-4 ${isRejectMode ? 'opacity-50 pointer-events-none' : ''} transition-opacity duration-300`}>
                
                {/* COLUMNA 1: INFO PERSONAL */}
                <div className="space-y-6">
                    <div className="bg-slate-800/50 p-4 rounded-lg space-y-3 border border-slate-700">
                    <h3 className="font-semibold text-cyan-400 flex items-center gap-2"><FaUser /> Datos de Contacto</h3>
                    <div className="space-y-3 text-sm text-slate-300">
                        <p className="flex items-center gap-3 bg-slate-900/50 p-2 rounded border border-slate-800">
                            <FaEnvelope className="text-slate-500"/> {postulacion.correo}
                        </p>
                        <p className="flex items-center gap-3 bg-slate-900/50 p-2 rounded border border-slate-800">
                            <FaPhone className="text-slate-500"/> {postulacion.telefono || <span className="text-slate-500 italic">No registrado</span>}
                        </p>
                        <p className="flex items-center gap-3 bg-slate-900/50 p-2 rounded border border-slate-800">
                            <FaMapMarkerAlt className="text-slate-500"/> {postulacion.direccion || <span className="text-slate-500 italic">No registrada</span>}
                        </p>
                    </div>
                    </div>

                    <div>
                    <h3 className="font-semibold text-cyan-400 mb-2">Biografía Profesional</h3>
                    <p className="text-slate-300 text-sm leading-relaxed bg-slate-950/30 p-3 rounded border border-slate-800 whitespace-pre-wrap">
                        {postulacion.bio || <span className="text-slate-500 italic">Sin biografía disponible.</span>}
                    </p>
                    </div>
                </div>

                {/* COLUMNA 2: EVIDENCIA */}
                <div className="space-y-6">
                    
                    {/* Portafolio */}
                    <div>
                    <h3 className="font-semibold text-amber-400 mb-3 flex items-center gap-2"><FaImage /> Portafolio</h3>
                    {postulacion.archivos_portafolio && postulacion.archivos_portafolio.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3">
                        {postulacion.archivos_portafolio.map((url, idx) => (
                            <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="block group relative aspect-video bg-slate-800 rounded-lg overflow-hidden border border-slate-700 hover:border-amber-400 transition-all shadow-md">
                                <img src={url} alt={`Portafolio ${idx}`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-white text-xs font-bold">Ver Imagen</span>
                                </div>
                            </a>
                        ))}
                        </div>
                    ) : (
                        <div className="bg-slate-800/30 p-4 rounded border border-slate-800 text-center">
                            <p className="text-sm text-slate-500 italic">El postulante no subió imágenes.</p>
                        </div>
                    )}
                    </div>

                    {/* Certificados */}
                    <div>
                    <h3 className="font-semibold text-amber-400 mb-3 flex items-center gap-2"><FaFilePdf /> Documentación</h3>
                    <div className="space-y-2">
                        {postulacion.archivos_certificados && postulacion.archivos_certificados.length > 0 ? (
                        postulacion.archivos_certificados.map((url, idx) => (
                            <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors group">
                            <div className="bg-red-500/20 p-2 rounded text-red-400 group-hover:text-red-300"><FaFilePdf /></div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-slate-300 font-medium truncate">Certificado / Documento {idx + 1}</p>
                                <p className="text-xs text-slate-500">Clic para abrir</p>
                            </div>
                            </a>
                        ))
                        ) : (
                        <div className="bg-slate-800/30 p-4 rounded border border-slate-800 text-center">
                            <p className="text-sm text-slate-500 italic">Sin certificados adjuntos.</p>
                        </div>
                        )}
                    </div>
                    </div>
                </div>
                </div>

                {/* FOOTER */}
                <DialogFooter className={`border-t border-slate-800 pt-4 flex-col transition-all duration-300 ${isRejectMode ? 'bg-red-950/20 -mx-6 -mb-6 p-6 border-t-red-900/50' : ''}`}>
                {!isRejectMode ? (
                    <div className="flex flex-col sm:flex-row gap-3 w-full justify-end">
                    <Button variant="ghost" onClick={handleClose} disabled={isProcessing} className="text-slate-400 hover:text-white">Cancelar</Button>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <Button onClick={() => setIsRejectMode(true)} disabled={isProcessing} className="bg-red-900/50 text-red-200 hover:bg-red-900 hover:text-white border border-red-800 flex-1">
                        <FaTimesCircle className="mr-2" /> Rechazar
                        </Button>
                        <Button onClick={() => onApprove(postulacion.id_postulacion)} disabled={isProcessing} className="bg-green-700 text-white hover:bg-green-600 border border-green-600 flex-1">
                        <FaCheckCircle className="mr-2" /> Aprobar
                        </Button>
                    </div>
                    </div>
                ) : (
                    <div className="w-full space-y-4 animate-in slide-in-from-bottom-2 fade-in duration-300">
                    <div className="flex items-center gap-2 text-red-400 font-bold mb-2">
                        <FaExclamationTriangle />
                        <span>Confirmar Rechazo</span>
                    </div>
                    <div className="grid gap-4">
                        <div className="space-y-2">
                        <Label>Motivo Principal</Label>
                        <Select onValueChange={setSelectedReason} value={selectedReason}>
                            <SelectTrigger className="bg-slate-900 border-slate-600 text-white"><SelectValue placeholder="Selecciona una razón..." /></SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700 text-white">
                            {RECHAZO_MOTIVOS.map(motivo => <SelectItem key={motivo} value={motivo}>{motivo}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        </div>
                        <div className="space-y-2">
                        <Label>Detalles Adicionales</Label>
                        <Textarea value={customReason} onChange={(e) => setCustomReason(e.target.value)} placeholder="Escribe aquí..." className="bg-slate-900 border-slate-600 text-white min-h-[80px]" />
                        </div>
                    </div>
                    <div className="flex justify-between pt-2">
                        <Button variant="ghost" onClick={() => setIsRejectMode(false)} className="text-slate-400 hover:text-white"><FaArrowLeft className="mr-2" /> Volver</Button>
                        <Button onClick={handleConfirmReject} disabled={!selectedReason || isProcessing} className="bg-red-600 hover:bg-red-500 text-white font-bold">
                        {isProcessing ? "Procesando..." : "Confirmar Rechazo"}
                        </Button>
                    </div>
                    </div>
                )}
                </DialogFooter>
            </>
        ) : null}

      </DialogContent>
    </Dialog>
  );
}