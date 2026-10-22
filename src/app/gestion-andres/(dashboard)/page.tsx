import Link from 'next/link';
import { query } from '../../../lib/db';
import UpcomingAppointmentsCard from './UpcomingAppointmentsCard';

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
      upcomingCountRes,
    ] = await Promise.all([
      // 1. Suscripciones activas
      query("SELECT COUNT(*) as count FROM client_subscriptions WHERE status = 'active'"),
      // 2. Citas confirmadas agendadas esta semana
      query("SELECT COUNT(*) as count FROM appointments WHERE status = 'scheduled' AND appointment_date >= date_trunc('week', CURRENT_DATE)"),
      // 3. Citas confirmadas de este mes
      query("SELECT COUNT(*) as count FROM appointments WHERE status = 'scheduled' AND appointment_date >= date_trunc('month', CURRENT_DATE)"),
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
      // 7. Próximas citas confirmadas (excluye 'unverified' y 'cancelled', solo futuras en orden ascendente)
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
        WHERE a.status = 'scheduled'
          AND a.appointment_date >= NOW()
        ORDER BY a.appointment_date ASC
        LIMIT 5
      `),
      // 8. Total de citas futuras confirmadas para el badge del widget
      query("SELECT COUNT(*) as count FROM appointments WHERE status = 'scheduled' AND appointment_date >= NOW()"),
    ]);

    return {
      activeSubscriptions: parseInt(subscriptionsRes.rows[0]?.count || '0', 10),
      weeklyAppointments: parseInt(weeklyAppointmentsRes.rows[0]?.count || '0', 10),
      monthlyAppointments: parseInt(monthlyAppointmentsRes.rows[0]?.count || '0', 10),
      totalIncome: parseFloat(totalIncomeRes.rows[0]?.total || '0'),
      monthlyIncome: parseFloat(monthlyIncomeRes.rows[0]?.total || '0'),
      recentTransactions: recentTransactionsRes.rows || [],
      recentAppointments: recentAppointmentsRes.rows || [],
      upcomingAppointmentsCount: parseInt(upcomingCountRes.rows[0]?.count || '0', 10),
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
      upcomingAppointmentsCount: 0,
    };
  }
}

function formatDate(dateValue: string | Date | null) {
  if (!dateValue) return 'Sin fecha';
  try {
    const d = new Date(dateValue);
    return d.toLocaleDateString('es-CO', {
      timeZone: 'America/Bogota',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
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
      <h1 className="text-xl sm:text-2xl font-bold text-on-surface md:hidden mb-2">
        Resumen General
      </h1>
      
      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 md:gap-6">
        {/* KPI 1: Suscripciones Activas */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 sm:p-6 border border-outline-variant/30 flex flex-col justify-between hover:border-brand-electric/50 transition-colors shadow-xs">
          <div className="flex justify-between items-start mb-3 sm:mb-4">
            <div className="p-2.5 sm:p-3 bg-secondary-container/30 rounded-xl text-secondary">
              <span className="material-symbols-outlined text-[20px] sm:text-[24px]">verified_user</span>
            </div>
            <Link
              href="/gestion-andres/patients"
              prefetch={false}
              className="text-brand-electric font-label-sm text-xs hover:underline flex items-center gap-0.5"
            >
              Ver Pacientes <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>
          <div>
            <h3 className="text-on-surface-variant font-medium text-xs sm:text-sm mb-1">Suscripciones Activas</h3>
            <p className="font-headline-xl text-2xl sm:text-3xl md:text-4xl font-extrabold text-on-surface">
              {data.activeSubscriptions}
            </p>
          </div>
        </div>
        
        {/* KPI 2: Citas Semanales y del Mes */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 sm:p-6 border border-outline-variant/30 flex flex-col justify-between hover:border-brand-electric/50 transition-colors shadow-xs">
          <div className="flex justify-between items-start mb-3 sm:mb-4">
            <div className="p-2.5 sm:p-3 bg-tertiary-container/10 rounded-xl text-tertiary">
              <span className="material-symbols-outlined text-[20px] sm:text-[24px]">calendar_month</span>
            </div>
            <span className="text-secondary text-[11px] sm:text-xs px-2.5 py-1 bg-surface-container rounded-full font-bold">
              {data.weeklyAppointments} esta semana
            </span>
          </div>
          <div>
            <h3 className="text-on-surface-variant font-medium text-xs sm:text-sm mb-1">Citas del Mes</h3>
            <p className="font-headline-xl text-2xl sm:text-3xl md:text-4xl font-extrabold text-on-surface">
              {data.monthlyAppointments}
            </p>
          </div>
        </div>
        
        {/* KPI 3: Ingresos Totales */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 sm:p-6 border border-outline-variant/30 flex flex-col justify-between hover:border-brand-electric/50 transition-colors relative overflow-hidden shadow-xs">
          <div className="flex justify-between items-start mb-3 sm:mb-4">
            <div className="p-2.5 sm:p-3 bg-brand-electric rounded-xl text-white">
              <span className="material-symbols-outlined text-[20px] sm:text-[24px]">payments</span>
            </div>
            <span className="text-secondary text-[11px] sm:text-xs px-2.5 py-1 bg-surface-container rounded-full font-bold">
              ${data.totalIncome.toLocaleString('es-EC', { minimumFractionDigits: 2 })} acumulado
            </span>
          </div>
          <div>
            <h3 className="text-on-surface-variant font-medium text-xs sm:text-sm mb-1">Ingresos del Mes</h3>
            <p className="font-headline-xl text-2xl sm:text-3xl md:text-4xl font-extrabold text-brand-electric">
              ${data.monthlyIncome.toLocaleString('es-EC', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Área Principal de Contenido */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Tabla Principal: Transacciones y Pagos Reales */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 flex flex-col overflow-hidden shadow-xs">
          <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low">
            <div>
              <h2 className="font-headline-md text-sm sm:text-base md:text-lg font-bold text-on-surface">
                Transacciones y Pagos Recientes
              </h2>
              <p className="text-[11px] sm:text-xs text-on-surface-variant mt-0.5">
                Historial de contrataciones en línea de planes nutricionales
              </p>
            </div>
            <Link 
              href="/gestion-andres/plans" 
              prefetch={false}
              className="text-brand-electric font-semibold text-xs hover:underline flex items-center gap-1 shrink-0"
            >
              Planes <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>

          <div className="overflow-x-auto w-full">
            {data.recentTransactions.length === 0 ? (
              <div className="p-8 sm:p-12 text-center text-sm text-gray-500">
                No hay transacciones registradas aún.
              </div>
            ) : (
              <table className="w-full text-left border-collapse min-w-[550px]">
                <thead>
                  <tr className="border-b border-outline-variant/30 bg-surface-container-lowest">
                    <th className="px-4 sm:px-6 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-4 sm:px-6 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-4 sm:px-6 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                      Plan / Monto
                    </th>
                    <th className="px-4 sm:px-6 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-4 sm:px-6 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-right">
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
          
          {/* Widget interactivo de Próximas Citas con Cancelación y Sincronización */}
          <UpcomingAppointmentsCard
            initialAppointments={data.recentAppointments}
            upcomingAppointmentsCount={data.upcomingAppointmentsCount}
          />

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
              href="/gestion-andres/images"
              prefetch={false}
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
