// src/data/mockData.ts

// Asegúrate de que las rutas a tus imágenes locales sean correctas
// Si no tienes imágenes, puedes volver a usar las URLs de placeholder.com
import fotoJuan from '../assets/perfil1.webp';
import fotoAna from '../assets/perfil2.jpeg';
import fotoCarlos from '../assets/perfil3.jpg';

export const mockPrestadores = [
  {
    id: '1',
    nombre: 'Juan Pérez',
    fotoUrl: fotoJuan,
    oficio: 'Gasfitería Profesional',
    resumen: 'Instalaciones y reparaciones de gasfitería. Más de 15 años de experiencia.',
    puntuacion: 4.8,
    // --- CAMPOS ADICIONALES PARA EL PERFIL ---
    descripcion: 'Especialista en detección y reparación de fugas, instalación de grifería y sanitarios. Ofrezco un servicio rápido, eficiente y garantizado.',
    servicios: [
      { id: 's1', nombre: 'Reparación de Fugas', precioEstimado: '$30.000' },
      { id: 's2', nombre: 'Instalación de Sanitarios', precioEstimado: '$50.000' },
    ],
    reseñas: [
      { id: 'r1', autor: 'María T.', puntuacion: 5, comentario: 'Excelente trabajo, muy profesional y rápido. Lo recomiendo.' },
    ],
    totalReseñas: 1,
    estaVerificado: true,
  },
  {
    id: '2',
    nombre: 'Ana Gómez',
    fotoUrl: fotoAna,
    oficio: 'Electricista Certificada',
    resumen: 'Certificación SEC. Instalaciones eléctricas, reparaciones y mantenciones.',
    puntuacion: 5.0,
    // --- CAMPOS ADICIONALES PARA EL PERFIL ---
    descripcion: 'Realizo todo tipo de trabajos eléctricos, desde instalaciones completas hasta reparaciones menores. Priorizo la seguridad y la calidad.',
    servicios: [
      { id: 's3', nombre: 'Instalación de Lámparas', precioEstimado: '$25.000' },
      { id: 's4', nombre: 'Cambio de Enchufes', precioEstimado: '$15.000' },
    ],
    reseñas: [
      { id: 'r2', autor: 'Pedro R.', puntuacion: 5, comentario: 'Muy puntual y resolvió el problema que otros no pudieron. 100% recomendada.' },
    ],
    totalReseñas: 1,
    estaVerificado: true,
  },
  {
    id: '3',
    nombre: 'Carlos Soto',
    fotoUrl: fotoCarlos,
    oficio: 'Carpintería y Mueblería',
    resumen: 'Diseño y fabricación de muebles a medida. Restauración de piezas antiguas y trabajos de carpintería.',
    puntuacion: 4.5,
    // --- CAMPOS ADICIONALES PARA EL PERFIL ---
    descripcion: 'Soy un carpintero con más de 10 años de experiencia en la creación de muebles personalizados. Trabajo con materiales de alta calidad y ofrezco un servicio al cliente excepcional.',
    servicios: [
      { id: 's5', nombre: 'Diseño de Muebles', precioEstimado: '$80.000' },
      { id: 's6', nombre: 'Restauración de Muebles', precioEstimado: '$50.000' },
    ],
    reseñas: [
      { id: 'r3', autor: 'Laura M.', puntuacion: 4, comentario: 'Gran atención al detalle y muy profesional. Estoy muy satisfecha con mi nuevo mueble.' },
    ],
    totalReseñas: 1,
    estaVerificado: true,
  },
  {
    id: '2',
    nombre: 'Ana Gómez',
    fotoUrl: fotoAna,
    oficio: 'Electricista Certificada',
    resumen: 'Certificación SEC. Instalaciones eléctricas, reparaciones y mantenciones.',
    puntuacion: 5.0,
    // --- CAMPOS ADICIONALES PARA EL PERFIL ---
    descripcion: 'Realizo todo tipo de trabajos eléctricos, desde instalaciones completas hasta reparaciones menores. Priorizo la seguridad y la calidad.',
    servicios: [
      { id: 's3', nombre: 'Instalación de Lámparas', precioEstimado: '$25.000' },
      { id: 's4', nombre: 'Cambio de Enchufes', precioEstimado: '$15.000' },
    ],
    reseñas: [
      { id: 'r2', autor: 'Pedro R.', puntuacion: 5, comentario: 'Muy puntual y resolvió el problema que otros no pudieron. 100% recomendada.' },
    ],
    totalReseñas: 1,
    estaVerificado: true,
  },
  {
    id: '2',
    nombre: 'Ana Gómez',
    fotoUrl: fotoAna,
    oficio: 'Electricista Certificada',
    resumen: 'Certificación SEC. Instalaciones eléctricas, reparaciones y mantenciones.',
    puntuacion: 5.0,
    // --- CAMPOS ADICIONALES PARA EL PERFIL ---
    descripcion: 'Realizo todo tipo de trabajos eléctricos, desde instalaciones completas hasta reparaciones menores. Priorizo la seguridad y la calidad.',
    servicios: [
      { id: 's3', nombre: 'Instalación de Lámparas', precioEstimado: '$25.000' },
      { id: 's4', nombre: 'Cambio de Enchufes', precioEstimado: '$15.000' },
    ],
    reseñas: [
      { id: 'r2', autor: 'Pedro R.', puntuacion: 5, comentario: 'Muy puntual y resolvió el problema que otros no pudieron. 100% recomendada.' },
    ],
    totalReseñas: 1,
    estaVerificado: true,
  },
  {
    id: '2',
    nombre: 'Ana Gómez',
    fotoUrl: fotoAna,
    oficio: 'Electricista Certificada',
    resumen: 'Certificación SEC. Instalaciones eléctricas, reparaciones y mantenciones.',
    puntuacion: 5.0,
    // --- CAMPOS ADICIONALES PARA EL PERFIL ---
    descripcion: 'Realizo todo tipo de trabajos eléctricos, desde instalaciones completas hasta reparaciones menores. Priorizo la seguridad y la calidad.',
    servicios: [
      { id: 's3', nombre: 'Instalación de Lámparas', precioEstimado: '$25.000' },
      { id: 's4', nombre: 'Cambio de Enchufes', precioEstimado: '$15.000' },
    ],
    reseñas: [
      { id: 'r2', autor: 'Pedro R.', puntuacion: 5, comentario: 'Muy puntual y resolvió el problema que otros no pudieron. 100% recomendada.' },
    ],
    totalReseñas: 1,
    estaVerificado: true,
  },
  {
    id: '2',
    nombre: 'Ana Gómez',
    fotoUrl: fotoAna,
    oficio: 'Electricista Certificada',
    resumen: 'Certificación SEC. Instalaciones eléctricas, reparaciones y mantenciones.',
    puntuacion: 5.0,
    // --- CAMPOS ADICIONALES PARA EL PERFIL ---
    descripcion: 'Realizo todo tipo de trabajos eléctricos, desde instalaciones completas hasta reparaciones menores. Priorizo la seguridad y la calidad.',
    servicios: [
      { id: 's3', nombre: 'Instalación de Lámparas', precioEstimado: '$25.000' },
      { id: 's4', nombre: 'Cambio de Enchufes', precioEstimado: '$15.000' },
    ],
    reseñas: [
      { id: 'r2', autor: 'Pedro R.', puntuacion: 5, comentario: 'Muy puntual y resolvió el problema que otros no pudieron. 100% recomendada.' },
    ],
    totalReseñas: 1,
    estaVerificado: true,
  },
];