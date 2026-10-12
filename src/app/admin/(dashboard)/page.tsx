export default function AdminDashboard() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface font-bold md:hidden mb-4">
        Resumen General
      </h1>
      
      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* KPI 1 */}
        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 flex flex-col hover:border-brand-electric/50 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-primary-container/10 rounded-lg text-brand-electric">
              <span className="material-symbols-outlined">group_add</span>
            </div>
            <span className="text-secondary font-label-sm text-label-sm px-2 py-1 bg-surface-container rounded-full">+12% vs mes ant.</span>
          </div>
          <h3 className="text-on-surface-variant font-body-md text-body-md mb-1">Total Leads</h3>
          <p className="font-headline-xl text-headline-xl text-on-surface">342</p>
        </div>
        
        {/* KPI 2 */}
        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 flex flex-col hover:border-brand-electric/50 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-secondary-container/30 rounded-lg text-secondary">
              <span className="material-symbols-outlined">verified_user</span>
            </div>
            <span className="text-secondary font-label-sm text-label-sm px-2 py-1 bg-surface-container rounded-full">+5% vs mes ant.</span>
          </div>
          <h3 className="text-on-surface-variant font-body-md text-body-md mb-1">Suscripciones Activas</h3>
          <p className="font-headline-xl text-headline-xl text-on-surface">128</p>
        </div>
        
        {/* KPI 3 */}
        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 flex flex-col hover:border-brand-electric/50 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-tertiary-container/10 rounded-lg text-tertiary">
              <span className="material-symbols-outlined">calendar_month</span>
            </div>
          </div>
          <h3 className="text-on-surface-variant font-body-md text-body-md mb-1">Citas Semanales</h3>
          <p className="font-headline-xl text-headline-xl text-on-surface">24</p>
        </div>
        
        {/* KPI 4 */}
        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 flex flex-col hover:border-brand-electric/50 transition-colors relative overflow-hidden">
          <div className="absolute inset-0 bg-brand-navy opacity-5"></div>
          <div className="relative z-10 flex justify-between items-start mb-4">
            <div className="p-3 bg-brand-electric rounded-lg text-on-primary">
              <span className="material-symbols-outlined">payments</span>
            </div>
            <span className="text-secondary font-label-sm text-label-sm px-2 py-1 bg-surface-container rounded-full">+18%</span>
          </div>
          <h3 className="relative z-10 text-on-surface-variant font-body-md text-body-md mb-1">Ingresos Totales (Mes)</h3>
          <p className="relative z-10 font-headline-xl text-headline-xl text-on-surface text-brand-electric">$8.5K</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leads Table Section (Takes up 2/3 on desktop) */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl border border-outline-variant/30 flex flex-col overflow-hidden">
          <div className="px-6 py-5 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low">
            <h2 className="font-headline-md text-headline-md text-on-surface">Leads Recientes</h2>
            <button className="text-brand-electric font-label-sm text-label-sm hover:underline flex items-center gap-1">
              Ver Todos <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/30 bg-surface-container-lowest">
                  <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Plan de Interés</th>
                  <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {/* Lead 1 */}
                <tr className="hover:bg-surface-container-low/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-container/20 text-brand-electric flex items-center justify-center font-bold text-sm">CM</div>
                      <span className="font-medium text-on-surface">Carlos Mendoza</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant text-sm">Hoy, 10:30 AM</td>
                  <td className="px-6 py-4 text-on-surface-variant">Plan Elite Atleta</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-error-container text-on-error-container uppercase tracking-wide">
                      Pendiente
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors" title="Abrir WhatsApp">
                      <span className="material-symbols-outlined text-[18px]">chat</span>
                    </button>
                  </td>
                </tr>
                {/* Lead 2 */}
                <tr className="hover:bg-surface-container-low/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-container/20 text-brand-electric flex items-center justify-center font-bold text-sm">LR</div>
                      <span className="font-medium text-on-surface">Laura Ramírez</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant text-sm">Ayer, 16:45</td>
                  <td className="px-6 py-4 text-on-surface-variant">Transformación 12S</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-tertiary-container/20 text-tertiary uppercase tracking-wide">
                      Contactado
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors" title="Abrir WhatsApp">
                      <span className="material-symbols-outlined text-[18px]">chat</span>
                    </button>
                  </td>
                </tr>
                {/* Lead 3 */}
                <tr className="hover:bg-surface-container-low/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-container/20 text-brand-electric flex items-center justify-center font-bold text-sm">JV</div>
                      <span className="font-medium text-on-surface">Javier Vargas</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant text-sm">05 Oct, 09:15 AM</td>
                  <td className="px-6 py-4 text-on-surface-variant">Consulta Única</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-container/20 text-brand-electric uppercase tracking-wide">
                      Convertido
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors" title="Abrir WhatsApp">
                      <span className="material-symbols-outlined text-[18px]">chat</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions / Mini Calendar Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Upcoming Appointments Widget */}
          <div className="bg-brand-navy rounded-xl p-6 text-on-primary">
            <h3 className="font-headline-md text-headline-md mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-brand-electric">schedule</span>
              Próximas Citas
            </h3>
            <div className="space-y-4">
              <div className="bg-surface-container-lowest/10 rounded-lg p-4 border border-outline-variant/10 backdrop-blur-sm">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold">14:00 - 15:00</span>
                  <span className="px-2 py-0.5 bg-brand-electric text-white text-xs rounded-full font-bold">Zoom</span>
                </div>
                <p className="text-on-primary/80 text-sm">Evaluación Inicial - Carlos M.</p>
              </div>
              <div className="bg-surface-container-lowest/5 rounded-lg p-4 border border-outline-variant/5">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold">16:30 - 17:15</span>
                  <span className="px-2 py-0.5 bg-surface-container-lowest/20 text-white text-xs rounded-full font-bold">Presencial</span>
                </div>
                <p className="text-on-primary/80 text-sm">Seguimiento Mensual - Laura R.</p>
              </div>
            </div>
            <button className="w-full mt-6 py-3 px-4 bg-brand-electric hover:bg-primary text-white rounded-full font-bold transition-colors flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">add</span> Nueva Cita
            </button>
          </div>
          
          {/* System Status / Info Card */}
          <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30">
            <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-4">Estado del Sistema</h3>
            <ul className="space-y-3">
              <li className="flex items-center justify-between text-sm">
                <span className="text-on-surface-variant">Sincronización Web</span>
                <span className="flex items-center gap-1 text-[#25D366] font-medium"><span className="w-2 h-2 rounded-full bg-[#25D366]"></span> Online</span>
              </li>
              <li className="flex items-center justify-between text-sm">
                <span className="text-on-surface-variant">Última copia de seguridad</span>
                <span className="text-on-surface">Hoy, 04:00 AM</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
