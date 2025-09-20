// postcss.config.cjs
module.exports = {
  plugins: {
    tailwindcss: {}, // <-- La v3 usa 'tailwindcss' directamente, no '@tailwindcss/postcss'
    autoprefixer: {},
  },
}