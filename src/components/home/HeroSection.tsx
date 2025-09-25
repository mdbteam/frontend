// src/components/home/HeroSection.tsx
import { Button, TextInput } from 'flowbite-react';
import React from 'react';

export function HeroSection() {
  return (
    <section className="bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-screen-xl px-4 py-8 text-center lg:py-16">
        <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 dark:text-white md:text-5xl lg:text-6xl">
          Encuentra al profesional que necesitas, fácil y rápido.
        </h1>
        <p className="mb-8 text-lg font-normal text-gray-500 dark:text-gray-400 sm:px-16 lg:px-48">
          Desde reparaciones urgentes hasta proyectos planificados, conecta con los mejores expertos de tu zona.
        </p>
        <div className="mx-auto max-w-md">
          <form className="flex items-center gap-2">
            <TextInput
              id="search"
              placeholder="Ej: Gasfíter, electricista, carpintero..."
              required
              className="flex-grow"
            />
            <Button type="submit">Buscar</Button>
          </form>
        </div>
      </div>
    </section>
  );
}