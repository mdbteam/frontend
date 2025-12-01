import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "../ui/select";
import { 
  FaCheckCircle, FaTimesCircle, FaFilePdf, FaImage, 
  FaUser, FaMapMarkerAlt, FaPhone, FaEnvelope, 
  FaExclamationTriangle, FaArrowLeft, FaSpinner, FaChevronLeft 
} from "react-icons/fa";
import { useAuthStore } from "../../store/authStore";

// --- TIPOS ---
export interface PostulacionDetalle {
  id_postulacion: number;
  id_usuario: number;
  nombres: string;
  primer_apellido: string;
  segundo_apellido?: string;
  correo: string;
  telefono?: string;
  direccion?: string;
  
  oficio?: string;
  oficios?: string[];
  
  bio?: string;
  archivos_portafolio?: string[];
  archivos_certificados?: string[];
  fecha_postulacion: string;
  estado: string;
}

interface ReviewModalProps {
  postulacionId: number | null;
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

const api = axios.create({ baseURL: 'https://provider-service-mjuj.onrender.com' });

const fetchPostulacionDetail = async (id: number, token: string | null) => {
  if (!token) throw new Error("No token");
  const { data } = await api.get<PostulacionDetalle>(`/postulaciones/${id}`, {
    params: { token },
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log("📡 DETALLE POSTULACIÓN:", data); 
  return data;
};

export function ReviewApplicationModal({ postulacionId, isOpen, onClose, onApprove, onReject, isProcessing }: ReviewModalProps) {
  const { token } = useAuthStore();
  const [isRejectMode, setIsRejectMode] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  const { data: postulacion, isLoading, error } = useQuery({
    queryKey: ['postulacionDetail', postulacionId],
    queryFn: () => fetchPostulacionDetail(postulacionId!, token),
    enabled: !!postulacionId && isOpen,
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

  const getOficioDisplay = () => {
    if (!postulacion) return "";
    if (postulacion.oficio) return postulacion.oficio;
    if (postulacion.oficios && postulacion.oficios.length > 0) return postulacion.oficios[0];
    return "Sin oficio especificado";
  };

  if (!postulacionId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col p-0 gap-0">
        
        {/* LOADING STATE */}
        {isLoading ? (
            <div className="flex flex-col justify-center items-center py-20 gap-4">
                <FaSpinner className="animate-spin text-4xl text-amber-400" />
                <p className="text-slate-400">Cargando detalles de la postulación...</p>
            </div>
        ) : error ? (
            <div className="p-8 text-center">
                <div className="text-red-400 bg-red-900/10 rounded-lg border border-red-900/20 p-6 mb-4">
                    <p className="font-bold mb-1">Error al cargar el detalle</p>
                    <p className="text-sm opacity-80">No se pudo obtener la información de la postulación #{postulacionId}.</p>
                </div>
                <Button variant="ghost" onClick={handleClose} className="text-slate-400 hover:text-white">
                    <FaArrowLeft className="mr-2" /> Volver al listado
                </Button>
            </div>
        ) : postulacion ? (
            <>
                {/* HEADER CON BOTÓN ATRÁS INTEGRADO */}
                <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/50 sticky top-0 z-10 backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                        {/* Botón Atrás */}
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={handleClose} 
                            className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-full h-10 w-10 -ml-2"
                            title="Volver"
                        >
                            <FaChevronLeft />
                        </Button>
                        
                        <div>
                            <DialogTitle className="text-xl font-bold flex items-center gap-3">
                                {postulacion.nombres} {postulacion.primer_apellido}
                                <span className="text-xs font-medium bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20 uppercase tracking-wide">
                                    {getOficioDisplay()}
                                </span>
                            </DialogTitle>
                            <DialogDescription className="text-slate-500 text-xs mt-1 flex items-center gap-2">
                                <FaCheckCircle className="text-green-500/50" size={10} /> 
                                Postulado el: {new Date(postulacion.fecha_postulacion).toLocaleDateString()}
                            </DialogDescription>
                        </div>
                    </div>
                </div>

                {/* BODY CON SCROLL */}
                <div className="p-6 overflow-y-auto">
                    <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 transition-opacity duration-300 ${isRejectMode ? 'opacity-30 pointer-events-none blur-[1px]' : 'opacity-100'}`}>
                    
                        {/* COLUMNA 1: DATOS PERSONALES */}
                        <div className="space-y-6">
                            <section>
                                <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <FaUser className="text-cyan-500/70" /> Información de Contacto
                                </h3>
                                <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700 space-y-3 text-sm text-slate-300">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-slate-900 p-2 rounded-lg text-slate-500"><FaEnvelope /></div>
                                        <span className="break-all">{postulacion.correo}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="bg-slate-900 p-2 rounded-lg text-slate-500"><FaPhone /></div>
                                        <span>{postulacion.telefono || <span className="text-slate-600 italic">No registrado</span>}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="bg-slate-900 p-2 rounded-lg text-slate-500"><FaMapMarkerAlt /></div>
                                        <span>{postulacion.direccion || <span className="text-slate-600 italic">No registrada</span>}</span>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-3">Biografía Profesional</h3>
                                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 min-h-[100px]">
                                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap break-words">
                                        {postulacion.bio || <span className="text-slate-600 italic">Sin biografía disponible.</span>}
                                    </p>
                                </div>
                            </section>
                        </div>

                        {/* COLUMNA 2: EVIDENCIA */}
                        <div className="space-y-6">
                            <section>
                                <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <FaImage className="text-amber-500/70" /> Portafolio de Trabajo
                                </h3>
                                {postulacion.archivos_portafolio && postulacion.archivos_portafolio.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-3">
                                        {postulacion.archivos_portafolio.map((url, idx) => (
                                            <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="block group relative aspect-video bg-slate-800 rounded-lg overflow-hidden border border-slate-700 hover:border-amber-400 transition-all">
                                                <img src={url} alt={`Portafolio ${idx}`} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="text-xs font-bold text-white bg-black/60 px-2 py-1 rounded">Ver</span>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-slate-800/20 border border-slate-800 border-dashed rounded-xl p-6 text-center text-slate-600 text-sm italic">
                                        No hay imágenes adjuntas.
                                    </div>
                                )}
                            </section>

                            <section>
                                <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <FaFilePdf className="text-amber-500/70" /> Certificaciones
                                </h3>
                                <div className="space-y-2">
                                    {postulacion.archivos_certificados && postulacion.archivos_certificados.length > 0 ? (
                                        postulacion.archivos_certificados.map((url, idx) => (
                                            <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-all group">
                                                <div className="bg-red-500/10 p-2 rounded-md text-red-400 group-hover:text-red-300 group-hover:bg-red-500/20"><FaFilePdf /></div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-slate-300 font-medium truncate">Documento Adjunto {idx + 1}</p>
                                                    <p className="text-[10px] text-slate-500 uppercase tracking-wide">Clic para visualizar</p>
                                                </div>
                                            </a>
                                        ))
                                    ) : (
                                        <div className="bg-slate-800/20 border border-slate-800 border-dashed rounded-xl p-4 text-center text-slate-600 text-sm italic">
                                            Sin documentos.
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>

                {/* FOOTER ACCIONES */}
                <div className={`p-6 border-t border-slate-800 bg-slate-950 transition-all duration-300 ${isRejectMode ? 'bg-red-950/20 border-t-red-900/30' : ''}`}>
                    {!isRejectMode ? (
                        <div className="flex justify-end gap-3">
                            <Button 
                                variant="outline" 
                                onClick={() => setIsRejectMode(true)} 
                                disabled={isProcessing} 
                                className="border-red-900/50 text-red-400 hover:bg-red-950/50 hover:text-red-300 hover:border-red-800"
                            >
                                <FaTimesCircle className="mr-2" /> Rechazar Solicitud
                            </Button>
                            <Button 
                                onClick={() => onApprove(postulacion.id_postulacion)} 
                                disabled={isProcessing} 
                                className="bg-amber-400 hover:bg-amber-500 text-black shadow-lg shadow-amber-900/20 pl-4 pr-6"
                            >
                                <FaCheckCircle className="mr-2" /> Aprobar Prestador
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in slide-in-from-bottom-2 fade-in">
                            <div className="flex items-center justify-between">
                                <h4 className="text-red-400 font-bold flex items-center gap-2">
                                    <FaExclamationTriangle /> Confirmar Rechazo
                                </h4>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => setIsRejectMode(false)} 
                                    className="text-slate-500 hover:text-white h-8"
                                >
                                    Cancelar
                                </Button>
                            </div>
                            
                            <div className="grid gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-slate-400 uppercase font-bold">Motivo Principal</Label>
                                    <Select onValueChange={setSelectedReason} value={selectedReason}>
                                        <SelectTrigger className="bg-slate-900 border-slate-700 text-white focus:ring-red-500/50">
                                            <SelectValue placeholder="Selecciona una razón..." />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                            {RECHAZO_MOTIVOS.map(motivo => <SelectItem key={motivo} value={motivo}>{motivo}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-slate-400 uppercase font-bold">Comentarios Adicionales (Opcional)</Label>
                                    <Textarea 
                                        value={customReason} 
                                        onChange={(e) => setCustomReason(e.target.value)} 
                                        placeholder="Escribe detalles específicos para el usuario..." 
                                        className="bg-slate-900 border-slate-700 text-white min-h-[80px] focus:border-red-500/50" 
                                    />
                                </div>
                            </div>
                            
                            <div className="flex justify-end pt-2">
                                <Button 
                                    onClick={handleConfirmReject} 
                                    disabled={!selectedReason || isProcessing} 
                                    className="bg-red-600 hover:bg-red-500 text-white font-bold w-full sm:w-auto"
                                >
                                    {isProcessing ? <><FaSpinner className="animate-spin mr-2"/> Procesando...</> : "Confirmar y Rechazar"}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}