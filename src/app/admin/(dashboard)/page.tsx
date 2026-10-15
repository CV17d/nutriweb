import Link from 'next/link';
import { query } from '../../../lib/db';

export const dynamic = 'force-dynamic';

async function getDashboardData() {
  try {
    const [
      subscriptionsRes,
      weeklyAppointmentsRes,
      monthlyAppointmentsRes,
      totalIncomeRes,
      monthlyIncomeRes,
      recentTransactionsRes,
      recentAppointmentsRes,
    ] = await Promise.all([
      // 1. Suscripciones activas
      query("SELECT COUNT(*) as count FROM client_subscriptions WHERE status = 'active'"),
      // 2. Citas agendadas esta semana
      query("SELECT COUNT(*) as count FROM appointments WHERE appointment_date >= date_trunc('week', CURRENT_DATE)"),
      // 3. Citas de este mes
      query("SELECT COUNT(*) as count FROM appointments WHERE appointment_date >= date_trunc('month', CURRENT_DATE)"),
      // 4. Ingresos totales aprobados
      query("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE status = 'success'"),
      // 5. Ingresos de este mes
      query("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE status = 'success' AND created_at >= date_trunc('month', CURRENT_DATE)"),
      // 6. Transacciones y pagos recientes
      query(`
        SELECT 
          t.id, 
          t.amount, 
          t.status, 
          t.gateway_payment_id, 
          t.created_at, 
          t.metadata,
          COALESCE(p.name, t.metadata->>'planName', 'Plan Nutricional') as plan_title
        FROM transactions t
        LEFT JOIN plans p ON t.plan_id = p.id
        ORDER BY t.created_at DESC
        LIMIT 10
      `),
      // 7. Citas recientes registradas
      query(`
        SELECT 
          a.id,
          a.appointment_date,
          a.status,
          a.is_free_consultation,
          a.created_at,
          COALESCE(u.full_name, 'Consulta Nutricional') as client_name,
          COALESCE(u.email, '') as client_email
        FROM appointments a
        LEFT JOIN users u ON a.client_id = u.id AND a.client_id != '00000000-0000-0000-0000-000000000000'
        ORDER BY a.appointment_date DESC
        LIMIT 4
      `),
    ]);

    return {
      activeSubscriptions: parseInt(subscriptionsRes.rows[0]?.count || '0', 10),
      weeklyAppointments: parseInt(weeklyAppointmentsRes.rows[0]?.count || '0', 10),
      monthlyAppointments: parseInt(monthlyAppointmentsRes.rows[0]?.count || '0', 10),
      totalIncome: parseFloat(totalIncomeRes.rows[0]?.total || '0'),
      monthlyIncome: parseFloat(monthlyIncomeRes.rows[0]?.total || '0'),
      recentTransactions: recentTransactionsRes.rows || [],
      recentAppointments: recentAppointmentsRes.rows || [],
    };
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    return {
      activeSubscriptions: 0,
      weeklyAppointments: 0,
      monthlyAppointments: 0,
      totalIncome: 0,
      monthlyIncome: 0,
      recentTransactions: [],
      recentAppointments: [],
    };
  }
}

function formatDate(dateValue: string | Date | null) {
  if (!dateValue) return 'Sin fecha';
  try {
    const d = new Date(dateValue);
    return d.toLocaleDateString('es-EC', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Fecha inválida';
  }
}

function formatWhatsAppUrl(phone?: string, name?: string) {
  if (!phone) return null;
  const clean = phone.replace(/\D/g, '');
  if (!clean) return null;
  const fullNumber = clean.startsWith('0') ? '593' + clean.slice(1) : clean.length === 9 ? '593' + clean : clean;
  const message = `Hola ${name || ''}, te saluda el consultorio de Andrés Burbano Nutrición.`;
  return `https://wa.me/${fullNumber}?text=${encodeURIComponent(message)}`;
}

function renderStatusBadge(status: string) {
  const s = (status || '').toLowerCase();
  if (s === 'success' || s === 'completed' || s === 'aprobado') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wide">
        Exitoso
      </span>
    );
  }
  if (s === 'pending' || s === 'scheduled' || s === 'unverified') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 uppercase tracking-wide">
        Pendiente
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700 uppercase tracking-wide">
      {status}
    </span>
  );
}

