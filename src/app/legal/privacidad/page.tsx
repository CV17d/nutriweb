import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Política de Privacidad',
  description: "Conoce cómo recopilamos, protegemos y tratamos tus datos personales conforme a la legislación vigente.",
};

export default function PrivacidadPage() {
  return (
    <div className="space-y-8 text-gray-800 leading-relaxed">
      <div>
        <span className="text-xs font-bold text-brand-electric uppercase tracking-wider">Cumplimiento LOPDP</span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy mt-1 mb-2">
          Política de Privacidad y Tratamiento de Datos Personales
        </h2>
        <p className="text-xs sm:text-sm text-gray-500">Última actualización: 17 de Octubre de 2026</p>
      </div>

      <section className="space-y-3">
        <h3 className="text-lg sm:text-xl font-bold text-brand-navy">1. Responsable del Tratamiento de los Datos</h3>
        <p className="text-sm sm:text-base">
          El responsable del tratamiento de los datos recabados a través de este sitio web es <strong>Andrés Burbano</strong> (en adelante, el "Profesional"), Licenciado en Nutrición y Dietética, con domicilio profesional en la ciudad de Quito, Ecuador, y correo electrónico de contacto: <a href="mailto:andresburbnutri@gmail.com" className="text-brand-electric underline">andresburbnutri@gmail.com</a>.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg sm:text-xl font-bold text-brand-navy">2. Naturaleza de los Datos Tratados</h3>
        <p className="text-sm sm:text-base">
          A través de este sitio web recopilamos únicamente los datos necesarios para la gestión de citas y el procesamiento de compras:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base">
          <li><strong>Datos de Identificación y Contacto:</strong> Nombres y apellidos completos, correo electrónico, número de teléfono/WhatsApp y número de identificación (cédula o pasaporte).</li>
          <li><strong>Datos de Transacción:</strong> Identificadores de referencia bancaria o de pago generados al adquirir planes a través de la pasarela de pagos.</li>
        </ul>
        <div className="bg-blue-50 border-l-4 border-brand-electric p-4 rounded-r-xl text-xs sm:text-sm text-blue-900">
          <strong>Aviso sobre Datos Clínicos:</strong> Este sitio web no recopila ni almacena información médica, historial clínico ni mediciones antropométricas. Cualquier valoración de salud se realiza exclusivamente de forma directa y presencial durante la consulta nutricional.
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg sm:text-xl font-bold text-brand-navy">3. Finalidades del Tratamiento</h3>
        <p className="text-sm sm:text-base">Utilizamos tus datos personales exclusivamente para los siguientes propósitos legítimos:</p>
        <ol className="list-decimal pl-6 space-y-2 text-sm sm:text-base">
          <li>Gestionar y confirmar tus citas nutricionales gratuitas o agendadas bajo planes activos.</li>
          <li>Diseñar, calibrar y hacer seguimiento a tus planes de alimentación personalizados y periodizaciones deportivas.</li>
          <li>Enviar notificaciones y recordatorios automatizados de consulta (vía correo electrónico o WhatsApp).</li>
          <li>Gestionar la facturación y verificar el estado de los pagos realizados a través de la pasarela autorizada.</li>
          <li>Cumplir con obligaciones regulatorias contables, tributarias y del Sistema Nacional de Salud.</li>
        </ol>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg sm:text-xl font-bold text-brand-navy">4. Seguridad en Transacciones y Pagos (Payphone)</h3>
        <p className="text-sm sm:text-base">
          El procesamiento de pagos con tarjetas de débito y crédito se efectúa a través de la pasarela certificada <strong>Payphone Ecuador</strong>. En nuestros servidores <strong>nunca se almacenan ni procesan números completos de tarjeta de crédito, fechas de caducidad ni códigos CVV</strong>. Todas las transacciones se realizan mediante canales cifrados con certificación bancaria PCI-DSS Nivel 1.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg sm:text-xl font-bold text-brand-navy">5. Medidas de Seguridad y Custodia Técnica</h3>
        <p className="text-sm sm:text-base">
          Hemos implementado controles de seguridad técnicos y administrativos rigurosos para salvaguardar tu información contra accesos no autorizados, pérdida o alteración:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base">
          <li><strong>Cifrado en Tránsito:</strong> Todos los intercambios de datos entre tu navegador y nuestra plataforma se encuentran protegidos mediante HTTPS y cifrado TLS 1.3.</li>
          <li><strong>Aislamiento por Row Level Security (RLS):</strong> Las bases de datos operan con políticas estrictas de aislamiento a nivel de fila, asegurando que ningún usuario no autenticado pueda consultar registros ajenos.</li>
          <li><strong>Auditoría de Acceso:</strong> Registro de eventos de seguridad y limitadores de tasa (Rate Limiting) para prevenir ataques cibernéticos y de fuerza bruta.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg sm:text-xl font-bold text-brand-navy">6. Derechos del Titular (Acceso, Rectificación y Cancelación)</h3>
        <p className="text-sm sm:text-base">
          Como titular de los datos, tienes derecho a acceder a tu información personal, solicitar su actualización o rectificación cuando sea inexacta, u oponerte a su tratamiento solicitando su supresión (salvo que exista obligación legal o tributaria de conservarla).
        </p>
        <p className="text-sm sm:text-base">
          Para ejercer cualquiera de tus derechos, envía una solicitud formal por escrito con tu copia de documento de identidad a: <a href="mailto:andresburbnutri@gmail.com" className="text-brand-electric font-semibold underline">andresburbnutri@gmail.com</a>. Atenderemos tu requerimiento en un plazo máximo de quince (15) días hábiles.
        </p>
      </section>
    </div>
  );
}
