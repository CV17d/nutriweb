import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y Condiciones del Servicio | Andrés Burbano Nutrición",
  description: "Conoce los términos que regulan la contratación de planes nutricionales, citas y el uso de nuestra plataforma.",
};

export default function TerminosPage() {
  return (
    <div className="space-y-8 text-gray-800 leading-relaxed">
      <div>
        <span className="text-xs font-bold text-brand-electric uppercase tracking-wider">Términos Legales</span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy mt-1 mb-2">
          Términos y Condiciones de Contratación y Uso
        </h2>
        <p className="text-xs sm:text-sm text-gray-500">Última actualización: 17 de Octubre de 2026</p>
      </div>

      <section className="space-y-3">
        <h3 className="text-lg sm:text-xl font-bold text-brand-navy">1. Objeto y Aceptación</h3>
        <p className="text-sm sm:text-base">
          El presente documento regula el acceso y la contratación de los servicios de asesoría nutricional, evaluación antropométrica y planificación dietética brindados por <strong>Andrés Burbano</strong> a través de este portal web. La navegación en el sitio, el agendamiento de citas y la compra de planes implican la aceptación plena e incondicional de estos Términos.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg sm:text-xl font-bold text-brand-navy">2. Naturaleza del Servicio y Exención Médica</h3>
        <p className="text-sm sm:text-base">
          Los servicios prestados consisten en asesoría y optimización nutricional orientada a la salud, composición corporal y rendimiento deportivo. 
        </p>
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl text-xs sm:text-sm text-amber-900">
          <strong>Aviso Sanitario Importante:</strong> La asesoría nutricional <strong>no reemplaza el diagnóstico, prescripción médica o tratamiento farmacológico</strong> de enfermedades agudas o crónicas complejas. Ante cualquier síntoma médico urgente, el usuario debe acudir de inmediato a un centro hospitalario o médico especialista.
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg sm:text-xl font-bold text-brand-navy">3. Obligaciones y Responsabilidad del Paciente</h3>
        <p className="text-sm sm:text-base">Para garantizar una atención segura y personalizada, el usuario se compromete a:</p>
        <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base">
          <li>Proporcionar información médica, antropométrica y clínica veraz, completa y actualizada durante las entrevistas de anamnesis.</li>
          <li>Informar de inmediato sobre diagnósticos médicos preexistentes, uso de medicamentos, suplementos, lesiones o estados de embarazo/lactancia.</li>
          <li>Seguir las directrices nutricionales adaptándolas a sus sensaciones corporales y reportar cualquier intolerancia o malestar.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg sm:text-xl font-bold text-brand-navy">4. Contratación de Planes y Pasarela de Pago</h3>
        <p className="text-sm sm:text-base">
          Los precios de los planes están expresados en Dólares de los Estados Unidos de América (USD). Al completar el formulario de compra y procesar el pago mediante Payphone, el usuario adquiere el derecho al número de sesiones y acompañamiento estipulados en el plan contratado.
        </p>
        <p className="text-sm sm:text-base">
          Las transacciones son verificadas en tiempo real. En caso de que la pasarela rechace el cobro, la cita o plan no quedará activado hasta que se concrete el pago exitoso.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg sm:text-xl font-bold text-brand-navy">5. Propiedad Intelectual</h3>
        <p className="text-sm sm:text-base">
          Todos los menús, guías nutricionales, recetarios, cálculos calóricos y materiales entregados durante las sesiones son de propiedad intelectual exclusiva de Andrés Burbano. Se otorgan para uso personal, privado y no comercial del paciente, quedando estrictamente prohibida su reventa, distribución masiva o divulgación a terceros sin autorización previa.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg sm:text-xl font-bold text-brand-navy">6. Legislación Aplicable y Jurisdicción</h3>
        <p className="text-sm sm:text-base">
          Estos Términos y Condiciones se rigen por las leyes de la República del Ecuador. Cualquier controversia derivada de la interpretación o ejecución de los mismos será sometida a los tribunales competentes de la ciudad de Quito, renunciando a cualquier otro fuero que pudiera corresponder.
        </p>
      </section>
    </div>
  );
}
