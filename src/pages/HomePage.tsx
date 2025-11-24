// --- ¡CORRECCIÓN! ---
// Importando los componentes que SÍ existen en tu proyecto
import { HeroSection } from '../components/home/HeroSection';
import { FeaturedCategories } from '../components/home/FeaturedCategories';
import { HowItWorksSection } from '../components/home/HowItWorksSection';
import { Testimonials } from '../components/home/Testimonials'; 

export default function HomePage() {
  return (
    <div className="space-y-16 sm:space-y-24">
      
      <HeroSection />

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-white text-center mb-8">
          Explora por Categoría
        </h2>
        <FeaturedCategories />
      </section>

      <HowItWorksSection />
      
      <Testimonials />

    </div>
  );
}