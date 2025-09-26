// tailwind.config.cjs

// SOLUCIÓN: Añade esta línea al principio para importar 'defaultTheme'.
const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    // No incluyas la siguiente línea si decidimos no usar flowbite-react
    // "./node_modules/flowbite-react/lib/esm/**/*.js", 
  ],
  theme: {
    extend: {
      fontFamily: {
        // Ahora 'defaultTheme' está definido y se puede usar aquí
        sans: ['Lato', ...defaultTheme.fontFamily.sans],
        poppins: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [
    // No incluyas la siguiente línea si decidimos no usar flowbite-react
    // require('flowbite/plugin'),
  ],
}