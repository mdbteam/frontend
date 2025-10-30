import { Link } from 'react-router-dom';

interface ServiceCardProps {
    readonly nombre: string;
    readonly precioEstimado: string;
}

export function ServiceCard({ nombre, precioEstimado }: ServiceCardProps) {
    return (
        <Link 
            to="#"
            className="flex items-center justify-between rounded-lg bg-slate-900/50 border border-slate-700 p-4 transition-transform hover:scale-105 hover:border-cyan-400"
        >
            <div>
                <h3 className="font-semibold text-slate-200">{nombre}</h3>
            </div>
            <div className="text-right">
                <p className="text-lg font-bold text-cyan-400">{precioEstimado}</p>
                <span className="text-xs text-slate-500">Precio estimado</span>
            </div>
        </Link>
    );
}