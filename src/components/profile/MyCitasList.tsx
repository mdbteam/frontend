import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom'; 
import { 
  FaSpinner, FaStar, FaClock, FaCheckCircle, 
  FaBan, FaUser, FaCommentDots, FaFileInvoiceDollar, 
  FaMoneyBillWave, FaExclamationCircle, FaHourglassHalf 
} from 'react-icons/fa'; 

import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '../ui/dialog';
import { InfoDialog } from '../ui/InfoDialog';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';

// Importamos el componente de valoración
import { RateServiceModal } from './RateServiceModal';

// --- API ---
const apiCalendario = axios.create({ baseURL: 'https://calendario-service-u5f6.onrender.com' });
const apiProveedores = axios.create({ baseURL: 'https://provider-service-mjuj.onrender.com' });

// --- TIPOS ---
interface CitaDetail {
  id_cita: number;
  id_cliente: number;
  id_prestador: number;
  fecha_hora_cita: string;
  detalles: string | null;
  estado: string;
  id_trabajo: number | null; 
  estado_trabajo: string | null; 
  cliente_nombres: string | null;
  prestador_nombres: string | null;
  id_valoracion: number | null;
}

interface TrabajoFullDetail {
    id_trabajo: number;
    descripcion: string;
    precio_acordado: number;
    estado: string;
}

