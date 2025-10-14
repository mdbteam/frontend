
import { HeroSection } from '../components/home/HeroSection';
import { FeaturedCategories } from '../components/home/FeaturedCategories';
import { Testimonials } from '../components/home/Testimonials';


function HowItWorksSection() {
  return (
    <section className="bg-slate-900 py-12 lg:py-20 border-t border-slate-800">
      <div className="mx-auto max-w-screen-xl px-4 text-center">
        <h2 className="mb-10 text-3xl font-extrabold text-white font-poppins" style={{ textShadow: '0 0 10px rgba(45, 212, 191, 0.3)' }}>
          ¿Cómo funciona la Red?
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-800 border border-cyan-400/30 text-3xl">
              1
            </div>
            <h3 className="mb-2 text-xl font-bold text-cyan-400 font-poppins">Busca</h3>
            <p className="text-slate-400">
              Usa nuestra terminal de búsqueda para encontrar agentes por especialidad.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-800 border border-cyan-400/30 text-3xl">
              2
            </div>
            <h3 className="mb-2 text-xl font-bold text-cyan-400 font-poppins">Compara</h3>
            <p className="text-slate-400">
              Revisa perfiles, portafolios y calificaciones de distintos agentes en la red.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-800 border border-cyan-400/30 text-3xl">
              3
            </div>
            <h3 className="mb-2 text-xl font-bold text-cyan-400 font-poppins">Contacta</h3>
            <p className="text-slate-400">
              Inicia comunicación directa con el agente que mejor se adapte a tu misión.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedCategories />
      <HowItWorksSection />
      <Testimonials />
    </>
  );
}

export default HomePage;