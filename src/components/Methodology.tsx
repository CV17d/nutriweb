export default function Methodology({ data }: { data?: any }) {
  const title = data?.title || 'Metodología en 5 Pasos';

  return (
    <section id="metodologia" className="w-full max-w-7xl mx-auto px-6 py-12 md:py-24">
      {/* Encabezado */}
      <div className="flex flex-col items-center text-center mb-16">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-brand-navy mb-4 tracking-tight">
          {title}
        </h2>
        <p className="text-base md:text-lg text-brand-navy/70 max-w-2xl">
          Un proceso sistemático y basado en datos diseñado para garantizar resultados consistentes.
        </p>
      </div>

      {/* Grid de Tarjetas */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">

        {/* Tarjeta 01 */}
        <div className="group bg-brand-white rounded-2xl p-6 md:p-8 flex flex-col items-start border border-gray-100 shadow-sm relative hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
          <div className="w-14 h-14 rounded-2xl bg-brand-electric/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand-electric/20 transition-all duration-300">
            <svg className="w-7 h-7 text-brand-electric" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
              <path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z"/>
              <path d="m9 14 2 2 4-4"/>
            </svg>
          </div>
          <h3 className="text-xl font-bold text-brand-navy mb-3">Evaluación</h3>
          <p className="text-sm text-brand-navy/70 leading-relaxed">
            Análisis profundo de tu composición corporal, historial clínico, hábitos, entrenamiento y metas.
          </p>
        </div>

        {/* Tarjeta 02 */}
        <div className="group bg-brand-white rounded-2xl p-6 md:p-8 flex flex-col items-start border border-gray-100 shadow-sm relative hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
          <div className="w-14 h-14 rounded-2xl bg-brand-electric/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand-electric/20 transition-all duration-300">
            <svg className="w-7 h-7 text-brand-electric" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="6"/>
              <circle cx="12" cy="12" r="2"/>
            </svg>
          </div>
          <h3 className="text-xl font-bold text-brand-navy mb-3">Diagnóstico</h3>
          <p className="text-sm text-brand-navy/70 leading-relaxed">
            Identificación de oportunidades de mejora y establecimiento de prioridades nutricionales claras.
          </p>
        </div>

        {/* Tarjeta 03 (Destacada) */}
        <div className="group bg-brand-navy rounded-2xl p-6 md:p-8 flex flex-col items-start shadow-xl relative hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 lg:-mt-4 lg:mb-4 lg:scale-105 hover:lg:scale-[1.08]">
          <div className="w-14 h-14 rounded-2xl bg-brand-white/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand-white/20 transition-all duration-300">
            <svg className="w-7 h-7 text-brand-electric" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4"/>
              <path d="M2 6h4"/>
              <path d="M2 10h4"/>
              <path d="M2 14h4"/>
              <path d="M2 18h4"/>
              <path d="M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"/>
            </svg>
          </div>
          <h3 className="text-xl font-bold text-brand-white mb-3">Plan<br />Personalizado</h3>
          <p className="text-sm text-gray-300 leading-relaxed">
            Diseño de una estrategia nutricional única y 100% adaptada a tu estilo de vida y deporte.
          </p>
        </div>

        {/* Tarjeta 04 */}
        <div className="group bg-brand-white rounded-2xl p-6 md:p-8 flex flex-col items-start border border-gray-100 shadow-sm relative hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
          <div className="w-14 h-14 rounded-2xl bg-brand-electric/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand-electric/20 transition-all duration-300">
            <svg className="w-7 h-7 text-brand-electric" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M3 3v18h18"/>
              <path d="m19 9-5 5-4-4-3 3"/>
            </svg>
          </div>
          <h3 className="text-xl font-bold text-brand-navy mb-3">Seguimiento</h3>
          <p className="text-sm text-brand-navy/70 leading-relaxed">
            Ajustes periódicos basados en tus avances, métricas y sensaciones para asegurar tu progreso.
          </p>
        </div>

        {/* Tarjeta 05 */}
        <div className="group bg-brand-white rounded-2xl p-6 md:p-8 flex flex-col items-start border border-gray-100 shadow-sm relative hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
          <div className="w-14 h-14 rounded-2xl bg-brand-electric/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand-electric/20 transition-all duration-300">
            <svg className="w-7 h-7 text-brand-electric" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          </div>
          <h3 className="text-xl font-bold text-brand-navy mb-3">Educación</h3>
          <p className="text-sm text-brand-navy/70 leading-relaxed">
            Te enseño a manejar tus hábitos y alimentarte como un deportista profesional para que desarrolles total autonomía.
          </p>
        </div>

      </div>
    </section>
  );
}
