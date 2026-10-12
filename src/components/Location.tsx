export default function Location() {
  return (
    <section id="ubicacion" className="w-full max-w-7xl mx-auto px-6 py-12 md:py-24">
      {/* Contenedor Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        
        {/* Columna Izquierda: Detalles */}
        <div className="flex flex-col items-start w-full">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-brand-navy mb-12 tracking-tight">
            Consultorio y Ubicación
          </h2>

          <div className="flex flex-col gap-8 w-full mb-10">
            {/* Bloque Dirección */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-brand-light flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-brand-electric" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <h3 className="text-lg font-bold text-brand-navy mb-1">Dirección del consultorio</h3>
                <a 
                  href="https://maps.app.goo.gl/jhvHicvbBZzniahcA?g_st=ic"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-brand-navy/70 leading-relaxed hover:text-brand-electric transition-colors"
                >
                  Av. de la Prensa y Pedro de Valverde<br />
                  Quito – Ecuador
                </a>
              </div>
            </div>

            {/* Bloque Horarios */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-brand-light flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-brand-electric" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <h3 className="text-lg font-bold text-brand-navy mb-1">Horarios de Atención</h3>
                <p className="text-sm text-brand-navy/70 leading-relaxed">
                  Lunes a Viernes: 08:00 - 17:00<br />
                  Sábados: 09:00 - 15:00 (Previa Cita)
                </p>
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-gray-200 mb-8"></div>

          {/* Bloque Métodos de Pago */}
          <div>
            <h4 className="text-[10px] font-bold text-brand-navy uppercase tracking-widest mb-4">
              Métodos de Pago Aceptados
            </h4>
            <div className="flex gap-4">
              {/* Tarjeta */}
              <div className="w-12 h-12 rounded-full bg-brand-light flex items-center justify-center">
                <svg className="w-5 h-5 text-brand-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              {/* Banco/Transferencia */}
              <div className="w-12 h-12 rounded-full bg-brand-light flex items-center justify-center">
                <svg className="w-5 h-5 text-brand-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                </svg>
              </div>
              {/* Efectivo */}
              <div className="w-12 h-12 rounded-full bg-brand-light flex items-center justify-center">
                <svg className="w-5 h-5 text-brand-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Mapa */}
        <div className="w-full aspect-[4/3] bg-brand-light rounded-3xl overflow-hidden shadow-lg border border-gray-200">
          <iframe 
            src="https://maps.google.com/maps?q=Av.+de+la+Prensa+y+Pedro+de+Valverde,+Quito,+Ecuador&t=&z=16&ie=UTF8&iwloc=&output=embed"
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen={false} 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Ubicación del consultorio"
          ></iframe>
        </div>

      </div>
    </section>
  );
}
