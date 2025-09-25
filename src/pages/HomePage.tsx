// src/pages/HomePage.tsx

import React from 'react';

// 1. Importamos los componentes que forman parte de la página de inicio.
import { HeroSection } from '../components/home/HeroSection';
import { FeaturedCategories } from '../components/home/FeaturedCategories';

// Componente opcional para la sección "Cómo Funciona" que puedes añadir en el futuro.
function HowItWorksSection() {
  return (
    <section className="bg-white py-8 lg:py-16">
      <div className="mx-auto max-w-screen-xl px-4 text-center">
        <h2 className="mb-8 text-3xl font-extrabold text-gray-900">
          ¿Cómo funciona?
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-cyan-100 text-3xl">
              1️⃣
            </div>
            <h3 className="mb-2 text-xl font-bold">Busca</h3>
            <p className="text-gray-500">
              Usa nuestra barra de búsqueda o explora las categorías para encontrar lo que necesitas.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-cyan-100 text-3xl">
              2️⃣
            </div>
            <h3 className="mb-2 text-xl font-bold">Compara</h3>
            <p className="text-gray-500">
              Revisa perfiles, servicios y calificaciones de distintos profesionales.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-cyan-100 text-3xl">
              3️⃣
            </div>
            <h3 className="mb-2 text-xl font-bold">Contacta</h3>
            <p className="text-gray-500">
              Ponte en contacto directamente con el prestador que más te convenga.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}


function HomePage() {
  return (
    // Usamos un fragmento <> para agrupar las secciones sin añadir un div innecesario
    <>
      {/* 2. Unimos los componentes en el orden en que deben aparecer. */}
      <HeroSection />
      <FeaturedCategories />
      <HowItWorksSection />
    </>
  );
}

export default HomePage;