interface CreateTrabajoProps {
  cita: CitaDetail;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ViewProposalProps {
  trabajoId: number;
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

// --- SCHEMA ---
const trabajoSchema = z.object({
  descripcion: z.string().min(10, "La descripción es requerida (mín. 10 caracteres)"),
  precio_acordado: z.number().min(1000, "El precio debe ser mayor a 1000"),
});
type TrabajoFormInputs = z.infer<typeof trabajoSchema>;

// --- FETCHERS ---
const fetchMyCitas = async (token: string | null) => {
  if (!token) throw new Error("No autenticado");
  const { data } = await apiCalendario.get<CitaDetail[]>("/citas/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

const fetchTrabajoDetail = async (id: number, token: string | null) => {
    if (!token) throw new Error("No token");
    const { data } = await apiProveedores.get<TrabajoFullDetail>(`/trabajos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};

const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return "$0";
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
};

// --- COMPONENTES AUXILIARES ---

function CitaStatusBadge({ cita }: { cita: CitaDetail }) {
  if (cita.estado_trabajo) {
    let colorClass = "bg-blue-900/30 text-blue-300 border-blue-800";
    let label = `Estado: ${cita.estado_trabajo}`;

    switch (cita.estado_trabajo.toLowerCase()) {
      case 'propuesto': colorClass = "bg-cyan-900/30 text-cyan-300 border-cyan-800 animate-pulse"; label = "Cotización Recibida"; break;
      case 'aceptado': colorClass = "bg-indigo-900/30 text-indigo-300 border-indigo-800"; label = "En Progreso"; break;
      case 'finalizado': colorClass = "bg-purple-900/30 text-purple-300 border-purple-800"; label = "Por Confirmar/Pagar"; break;
      case 'confirmado': 
      case 'valorado': colorClass = "bg-green-900/30 text-green-300 border-green-800"; label = "Completado"; break;
    }
    return <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${colorClass} uppercase tracking-wider`}>{label}</span>;
  }

  let colorClass = "bg-slate-800 text-slate-400 border-slate-700";
  switch (cita.estado.toLowerCase()) {
    case 'pendiente': colorClass = "bg-amber-900/30 text-amber-300 border-amber-800"; break;
    case 'aceptada': colorClass = "bg-emerald-900/30 text-emerald-300 border-emerald-800"; break;
    case 'rechazada': colorClass = "bg-red-900/30 text-red-300 border-red-800"; break;
  }
  return <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${colorClass} uppercase tracking-wider`}>{cita.estado}</span>;
}

// 1. MODAL CREAR COTIZACIÓN (Prestador)
function CreateTrabajoModal({ cita, isOpen, onClose, onSuccess }: CreateTrabajoProps) {
  const { token } = useAuthStore();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<TrabajoFormInputs>({ resolver: zodResolver(trabajoSchema) });

  const mutation = useMutation({
    mutationFn: (data: TrabajoFormInputs) => apiProveedores.post('/trabajos', {
      ...data, id_cita: cita.id_cita, id_cliente: cita.id_cliente, id_prestador: cita.id_prestador
    }, { headers: { Authorization: `Bearer ${token}` } }),
    onSuccess: () => { onSuccess(); onClose(); },
    onError: (e) => console.error(e)
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white sm:max-w-md">
        <DialogHeader><DialogTitle className="text-cyan-400">Crear Cotización</DialogTitle><DialogDescription className="text-slate-400">Envía el presupuesto al cliente.</DialogDescription></DialogHeader>
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4 pt-2">
          <div><Label>Descripción del Servicio</Label><Textarea {...register("descripcion")} className="bg-slate-800 border-slate-700 mt-1" placeholder="Detalla materiales, mano de obra, tiempos..." />{errors.descripcion && <p className="text-red-400 text-xs mt-1">{errors.descripcion.message}</p>}</div>
          <div><Label>Precio Total (CLP)</Label><Input type="number" {...register("precio_acordado", { valueAsNumber: true })} className="bg-slate-800 border-slate-700 mt-1" placeholder="Ej: 30000" />{errors.precio_acordado && <p className="text-red-400 text-xs mt-1">{errors.precio_acordado.message}</p>}</div>
          <DialogFooter><Button type="button" variant="ghost" onClick={onClose} className="text-slate-400 hover:text-white">Cancelar</Button><Button type="submit" disabled={isSubmitting} className="bg-cyan-600 hover:bg-cyan-500 text-white">Enviar Cotización</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// 2. MODAL VER COTIZACIÓN (Cliente)
function ViewProposalModal({ trabajoId, isOpen, onClose, onAccept }: ViewProposalProps) {
    const { token } = useAuthStore();
    
    const { data: trabajo, isLoading, error } = useQuery({
        queryKey: ['trabajoDetail', trabajoId],
        queryFn: () => fetchTrabajoDetail(trabajoId, token),
        enabled: !!trabajoId && isOpen
    });

    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white sm:max-w-md">
          <DialogHeader>
              <DialogTitle className="text-2xl text-emerald-400 flex items-center gap-2">
                  <FaFileInvoiceDollar /> Cotización Recibida
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                  Revisa los detalles antes de aceptar.
              </DialogDescription>
          </DialogHeader>
          
          {isLoading ? (
              <div className="flex justify-center py-8"><FaSpinner className="animate-spin text-3xl text-emerald-500"/></div>
          ) : error || !trabajo ? (
              <div className="text-center text-red-400 py-4 bg-red-900/10 rounded">Error al cargar la cotización.</div>
          ) : (
              <div className="py-4 space-y-6 animate-in fade-in zoom-in-95 duration-200">
                  <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 text-center shadow-inner relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity"><FaMoneyBillWave size={60} /></div>
                      <p className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Total a Pagar</p>
                      <p className="text-4xl font-bold text-white font-mono tracking-tight">
                          {formatCurrency(trabajo.precio_acordado)}
                      </p>
                  </div>
                  <div>
                      <h4 className="text-slate-300 font-bold mb-2 text-xs uppercase flex items-center gap-2"><FaCommentDots/> Detalle del trabajo</h4>
                      <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-slate-300 text-sm italic leading-relaxed">
                          "{trabajo.descripcion}"
                      </div>
                  </div>
              </div>
          )}

          <DialogFooter className="flex-col-reverse sm:flex-row gap-2 w-full">
              <Button type="button" variant="ghost" onClick={onClose} className="w-full sm:w-auto text-slate-400 hover:text-white">Cerrar</Button>
              <Button type="button" onClick={onAccept} disabled={isLoading || !trabajo} className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-900/20">
                  <FaCheckCircle className="mr-2" /> Aceptar Presupuesto
              </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
}

// --- MAIN COMPONENT ---
export function MyCitasList() {
  const { token, user } = useAuthStore();
  const queryClient = useQueryClient();
  
  // Estado simple para abrir el modal del cliente
  const [openProposalId, setOpenProposalId] = useState<number | null>(null);
  
  const [modalProposal, setModalProposal] = useState<CitaDetail | null>(null);
  const [modalRate, setModalRate] = useState<{id: number, nombre: string} | null>(null);
  const [modalInfo, setModalInfo] = useState({ isOpen: false, title: "", description: "", type: "success" as "success" | "error" });

  const currentUserId = Number(user?.id);

  const { data: citas, isLoading, error } = useQuery({
    queryKey: ["myCitas"],
    queryFn: () => fetchMyCitas(token),
  });

  const actionMutation = useMutation({
    mutationFn: async ({ url, service }: { url: string, service: 'calendario' | 'proveedores' }) => {
      const api = service === 'calendario' ? apiCalendario : apiProveedores;
      return api.post(url, {}, { headers: { Authorization: `Bearer ${token}` } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myCitas'] });
      setModalInfo({ isOpen: true, title: "Éxito", description: "Acción completada.", type: "success" });
      setOpenProposalId(null);
    },
    onError: () => setModalInfo({ isOpen: true, title: "Error", description: "No se pudo completar la acción.", type: "error" })
  });

  const handleAction = (url: string, service: 'calendario' | 'proveedores') => {
    actionMutation.mutate({ url, service });
  };

  if (isLoading) return <div className="flex justify-center p-10"><FaSpinner className="animate-spin text-3xl text-cyan-400" /></div>;
  if (error) return <div className="text-center text-red-400 p-4 bg-slate-800 rounded-lg border border-red-900/50">Error al cargar citas.</div>;
  if (!citas || citas.length === 0) return <div className="text-center text-slate-400 p-10 bg-slate-800/50 rounded-xl border border-slate-700">No tienes citas agendadas.</div>;

  return (
    <div className="space-y-4">
      <InfoDialog isOpen={modalInfo.isOpen} onClose={() => setModalInfo({ ...modalInfo, isOpen: false })} title={modalInfo.title} description={modalInfo.description} type={modalInfo.type} />
      
      {citas.map((cita) => {
        const soyElPrestador = cita.id_prestador === currentUserId;
        const soyElCliente = cita.id_cliente === currentUserId;
        const nombreOtro = soyElPrestador ? cita.cliente_nombres : cita.prestador_nombres;
        const rolOtro = soyElPrestador ? "Cliente" : "Prestador";
        const idOtro = soyElPrestador ? cita.id_cliente : cita.id_prestador;

        return (
          <div key={cita.id_cita} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg hover:border-slate-700 transition-all">
            
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 text-white font-bold text-lg">
                  <FaClock className="text-cyan-400" />
                  {new Date(cita.fecha_hora_cita).toLocaleString('es-CL', { dateStyle: 'full', timeStyle: 'short' })}
                </div>
                <div className="flex items-center gap-3 text-slate-400 text-sm mt-1">
                  <div className="flex items-center gap-1">
                    <FaUser className="text-slate-500" />
                    <span>{rolOtro}: <strong className="text-slate-200">{nombreOtro || `Usuario #${idOtro}`}</strong></span>
                  </div>
                  <Link to={`/mensajes/${idOtro}`} className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors font-medium bg-cyan-950/30 px-2 py-0.5 rounded border border-cyan-900/50">
                    <FaCommentDots size={12} /><span className="text-xs">Chat</span>
                  </Link>
                </div>
              </div>
              <CitaStatusBadge cita={cita} />
            </div>

            {cita.detalles && (
              <div className="bg-slate-950/50 p-3 rounded-lg mb-4 border border-slate-800/50">
                <p className="text-slate-400 text-xs uppercase font-bold mb-1">Solicitud Inicial:</p>
                <p className="text-slate-300 text-sm italic break-words whitespace-pre-wrap leading-relaxed">"{cita.detalles}"</p>
              </div>
            )}

            {/* BARRA DE ACCIONES */}
            <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-700 items-center mt-3">
              
              {/* === PRESTADOR === */}
              {soyElPrestador && (
                <>
                  {cita.estado === 'pendiente' && (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => handleAction(`/citas/${cita.id_cita}/rechazar`, 'calendario')} className="text-red-400 hover:bg-red-900/20"><FaBan className="mr-2"/> Rechazar</Button>
                      <Button className="bg-emerald-600 hover:bg-emerald-500 text-white" size="sm" onClick={() => handleAction(`/citas/${cita.id_cita}/aceptar`, 'calendario')}><FaCheckCircle className="mr-2"/> Aceptar Hora</Button>
                    </>
                  )}
                  
                  {/* CORRECCIÓN: Solo muestra botón si no hay trabajo creado. Si hay, muestra estado. */}
                  {cita.estado === 'aceptada' && !cita.id_trabajo && (
                    <Button className="bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg" size="sm" onClick={() => setModalProposal(cita)}>
                        <FaMoneyBillWave className="mr-2"/> Crear Cotización
                    </Button>
                  )}
                  {cita.estado_trabajo === 'propuesto' && (
                      <span className="text-slate-500 text-xs italic flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-full border border-slate-800">
                          <FaHourglassHalf className="animate-spin-slow text-amber-500"/> Esperando aceptación del cliente...
                      </span>
                  )}
                  {cita.estado_trabajo === 'aceptado' && (
                    <Button className="bg-indigo-600 hover:bg-indigo-500 text-white" size="sm" onClick={() => handleAction(`/trabajos/${cita.id_trabajo}/finalizar`, 'proveedores')}>
                        Finalizar Trabajo
                    </Button>
                  )}
                </>
              )}

              {/* === CLIENTE === */}
              {soyElCliente && (
                <>
                  {cita.estado === 'pendiente' && (
                    <span className="text-slate-500 text-xs italic flex items-center bg-slate-900/50 px-3 py-1.5 rounded-full"><FaClock className="mr-1.5"/> Esperando confirmación de hora...</span>
                  )}
                  
                  {/* CORRECCIÓN: Botón "Ver Cotización" ahora funciona */}
                  {cita.estado_trabajo === 'propuesto' && cita.id_trabajo && (
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <span className="text-amber-400 text-xs font-bold flex items-center animate-pulse"><FaExclamationCircle className="mr-1"/> ¡Cotización recibida!</span>
                        <Button 
                            className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 cursor-pointer" 
                            size="sm" 
                            onClick={(e) => {
                                e.stopPropagation(); // Evitar problemas de doble click
                                setOpenProposalId(cita.id_trabajo); // Abrimos modal con este ID
                            }}
                        >
                            <FaFileInvoiceDollar className="mr-2"/> Ver y Aceptar
                        </Button>
                    </div>
                  )}

                  {cita.estado_trabajo === 'finalizado' && (
                    <Button className="bg-purple-600 hover:bg-purple-500 text-white border-none shadow-lg" size="sm" onClick={() => handleAction(`/trabajos/${cita.id_trabajo}/confirmar`, 'proveedores')}>
                        Confirmar y Pagar
                    </Button>
                  )}
                  
                  {cita.estado_trabajo === 'confirmado' && !cita.id_valoracion && (
                    <Button 
                        className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold border-none shadow-lg shadow-amber-900/20 animate-bounce" 
                        size="sm" 
                        onClick={() => setModalRate({ id: cita.id_trabajo!, nombre: cita.prestador_nombres || 'Prestador' })}
                    >
                        <FaStar className="mr-1.5" /> Valorar Servicio
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}

      {/* --- MODALES --- */}
      
      {modalProposal && <CreateTrabajoModal cita={modalProposal} isOpen={true} onClose={() => setModalProposal(null)} onSuccess={() => queryClient.invalidateQueries({ queryKey: ['myCitas'] })} />}
      
      {/* CORRECCIÓN: Renderizado Condicional Seguro */}
      {openProposalId && (
        <ViewProposalModal 
            trabajoId={openProposalId} 
            isOpen={true} 
            onClose={() => setOpenProposalId(null)}
            onAccept={() => handleAction(`/trabajos/${openProposalId}/aceptar`, 'proveedores')}
        />
      )}

      {modalRate && (
        <RateServiceModal 
            trabajoId={modalRate.id}
            prestadorNombre={modalRate.nombre}
            isOpen={true} 
            onClose={() => setModalRate(null)} 
            onSuccess={() => {
                queryClient.invalidateQueries({ queryKey: ['myCitas'] });
                setModalInfo({ isOpen: true, title: "¡Gracias!", description: "Tu valoración ha sido enviada.", type: "success" });
            }} 
        />
      )}
    </div>
  );
}