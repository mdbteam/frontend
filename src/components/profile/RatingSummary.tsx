interface RatingSummaryProps {
  readonly averageRating: number;
  readonly totalReviews: number;
  readonly ratingDistribution: { stars: number; count: number }[];
}

function RatingBar({ stars, count, total }: { readonly stars: number; readonly count: number; readonly total: number }) {
  const percentFilled = total > 0 ? (count / total) * 100 : 0;

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-12 text-slate-400">{stars} estrellas</span>
      <div className="w-full bg-slate-700 rounded-full h-2">
        <div 
          className="bg-yellow-400 h-2 rounded-full" 
          style={{ width: `${percentFilled}%` }}
        ></div>
      </div>
      <span className="w-8 text-right text-slate-300">{count}</span>
    </div>
  );
}

export function RatingSummary({ averageRating, totalReviews, ratingDistribution }: RatingSummaryProps) {
  return (
    <div className="rounded-lg bg-slate-800/50 border border-slate-700 p-6 backdrop-blur-sm">
      <h2 className="mb-4 text-2xl font-bold text-yellow-400 font-poppins">Resumen de Calificaciones</h2>
      <div className="flex items-center mb-4">
        <span className="text-4xl font-bold text-white">{averageRating.toFixed(1)}</span>
        <div className="ml-4">
          <div className="flex text-yellow-400">
            {[...Array(Math.round(averageRating))].map((_, i) => <span key={`full-${i}`}>★</span>)}
            {[...Array(5 - Math.round(averageRating))].map((_, i) => <span key={`empty-${i}`} className="text-slate-600">★</span>)}
          </div>
          <p className="text-sm text-slate-400">Basado en {totalReviews} reseñas</p>
        </div>
      </div>
      
      <div className="space-y-2">
        {ratingDistribution.sort((a, b) => b.stars - a.stars).map(item => (
          <RatingBar 
            key={item.stars}
            stars={item.stars}
            count={item.count}
            total={totalReviews}
          />
        ))}
      </div>
    </div>
  );
}