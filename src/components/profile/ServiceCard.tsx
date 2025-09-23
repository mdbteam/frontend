

interface ServiceCardProps {
  nombre: string;
  precio: string;
}

function ServiceCard({ nombre, precio }: ServiceCardProps) {
  return (
    // 'flex justify-between' pone el nombre a la izquierda y el precio a la derecha.
    // 'hover:bg-gray-50' le da un sutil efecto al pasar el mouse por encima.
    <li className="flex justify-between items-center p-4 hover:bg-gray-50 rounded-md transition-colors">
      <p className="text-gray-800">{nombre}</p>
      <span className="font-semibold text-gray-700">{precio}</span>
    </li>
  );
}

export default ServiceCard;