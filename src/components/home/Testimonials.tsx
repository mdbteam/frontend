const testimonials = [
    {
        quote: "¡Servicio increíble! Encontré un gasfíter en minutos y el trabajo fue impecable. Totalmente recomendado.",
        author: "Sofía Vergara",
        role: "Cliente en Santiago",
        avatar: "https://flowbite.com/docs/images/people/profile-picture-1.jpg",
        rating: 5,
    },
    {
        quote: "La plataforma es muy fácil de usar. Pude comparar varios electricistas y elegir el que más me convenía.",
        author: "Martín Cárcamo",
        role: "Cliente en Valparaíso",
        avatar: "https://flowbite.com/docs/images/people/profile-picture-3.jpg",
        rating: 5,
    },
    {
        quote: "Por fin una solución moderna para encontrar profesionales de confianza. Me ahorró mucho tiempo y estrés.",
        author: "Carla Jara",
        role: "Cliente en Concepción",
        avatar: "https://flowbite.com/docs/images/people/profile-picture-2.jpg",
        rating: 4,
    }
];

function StarRating({ rating }: { readonly rating: number }) {
    return (
        <div className="flex justify-center mb-4">
            {[...Array(5)].map((_, i) => (
                <svg
                    key={i}
                    className={`w-5 h-5 ${i < rating ? 'text-yellow-300' : 'text-gray-300'}`}
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 22 20"
                >
                    <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                </svg>
            ))}
        </div>
    );
}

export function Testimonials() {
    return (
        <section className="bg-white py-8 lg:py-16">
            <div className="mx-auto max-w-screen-xl px-4">
                <h2 className="mb-8 text-center text-3xl font-extrabold text-gray-900">
                    Lo que dicen nuestros clientes
                </h2>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    {testimonials.map((testimonial) => (
                        <div key={testimonial.author} className="text-center text-black p-6 bg-white rounded-lg border border-gray-200 shadow-md">
                            <StarRating rating={testimonial.rating} />
                            <blockquote className="my-4 text-gray-500 italic">
                                "{testimonial.quote}"
                            </blockquote>
                            <div className="flex items-center justify-center space-x-3">
                                <img className="w-9 h-9 rounded-full" src={testimonial.avatar} alt={`${testimonial.author} avatar`} />
                                <div className="space-y-0.5 text-left font-medium">
                                    <div>{testimonial.author}</div>
                                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}