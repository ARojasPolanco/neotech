let positivos = 0;
let negativos = 0;
let errores = 0;

export function resetCounters() {
  positivos = 0;
  negativos = 0;
  errores = 0;
}

export function ok(label) {
  positivos++;
  console.log(`  ✅ ${label}`);
}

export function rechazo(label) {
  negativos++;
  console.log(`  ✅ [NEGATIVO] ${label}`);
}

export function fallo(label, detalle) {
  errores++;
  console.log(
    `  ❌ [FALLO] ${label}${detalle ? " — " + String(detalle) : ""}`,
  );
}

export function printResumen() {
  console.log(
    `\n✅ ${positivos} positivos | ✅ ${negativos} negativos | ❌ ${errores} errores\n`,
  );
  if (errores > 0) process.exit(1);
}

export function callHandler(handler, body = {}, query = {}) {
  return new Promise((resolve) => {
    const req = { body, query };
    const wrapper = {
      statusCode: 200,
      body: undefined,
      status(code) {
        wrapper.statusCode = code;
        return wrapper;
      },
      send(data) {
        wrapper.body = data;
        resolve({ statusCode: wrapper.statusCode, body: wrapper.body });
        return wrapper;
      },
      json(data) {
        wrapper.body = data;
        resolve({ statusCode: wrapper.statusCode, body: wrapper.body });
        return wrapper;
      },
      sendStatus(code) {
        wrapper.statusCode = code;
        resolve({ statusCode: wrapper.statusCode, body: wrapper.body });
        return wrapper;
      },
    };
    handler(req, wrapper, () => {});
  });
}
