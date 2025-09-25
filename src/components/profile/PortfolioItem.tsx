// src/components/profile/PortfolioItem.tsx

interface PortfolioItemProps {
  readonly imageUrl: string;
  readonly title: string;
  readonly description?: string; // Descripción opcional
  readonly linkUrl?: string;     // URL opcional para que el item sea clickeable
}

function PortfolioItem({ imageUrl, title, description, linkUrl }: PortfolioItemProps) {
  const content = (
    // 'group' nos permite controlar efectos en los hijos cuando se hace hover en el padre
    <div className="group relative block h-full w-full overflow-hidden rounded-lg shadow-lg">
      <img 
        src={imageUrl} 
        alt={title} 
        // El zoom en la imagen se mantiene, es un gran efecto
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" 
      />
      
      {/* CAMBIO 1: Gradiente permanente en la parte inferior. */}
      {/* Esto asegura que el título siempre sea legible, incluso en móviles. */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />

      {/* CAMBIO 2: El contenido de texto ahora tiene un contenedor permanente. */}
      <div className="absolute inset-0 flex flex-col justify-end p-4">
        <h3 className="font-bold text-white text-lg">{title}</h3>
        
        {/* La descripción ahora aparece desde abajo al hacer hover, un efecto más sutil. */}
        <div className="overflow-hidden transition-all duration-300 max-h-0 group-hover:max-h-40">
          {description && <p className="mt-1 text-gray-200 text-sm">{description}</p>}
        </div>
      </div>
    </div>
  );

  // Si se proporciona una URL, envolvemos t0do el componente en una etiqueta 'a'
  if (linkUrl) {
    return (
      <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="block">
        {content}
      </a>
    );
  }

  // Si no hay URL, se renderiza solo el div
  return content;
}

export default PortfolioItem;