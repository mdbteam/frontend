import React from 'react';

interface StatusLabelProps {
  status: 'Pendiente' | 'Aprobado' | 'Rechazado' | 'Requiere Modificación';
}

const StatusLabel: React.FC<StatusLabelProps> = ({ status }) => {
  const statusStyles = {
    Pendiente: 'bg-yellow-100 text-yellow-800',
    Aprobado: 'bg-green-100 text-green-800',
    Rechazado: 'bg-red-100 text-red-800',
    'Requiere Modificación': 'bg-blue-100 text-blue-800',
  };

  return (
    <span
      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
};

export default StatusLabel;