
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

        <div className="mx-auto max-w-lg">
          <form className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Buscar por categoría o nombre de agente..."
              required
              className="flex-grow rounded-lg border border-slate-700 bg-slate-800 p-3 text-base text-white focus:border-yellow-400 focus:ring-yellow-400"
            />
            <button
              type="submit"
              className="rounded-lg bg-yellow-400 px-6 py-3 text-base font-bold text-slate-900 hover:bg-yellow-300 focus:outline-none focus:ring-4 focus:ring-yellow-400/50 transition-colors"
            >
              Buscar
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}