export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl py-8">
      <h1 className="mb-6 font-heading text-3xl font-bold">Política de Privacidad</h1>
      <div className="space-y-4 text-muted">
        <p>
          En Neo Tech valoramos tu privacidad. Esta política explica qué datos recopilamos, cómo los usamos y cómo los protegemos.
        </p>

        <h2 className="mt-6 font-heading text-xl font-semibold text-fg">1. Datos que recopilamos</h2>
        <p>
          Podemos recopilar los siguientes datos personales:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Nombre, correo electrónico y teléfono (para procesar tu pedido).</li>
          <li>Dirección de envío (cuando corresponda).</li>
          <li>Historial de compras y preferencias de productos.</li>
          <li>Información de navegación y uso del sitio.</li>
        </ul>

        <h2 className="mt-6 font-heading text-xl font-semibold text-fg">2. Finalidad del tratamiento</h2>
        <p>
          Utilizamos tus datos para:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Gestionar tus compras y envíos.</li>
          <li>Enviarte el recibo y el número de pedido.</li>
          <li>Responder consultas y brindar soporte.</li>
          <li>Enviarte ofertas y novedades, solo si nos diste tu consentimiento.</li>
        </ul>

        <h2 className="mt-6 font-heading text-xl font-semibold text-fg">3. Consentimiento para marketing</h2>
        <p>
          Durante el registro o el checkout podés aceptar recibir comunicaciones comerciales. Este consentimiento es opcional y podés revocarlo en cualquier momento.
        </p>

        <h2 className="mt-6 font-heading text-xl font-semibold text-fg">4. Protección de datos</h2>
        <p>
          Implementamos medidas de seguridad para proteger tu información. Sin embargo, ningún sistema es completamente seguro, por lo que no podemos garantizar seguridad absoluta.
        </p>

        <h2 className="mt-6 font-heading text-xl font-semibold text-fg">5. Terceros</h2>
        <p>
          Compartimos datos con terceros solo cuando es necesario para procesar tu compra (por ejemplo, Mercado Pago para pagos) o cuando la ley lo exige.
        </p>

        <h2 className="mt-6 font-heading text-xl font-semibold text-fg">6. Tus derechos</h2>
        <p>
          Podés solicitar acceso, rectificación o eliminación de tus datos personales contactándonos a través de los medios disponibles en el sitio.
        </p>
      </div>
    </div>
  );
}
