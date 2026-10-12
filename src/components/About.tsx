export default function About({ data }: { data?: any }) {
  const title = data?.title || '<span class="text-brand-electric">Nutricionista Deportivo</span>, <br class="hidden md:block" />Entrenador y Chef Profesional';
  const content = data?.content || 'Soy Andrés Burbano. Mi objetivo no es únicamente ayudarte a mejorar tu alimentación...';
  const imageUrl = data?.imageUrl || null;

  return (
    <section id="sobre-mi" className="w-full max-w-7xl mx-auto px-6 py-12 md:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Columna Izquierda: Imagen */}
        <div className="relative w-full aspect-[4/5] lg:aspect-[3/4] bg-gray-300 rounded-[2rem] overflow-hidden flex items-center justify-center shadow-lg">
          {imageUrl ? (
            <img src={imageUrl} alt="Sobre Mí" className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-500 font-medium">Placeholder Imagen (Entrenamiento)</span>
          )}
          
          {/* Overlay de texto inferior */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-navy/90 to-transparent p-8 pt-20">
            <p className="text-xl md:text-2xl font-bold text-brand-white leading-tight">
              "La nutrición no es restricción, es estrategia."
            </p>
          </div>
        </div>

        {/* Columna Derecha: Textos y Grid de Habilidades */}
        <div className="flex flex-col items-start gap-6">
          {/* Badge superior */}
          <div className="border border-brand-electric/20 bg-brand-electric/5 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider text-brand-electric uppercase">
            Perfil Profesional
          </div>

          {/* Título Principal */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-brand-navy leading-tight tracking-tight" dangerouslySetInnerHTML={{ __html: title }}>
          </h2>

          {/* Párrafo */}
          <div className="text-base md:text-lg text-brand-navy/70 leading-relaxed mb-4 space-y-4 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: content }}>
          </div>

          {/* Grid de Tarjetas (Habilidades) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mt-4">
            
            {/* Tarjeta 1 */}
            <div className="group bg-brand-white hover:bg-brand-navy border border-gray-100 hover:border-brand-navy shadow-sm rounded-2xl p-4 flex items-center gap-4 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-brand-electric/10 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-brand-electric/20 transition-all duration-300">
                <svg className="w-6 h-6 text-brand-electric" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <circle cx="12" cy="8" r="6" />
                  <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 group-hover:text-brand-white/70 font-bold uppercase tracking-widest mb-0.5 transition-colors duration-300">Certificación</span>
                <span className="text-sm font-bold text-brand-navy group-hover:text-brand-white leading-tight transition-colors duration-300">Antropometría ISAK 2</span>
              </div>
            </div>

            {/* Tarjeta 2 */}
            <div className="group bg-brand-white hover:bg-brand-navy border border-gray-100 hover:border-brand-navy shadow-sm rounded-2xl p-4 flex items-center gap-4 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-brand-electric/10 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-brand-electric/20 transition-all duration-300">
                <svg className="w-6 h-6 text-brand-electric" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 group-hover:text-brand-white/70 font-bold uppercase tracking-widest mb-0.5 transition-colors duration-300">Nutrición Deportiva</span>
                <span className="text-sm font-bold text-brand-navy group-hover:text-brand-white leading-tight transition-colors duration-300">Especialista en Fútbol y Triatlón</span>
              </div>
            </div>

            {/* Tarjeta 3 */}
            <div className="sm:col-span-2 group bg-brand-white hover:bg-brand-navy border border-gray-100 hover:border-brand-navy shadow-sm rounded-2xl p-4 flex items-center gap-4 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-brand-electric/10 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-brand-electric/20 transition-all duration-300">
                <svg className="w-6 h-6 text-brand-electric" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M17 21a1 1 0 0 0 1-1v-5.35c0-.457.316-.844.727-1.041a4 4 0 0 0-2.134-7.589c-.26 0-.52.027-.776.082a5 5 0 0 0-9.634 0c-.256-.055-.516-.082-.776-.082a4 4 0 0 0-2.134 7.589c.411.197.727.584.727 1.041V20a1 1 0 0 0 1 1Z" />
                  <path d="M6 17h12" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 group-hover:text-brand-white/70 font-bold uppercase tracking-widest mb-0.5 transition-colors duration-300">Estrategia Culinaria</span>
                <span className="text-sm font-bold text-brand-navy group-hover:text-brand-white leading-tight transition-colors duration-300">Diseñador de Menús de Alto Rendimiento</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
