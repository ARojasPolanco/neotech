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

export function callHandler(handler, body = {}, query = {}, params = {}) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("callHandler timed out after 5000ms"));
    }, 5000);

    const req = { body, query, params };
    const wrapper = {
      statusCode: 200,
      body: undefined,
      status(code) {
        wrapper.statusCode = code;
        return wrapper;
      },
      send(data) {
        clearTimeout(timeout);
        wrapper.body = data;
        resolve({ statusCode: wrapper.statusCode, body: wrapper.body });
        return wrapper;
      },
      json(data) {
        clearTimeout(timeout);
        wrapper.body = data;
        resolve({ statusCode: wrapper.statusCode, body: wrapper.body });
        return wrapper;
      },
      sendStatus(code) {
        clearTimeout(timeout);
        wrapper.statusCode = code;
        resolve({ statusCode: wrapper.statusCode, body: wrapper.body });
        return wrapper;
      },
    };

    const result = handler(req, wrapper, (err) => {
      clearTimeout(timeout);
      if (err) {
        wrapper.statusCode = err.statusCode || 500;
        wrapper.body = { message: err.message };
        resolve({ statusCode: wrapper.statusCode, body: wrapper.body });
      } else {
        resolve({ statusCode: wrapper.statusCode, body: wrapper.body });
      }
    });

    if (result && typeof result.catch === "function") {
      result.catch((err) => {
        clearTimeout(timeout);
        fallo("Handler threw unhandled error", err.message);
        wrapper.statusCode = 500;
        wrapper.body = { message: err.message };
        resolve({ statusCode: wrapper.statusCode, body: wrapper.body });
      });
    }
  });
}
