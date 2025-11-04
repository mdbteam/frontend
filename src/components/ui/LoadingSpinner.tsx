//import * as React from 'react';

const Hexagon = ({ delay }: { delay: string }) => (
  <svg
    className="w-10 h-10 text-amber-400 animate-pulse-hexagon"
    style={{ animationDelay: delay }}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 2L2 7L2 17L12 22L22 17L22 7L12 2Z" />
  </svg>
);

export function LoadingSpinner() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm">
      <div className="grid grid-cols-3 gap-1">
        <Hexagon delay="0.1s" />
        <Hexagon delay="0.2s" />
        <Hexagon delay="0.3s" />
        <Hexagon delay="0.8s" />
        <Hexagon delay="0.9s" />
        <Hexagon delay="0.4s" />
        <Hexagon delay="0.7s" />
        <Hexagon delay="0.6s" />
        <Hexagon delay="0.5s" />
      </div>
    </div>
  );
}