export default async function AdminDashboard() {
  const data = await getDashboardData();

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Título móvil */}
      <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface font-bold md:hidden mb-4">
        Resumen General
      </h1>
      
      {/* KPI Bento Grid: Sin leads, con métricas reales operativas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* KPI 1: Suscripciones Activas */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 flex flex-col justify-between hover:border-brand-electric/50 transition-colors shadow-xs">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-secondary-container/30 rounded-xl text-secondary">
              <span className="material-symbols-outlined text-[24px]">verified_user</span>
            </div>
            <Link
              href="/admin/patients"
              className="text-brand-electric font-label-sm text-xs hover:underline flex items-center gap-0.5"
            >
              Ver Pacientes <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>
          <div>
            <h3 className="text-on-surface-variant font-medium text-sm mb-1">Suscripciones Activas</h3>
            <p className="font-headline-xl text-3xl md:text-4xl font-extrabold text-on-surface">
              {data.activeSubscriptions}
            </p>
          </div>
        </div>
        
        {/* KPI 2: Citas Semanales y del Mes */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 flex flex-col justify-between hover:border-brand-electric/50 transition-colors shadow-xs">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-tertiary-container/10 rounded-xl text-tertiary">
              <span className="material-symbols-outlined text-[24px]">calendar_month</span>
            </div>
            <span className="text-secondary text-xs px-2.5 py-1 bg-surface-container rounded-full font-bold">
              {data.weeklyAppointments} esta semana
            </span>
          </div>
          <div>
            <h3 className="text-on-surface-variant font-medium text-sm mb-1">Citas del Mes</h3>
            <p className="font-headline-xl text-3xl md:text-4xl font-extrabold text-on-surface">
              {data.monthlyAppointments}
            </p>
          </div>
        </div>
        
        {/* KPI 3: Ingresos Totales */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 flex flex-col justify-between hover:border-brand-electric/50 transition-colors relative overflow-hidden shadow-xs">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-brand-electric rounded-xl text-white">
              <span className="material-symbols-outlined text-[24px]">payments</span>
            </div>
            <span className="text-secondary text-xs px-2.5 py-1 bg-surface-container rounded-full font-bold">
              ${data.totalIncome.toLocaleString('es-EC', { minimumFractionDigits: 2 })} acumulado
            </span>
          </div>
          <div>
            <h3 className="text-on-surface-variant font-medium text-sm mb-1">Ingresos del Mes</h3>
            <p className="font-headline-xl text-3xl md:text-4xl font-extrabold text-brand-electric">
              ${data.monthlyIncome.toLocaleString('es-EC', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Área Principal de Contenido */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Tabla Principal: Transacciones y Pagos Reales (Reemplaza la tabla estática de leads) */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 flex flex-col overflow-hidden shadow-xs">
          <div className="px-6 py-5 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low">
            <div>
              <h2 className="font-headline-md text-base md:text-lg font-bold text-on-surface">
                Transacciones y Pagos Recientes
              </h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Historial de contrataciones en línea de planes nutricionales
              </p>
            </div>
            <Link 
              href="/admin/plans" 
              className="text-brand-electric font-semibold text-xs hover:underline flex items-center gap-1"
            >
              Planes <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>

          <div className="overflow-x-auto">
            {data.recentTransactions.length === 0 ? (
              <div className="p-12 text-center text-sm text-gray-500">
                No hay transacciones registradas aún.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/30 bg-surface-container-lowest">
                    <th className="px-6 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                      Plan / Monto
                    </th>
                    <th className="px-6 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-right">
                      WhatsApp
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {data.recentTransactions.map((tx: any) => {
                    const meta = tx.metadata || {};
                    const clientName = meta.clientName || 'Cliente Web';
                    const clientPhone = meta.clientPhone || '';
                    const clientEmail = meta.clientEmail || '';
                    const waUrl = formatWhatsAppUrl(clientPhone, clientName);
                    const initials = clientName
                      .split(' ')
                      .map((n: string) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase() || 'CW';

                    return (
                      <tr key={tx.id} className="hover:bg-surface-container-low/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary-container/20 text-brand-electric flex items-center justify-center font-bold text-xs shrink-0">
                              {initials}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-xs md:text-sm text-on-surface">
                                {clientName}
                              </span>
                              {clientEmail && (
                                <span className="text-[11px] text-gray-400">
                                  {clientEmail}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-on-surface-variant text-xs whitespace-nowrap">
                          {formatDate(tx.created_at)}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-on-surface">
                              {tx.plan_title}
                            </span>
                            <span className="text-xs font-bold text-brand-electric">
                              ${parseFloat(tx.amount || '0').toFixed(2)}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          {renderStatusBadge(tx.status)}
                        </td>

                        <td className="px-6 py-4 text-right">
                          {waUrl ? (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors"
                              title={`Contactar a ${clientName} por WhatsApp`}
                            >
                              <span className="material-symbols-outlined text-[18px]">chat</span>
                            </a>
                          ) : (
                            <span className="text-gray-300 text-xs">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Barra Lateral Derecha: Citas Próximas y Acceso al Carrusel */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Widget de Próximas Citas (Funcional con datos de la BD) */}
          <div className="bg-brand-navy rounded-2xl p-6 text-on-primary shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-headline-md text-base md:text-lg font-bold flex items-center gap-2 text-white">
                <span className="material-symbols-outlined text-brand-electric">schedule</span>
                Próximas Citas
              </h3>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-white font-medium">
                {data.recentAppointments.length} agendadas
              </span>
            </div>

            <div className="space-y-3">
              {data.recentAppointments.length === 0 ? (
                <p className="text-xs text-white/60 text-center py-4">
                  No hay citas registradas en el sistema.
                </p>
              ) : (
                data.recentAppointments.map((app: any) => {
                  const isFree = app.is_free_consultation;
                  const dateStr = formatDate(app.appointment_date);

                  return (
                    <div
                      key={app.id}
                      className="bg-white/10 rounded-xl p-3.5 border border-white/10 backdrop-blur-sm"
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <span className="font-bold text-xs text-white">{dateStr}</span>
                        <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
                          isFree ? 'bg-amber-400/20 text-amber-300' : 'bg-brand-electric text-white'
                        }`}>
                          {isFree ? 'Gratuita' : 'Plan'}
                        </span>
                      </div>
                      <p className="text-white/80 text-xs font-medium">
                        {app.client_name}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            <Link
              href="/admin/patients"
              className="w-full mt-5 py-2.5 px-4 bg-brand-electric hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">calendar_month</span>
              Ver Pacientes y Citas
            </Link>
          </div>

          {/* Tarjeta de Acceso Rápido: Carrusel del Consultorio */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 hover:border-brand-electric/50 transition-colors shadow-xs">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-primary-container/10 text-brand-electric">
                <span className="material-symbols-outlined text-[22px]">view_carousel</span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-on-surface">Carrusel del Consultorio</h3>
                <span className="text-xs text-on-surface-variant">Fotos y textos de ubicación</span>
              </div>
            </div>
            <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
              Agrega, ordena o elimina las fotografías del consultorio que se muestran a los pacientes en la página de inicio.
            </p>
            <Link
              href="/admin/images"
              className="w-full py-2.5 px-4 bg-surface-container-low hover:bg-brand-electric hover:text-white text-brand-electric rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-outline-variant/30 hover:border-brand-electric"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
              Gestionar Fotos del Consultorio
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
