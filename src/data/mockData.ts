
import fotoJuan from '../assets/perfil1.webp';
import fotoAna from '../assets/perfil2.jpeg';
import fotoCarlos from '../assets/perfil3.jpg';

export const mockPrestadores = [
  {
    id: '1',
    nombre: 'Juan Pérez',
    fotoUrl: fotoJuan, 
    oficio: 'Gasfitería Profesional',
    resumen: 'Instalaciones y reparaciones de gasfitería. Trabajos garantizados.',
    puntuacion: 4.8,
    descripcion: 'Especialista en detección y reparación de fugas, instalación de grifería y sanitarios. Ofrezco un servicio rápido, eficiente y con más de 15 años de experiencia en el rubro.',
    servicios: [
      { id: 's1', nombre: 'Reparación de Fugas de Agua', precioEstimado: '$35.000' },
      { id: 's2', nombre: 'Instalación de Calefont', precioEstimado: '$50.000' },
      { id: 's3', nombre: 'Destape de Cañerías', precioEstimado: '$40.000' },
    ],
    reseñas: [
      { id: 'r1', autor: 'María T.', puntuacion: 5, comentario: 'Excelente trabajo, muy profesional y rápido. Resolvió el problema de inmediato. Lo recomiendo totalmente.' },
      { id: 'r2', autor: 'Carlos S.', puntuacion: 4, comentario: 'Buen servicio, aunque tardó un poco en llegar. El trabajo quedó bien hecho.' },
    ],
    totalReseñas: 82,
    estaVerificado: true,
    ratingDistribution: [85, 10, 3, 2, 0],
  },
  {
    id: '2',
    nombre: 'Ana Gómez',
    fotoUrl: fotoAna, 
    oficio: 'Electricista Certificada',
    resumen: 'Certificación SEC. Instalaciones eléctricas, reparaciones y mantenciones.',
    puntuacion: 5.0,
    descripcion: 'Realizo todo tipo de trabajos eléctricos, desde instalaciones completas en obras nuevas hasta reparaciones menores en el hogar. Priorizo siempre la seguridad y la calidad del servicio.',
    servicios: [
      { id: 's4', nombre: 'Instalación de Lámparas y Enchufes', precioEstimado: '$25.000' },
      { id: 's5', nombre: 'Revisión y Normalización de Tableros', precioEstimado: '$60.000' },
    ],
    reseñas: [
      { id: 'r3', autor: 'Pedro R.', puntuacion: 5, comentario: 'Muy puntual y resolvió el problema que otros no pudieron. 100% recomendada.' },
      { id: 'r4', autor: 'Javiera L.', puntuacion: 5, comentario: 'Impecable. Muy profesional y clara para explicar el trabajo realizado.' },
    ],
    totalReseñas: 120,
    estaVerificado: true,
    ratingDistribution: [98, 2, 0, 0, 0],
  },
  {
    id: '3',
    nombre: 'Carlos Soto',
    fotoUrl: fotoCarlos,
    oficio: 'Carpintería y Mueblería',
    resumen: 'Diseño y fabricación de muebles a medida. Restauración y trabajos finos.',
    puntuacion: 4.5,
    descripcion: 'Apasionado por la madera, realizo trabajos de carpintería a medida, desde muebles de cocina hasta libreros y estanterías. Calidad y finas terminaciones.',
    servicios: [
      { id: 's6', nombre: 'Fabricación de Mueble de Cocina', precioEstimado: '$350.000' },
      { id: 's7', nombre: 'Instalación de Piso Flotante', precioEstimado: '$15.000 por m²' },
    ],
    reseñas: [
      { id: 'r5', autor: 'Fernanda M.', puntuacion: 5, comentario: 'Los muebles quedaron preciosos, justo como los imaginé. Muy detallista.' },
    ],
    totalReseñas: 45,
    estaVerificado: false,
    ratingDistribution: [60, 35, 5, 0, 0],
  },
  {
    id: '1',
    nombre: 'Juan Pérez',
    fotoUrl: fotoJuan, 
    oficio: 'Gasfitería Profesional',
    resumen: 'Instalaciones y reparaciones de gasfitería. Trabajos garantizados.',
    puntuacion: 4.8,
    descripcion: 'Especialista en detección y reparación de fugas, instalación de grifería y sanitarios. Ofrezco un servicio rápido, eficiente y con más de 15 años de experiencia en el rubro.',
    servicios: [
      { id: 's1', nombre: 'Reparación de Fugas de Agua', precioEstimado: '$35.000' },
      { id: 's2', nombre: 'Instalación de Calefont', precioEstimado: '$50.000' },
      { id: 's3', nombre: 'Destape de Cañerías', precioEstimado: '$40.000' },
    ],
    reseñas: [
      { id: 'r1', autor: 'María T.', puntuacion: 5, comentario: 'Excelente trabajo, muy profesional y rápido. Resolvió el problema de inmediato. Lo recomiendo totalmente.' },
      { id: 'r2', autor: 'Carlos S.', puntuacion: 4, comentario: 'Buen servicio, aunque tardó un poco en llegar. El trabajo quedó bien hecho.' },
    ],
    totalReseñas: 82,
    estaVerificado: true,
    ratingDistribution: [85, 10, 3, 2, 0], 
  },
  {
    id: '2',
    nombre: 'Ana Gómez',
    fotoUrl: fotoAna, 
    oficio: 'Electricista Certificada',
    resumen: 'Certificación SEC. Instalaciones eléctricas, reparaciones y mantenciones.',
    puntuacion: 5.0,
    descripcion: 'Realizo todo tipo de trabajos eléctricos, desde instalaciones completas en obras nuevas hasta reparaciones menores en el hogar. Priorizo siempre la seguridad y la calidad del servicio.',
    servicios: [
      { id: 's4', nombre: 'Instalación de Lámparas y Enchufes', precioEstimado: '$25.000' },
      { id: 's5', nombre: 'Revisión y Normalización de Tableros', precioEstimado: '$60.000' },
    ],
    reseñas: [
      { id: 'r3', autor: 'Pedro R.', puntuacion: 5, comentario: 'Muy puntual y resolvió el problema que otros no pudieron. 100% recomendada.' },
      { id: 'r4', autor: 'Javiera L.', puntuacion: 5, comentario: 'Impecable. Muy profesional y clara para explicar el trabajo realizado.' },
    ],
    totalReseñas: 120,
    estaVerificado: true,
    ratingDistribution: [98, 2, 0, 0, 0],
  },
  {
    id: '3',
    nombre: 'Carlos Soto',
    fotoUrl: fotoCarlos, 
    oficio: 'Carpintería y Mueblería',
    resumen: 'Diseño y fabricación de muebles a medida. Restauración y trabajos finos.',
    puntuacion: 4.5,
    descripcion: 'Apasionado por la madera, realizo trabajos de carpintería a medida, desde muebles de cocina hasta libreros y estanterías. Calidad y finas terminaciones.',
    servicios: [
      { id: 's6', nombre: 'Fabricación de Mueble de Cocina', precioEstimado: '$350.000' },
      { id: 's7', nombre: 'Instalación de Piso Flotante', precioEstimado: '$15.000 por m²' },
    ],
    reseñas: [
      { id: 'r5', autor: 'Fernanda M.', puntuacion: 5, comentario: 'Los muebles quedaron preciosos, justo como los imaginé. Muy detallista.' },
    ],
    totalReseñas: 45,
    estaVerificado: false,
    ratingDistribution: [60, 35, 5, 0, 0],
  },
];