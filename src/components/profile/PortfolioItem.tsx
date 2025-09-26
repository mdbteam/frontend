// src/components/profile/PortfolioItem.tsx

interface PortfolioItemProps {
  readonly imageUrl: string;
  readonly title: string;
  readonly description?: string; 
  readonly linkUrl?: string;     
}

function PortfolioItem({ imageUrl, title, description, linkUrl }: PortfolioItemProps) {
  const content = (
    <div className="group relative block h-full w-full overflow-hidden rounded-lg shadow-lg">
      <img 
        src={imageUrl} 
        alt={title} 
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" 
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />

      <div className="absolute inset-0 flex flex-col justify-end p-4">
        <h3 className="font-bold text-white text-lg">{title}</h3>

        <div className="overflow-hidden transition-all duration-300 max-h-0 group-hover:max-h-40">
          {description && <p className="mt-1 text-gray-200 text-sm">{description}</p>}
        </div>
      </div>
    </div>
  );

  if (linkUrl) {
    return (
      <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="block">
        {content}
      </a>
    );
  }


  return content;
}

export default PortfolioItem;