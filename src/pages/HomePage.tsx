// --- ¡CORRECCIÓN! ---
// Importando los componentes que SÍ existen en tu proyecto
import { HeroSection } from '../components/home/HeroSection';
import { FeaturedCategories } from '../components/home/FeaturedCategories';
import { HowItWorksSection } from '../components/home/HowItWorksSection';
// Usamos 'Testimonials' (de Testimonials.tsx) en lugar de 'TestimonialsSection'
import { Testimonials } from '../components/home/Testimonials'; 

export default function HomePage() {
  return (
    // He quitado el padding (p-4 sm:p-8) porque tu HeroSection probablemente ya lo maneja
    <div className="space-y-16 sm:space-y-24">
      
      {/* --- Sección 1: Hero (Tu componente) --- */}
      <HeroSection />

      {/* --- Sección 2: Servicios Populares (Tu componente) --- */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-white text-center mb-8">
          Explora por Categoría
        </h2>
        <FeaturedCategories />
      </section>

      {/* --- Sección 3: Cómo Funciona (Tu componente) --- */}
      <HowItWorksSection />
      
      {/* --- Sección 4: Testimonios (Tu componente) --- */}
      <Testimonials />

    </div>
  );
}