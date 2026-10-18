import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Políticas de Cancelación, Reprogramación y Reembolsos | Andrés Burbano Nutrición",
  description: "Conoce las normas y tiempos para la reprogramación de citas y condiciones de reembolso de planes contratados.",
};

export default function ReembolsosPage() {
  return (
    <div className="space-y-8 text-gray-800 leading-relaxed">
      <div>
        <span className="text-xs font-bold text-brand-electric uppercase tracking-wider">Políticas de Atención</span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy mt-1 mb-2">
          Políticas de Cancelación, Reprogramación y Reembolsos
        </h2>
        <p className="text-xs sm:text-sm text-gray-500">Última actualización: 17 de Octubre de 2026</p>
      </div>

      <section className="space-y-3">
        <h3 className="text-lg sm:text-xl font-bold text-brand-navy">1. Citas de Consulta Gratuita</h3>
        <p className="text-sm sm:text-base">
          Las citas iniciales gratuitas requieren confirmación obligatoria mediante el enlace enviado a tu correo electrónico registrado. Si el enlace no es confirmado en el plazo especificado, el turno se liberará automáticamente en el sistema para permitir la reserva de otros pacientes.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg sm:text-xl font-bold text-brand-navy">2. Política de Reprogramación de Citas (Presenciales y Virtuales)</h3>
        <p className="text-sm sm:text-base">
          Entendemos que pueden surgir imprevistos laborales o personales. Para reprogramar una sesión programada (presencial o por Google Meet), se establecen las siguientes condiciones:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base">
          <li><strong>Anticipación Mínima:</strong> Puedes reprogramar tu cita sin costo alguno notificando con al menos <strong>veinticuatro (24) horas de anticipación</strong> única y exclusivamente a través de nuestra línea oficial de WhatsApp.</li>
          <li><strong>Cancelación Tardía o Inasistencia (No-Show):</strong> Las cancelaciones realizadas con menos de 24 horas de antelación o la falta de asistencia injustificada implicarán que la sesión sea descontada como <em>consumida</em> de tu paquete o suscripción, debido a que el espacio de tiempo en consultorio o agenda médica fue reservado exclusivamente para ti.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg sm:text-xl font-bold text-brand-navy">3. Vigencia de los Paquetes y Planes Nutricionales</h3>
        <p className="text-sm sm:text-base">
          Los planes nutricionales adquiridos tienen un período de vigencia determinado por la duración del plan (generalmente 3 meses a partir de la fecha de pago). Las sesiones no utilizadas dentro del período de vigencia podrán ser extendidas únicamente por causas de fuerza mayor médica debidamente acreditadas.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg sm:text-xl font-bold text-brand-navy">4. Condiciones de Devolución y Reembolso</h3>
        <p className="text-sm sm:text-base">El derecho de reembolso de los planes adquiridos se rige por las siguientes pautas:</p>

        <div className="space-y-3">
          <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-xl text-xs sm:text-sm text-emerald-900">
            <strong>Antes de la Primera Consulta:</strong> Si solicitas la cancelación de tu plan antes de haber realizado la primera consulta de evaluación y antes de la entrega de cualquier material, se reembolsará el 100% del valor pagado, deduciendo únicamente las comisiones bancarias o de pasarela de pago que no sean reembolsables por Payphone.
          </div>

          <div className="p-4 bg-slate-100 border-l-4 border-slate-500 rounded-r-xl text-xs sm:text-sm text-slate-800">
            <strong>Posterior al Inicio del Plan:</strong> Una vez efectuada la primera consulta de valoración o una vez entregado el plan alimentario personalizado, <strong>no aplicarán reembolsos totales</strong> debido a la naturaleza personal e intangible del trabajo profesional, cálculo dietético y tiempo médico ya invertido.
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg sm:text-xl font-bold text-brand-navy">5. Procedimiento para Solicitar un Reembolso</h3>
        <p className="text-sm sm:text-base">
          Para solicitar una revisión de reembolso, envía un correo electrónico a: <a href="mailto:andresburbnutri@gmail.com" className="text-brand-electric font-semibold underline">andresburbnutri@gmail.com</a> incluyendo:
        </p>
        <ul className="list-disc pl-6 space-y-1 text-xs sm:text-sm text-gray-700">
          <li>Nombre completo y número de cédula/pasaporte.</li>
          <li>Número de transacción o comprobante de Payphone.</li>
          <li>Motivo detallado de la solicitud.</li>
        </ul>
        <p className="text-sm sm:text-base mt-2">
          Las solicitudes son evaluadas en un lapso de cinco (5) a diez (10) días hábiles. En caso de aprobación, la reversión se gestionará a través de la misma tarjeta o método de pago empleado en la transacción original.
        </p>
      </section>
    </div>
  );
}
