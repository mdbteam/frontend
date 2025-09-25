// tailwind.config.cjs

/** @type {import('tailwindcss').Config} */
module.exports = {
  // Esta sección es la más importante.
  // Le dice a Tailwind qué archivos debe escanear.
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    // SOLUCIÓN: Esta línea asegura que Tailwind vea los componentes de Flowbite.
    "./node_modules/flowbite-react/lib/esm/**/*.js",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    // Este plugin también es necesario para que Flowbite funcione.
    require('flowbite/plugin'),
  ],
}