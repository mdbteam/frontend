
import { Rating, RatingAdvanced, RatingStar } from "flowbite-react";
import React from 'react';

interface RatingSummaryProps {
  readonly averageRating: number;
  readonly totalReviews: number;

  readonly ratingDistribution: number[]; 
}

export function RatingSummary({ averageRating, totalReviews, ratingDistribution }: RatingSummaryProps) {
  const fullStars = Math.round(averageRating);

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-4 text-2xl font-bold text-gray-800">Calificaciones de Clientes</h2>

      <Rating className="mb-2">
        {[...Array(fullStars)].map((_, i) => <RatingStar key={`full-${i}`} />)}
        {[...Array(5 - fullStars)].map((_, i) => <RatingStar key={`empty-${i}`} filled={false} />)}
        <p className="ml-2 text-sm font-medium text-gray-500">
          {averageRating.toFixed(1)} de 5 estrellas
        </p>
      </Rating>

      <p className="mb-4 text-sm font-medium text-gray-500">
        {totalReviews} calificaciones totales
      </p>

      {ratingDistribution.map((percent, index) => (
        <RatingAdvanced key={index} percentFilled={percent} className="mb-2">
          <span className="w-12">{5 - index} estrellas</span>
        </RatingAdvanced>
      ))}
    </div>
  );
}

export default RatingSummary;