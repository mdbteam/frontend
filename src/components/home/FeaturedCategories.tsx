// src/components/home/FeaturedCategories.tsx
import React from 'react';

const categories = [
  { name: 'Gasfitería', icon: '🔧', slug: 'gasfiteria' },
  { name: 'Electricidad', icon: '💡', slug: 'electricidad' },
  { name: 'Carpintería', icon: '🪚', slug: 'carpinteria' },
  { name: 'Pintura', icon: '🎨', slug: 'pintura' },
  { name: 'Jardinería', icon: '🌿', slug: 'jardineria' },
  { name: 'Limpieza', icon: '🧼', slug: 'limpieza' },
];

export function FeaturedCategories() {
  return (
    <section className="bg-slate-50 py-8 lg:py-16">
      <div className="mx-auto max-w-screen-xl px-4">
        <h2 className="mb-8 text-center text-3xl font-extrabold text-gray-900">
          Explora por Categoría
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            // CAMBIO: Reemplazamos "#" con una ruta de búsqueda real
            <a
              key={category.name}
              href={`/prestadores?categoria=${category.slug}`}
              className="block rounded-lg border border-gray-200 bg-white p-6 text-center shadow-md transition-transform hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="text-4xl">{category.icon}</div>
              <h3 className="mt-2 font-semibold text-gray-800">{category.name}</h3>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}