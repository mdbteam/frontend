import type { ApplicationStatus } from '../../types/adminTypes'; 

interface StatusLabelProps {
  status: ApplicationStatus; 
}

const StatusLabel: React.FC<StatusLabelProps> = ({ status }) => {
  const statusStyles: Record<ApplicationStatus, string> = {
    Pendiente: 'bg-yellow-100 text-yellow-800',
    Aprobado: 'bg-green-100 text-green-800',
    Rechazado: 'bg-red-100 text-red-800',
    'Requiere Modificación': 'bg-blue-100 text-blue-800',
  };

  return (
    <span
      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}
    >
      {status}
    </span>
  );
};

export default StatusLabel;