// src/components/profile/PortfolioItem.tsx
interface PortfolioItemProps {
  imageUrl: string;
  title: string;
  description?: string; // Descripción opcional
}

function PortfolioItem({ imageUrl, title, description }: PortfolioItemProps) {
  return (
    <div className="group relative overflow-hidden rounded-lg shadow-lg">
      <img 
        src={imageUrl} 
        alt={title} 
        className="h-60 w-full object-cover transition-transform duration-350 group-hover:scale-110" 
      />
      {/* Un overlay oscuro que aparece al pasar el mouse */}
      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
        <h3 className="text-white font-bold text-lg">{title}</h3>
        {description && <p className="text-gray-200 text-sm">{description}</p>}
      </div>
    </div>
  );
}

export default PortfolioItem;