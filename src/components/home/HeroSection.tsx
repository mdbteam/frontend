
const HexGridBackground = () => (
  <div className="absolute inset-0 w-full h-full opacity-20" style={{
    backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0) 1px, #0f172a 1px), linear-gradient(90deg, rgba(15, 23, 42, 0) 1px, #0f172a 1px)',
    backgroundSize: '36px 36px',
    maskImage: 'radial-gradient(ellipse 50% 50% at 50% 50%, black 70%, transparent 100%)'
  }}></div>
);

export function HeroSection() {
  return (
    <section className="relative bg-slate-900 overflow-hidden">
      <HexGridBackground />
      <div className="relative mx-auto max-w-screen-xl px-4 py-16 text-center lg:py-24">
        <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight text-white md:text-5xl lg:text-6xl font-poppins" style={{ textShadow: '0 0 15px rgba(234, 179, 8, 0.4)' }}>
          La red donde talentos y necesidades se conectan.
        </h1>
        <p className="mb-8 text-lg font-normal text-slate-300 sm:px-16 lg:px-48">
           Buscamos impulsar el talento con tecnología y comunidad.
           "Conecta, Colabora y Crece"
        </p>
        
      </div>
    </section>
  );
}