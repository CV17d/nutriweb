export default function Testimonials({ cases = [] }: { cases?: any[] }) {
  const testimonials = cases.length > 0 ? cases.map(c => ({
    quote: `"${c.comment}"`,
    name: c.patient_name,
    role: c.metrics || "PACIENTE",
    initials: c.patient_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase(),
    image_url: c.image_url,
    rating: c.rating ?? 5
  })) : [
    {
      quote:
        '"Bajar mis tiempos de maratón parecía imposible después de estancarme por 2 años. El plan de Andrés no solo me ayudó a perder grasa sin perder músculo, sino que la estrategia de carga de carbohidratos cambió por completo mis últimos 10k en carrera."',
      name: "Carolina V.",
      role: "MARATONISTA AMATEUR",
      initials: "CV",
      rating: 5,
    },
    {
      quote:
        '"La precisión es brutal. Entender cómo sincronizar mis comidas con los WODs me permitió recuperar mucho más rápido y aumentar mis RM. El plan Elite vale cada centavo si realmente te tomas en serio tu deporte."',
      name: "Mateo R.",
      role: "ATLETA CROSSFIT",
      initials: "MR",
      rating: 5,
    },
    {
      quote:
        '"Como chef, aprecio que las recomendaciones de Andrés son reales y comestibles, no solo pollo hervido. Logramos el peso para la competencia sin perder potencia en la bicicleta. Totalmente recomendado."',
      name: "Daniel S.",
      role: "TRIATLETA IRONMAN",
      initials: "DS",
      rating: 5,
    },
  ];

  return (
    <section id="testimonios" className="w-full max-w-7xl mx-auto px-6 py-12 md:py-24">
      {/* Encabezado */}
      <div className="flex flex-col items-center text-center mb-20">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-brand-navy mb-4 tracking-tight">
          Casos de Éxito
        </h2>
        <p className="text-base md:text-lg text-brand-navy/70 max-w-2xl">
          Atletas que han transformado su rendimiento a través de la nutrición científica.
        </p>
      </div>

      {/* Grid de Testimonios */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8">
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className="bg-brand-white rounded-3xl p-8 pt-12 relative shadow-lg border border-gray-100 flex flex-col justify-between mt-8 lg:mt-0"
          >
            {/* Avatar Flotante */}
            <div className="absolute -top-10 left-8 md:left-10 w-20 h-20 rounded-full border-4 border-brand-light bg-gray-300 flex items-center justify-center shadow-md overflow-hidden">
              {(testimonial as any).image_url ? (
                <img src={(testimonial as any).image_url} alt={testimonial.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-bold text-gray-500">{testimonial.initials}</span>
              )}
            </div>

            <div>
              {/* Estrellas */}
              <div className="flex gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className={`w-5 h-5 ${(testimonial as any).rating >= star ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Cita */}
              <p className="text-sm text-brand-navy/80 italic leading-relaxed mb-8">
                {testimonial.quote}
              </p>
            </div>

            {/* Autor */}
            <div className="flex flex-col">
              <span className="font-bold text-brand-navy">{testimonial.name}</span>
              <span className="text-[10px] font-bold text-brand-electric uppercase tracking-widest mt-1">
                {testimonial.role}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
