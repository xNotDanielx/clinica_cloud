const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync, existsSync } = require("node:fs");
const { resolve, dirname } = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");

// Exercise the actual TS modules without adding a second test bundler.
function loadModule(file, globals = {}) {
  const source = readFileSync(resolve(__dirname, "../src", file), "utf8")
    .replace("import.meta.env.VITE_BACKEND_URL", JSON.stringify("http://test.local"));
  const code = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020,
  } }).outputText;
  const exports = {};
  const localRequire = name => {
    if (name.endsWith(".css")) return {};
    if (!name.startsWith(".")) return require(name);
    const target = resolve(__dirname, "../src", dirname(file), name);
    const path = [target, target + ".tsx", target + ".ts"].find(existsSync);
    return loadModule(path, globals);
  };
  vm.runInNewContext(code, { exports, require: localRequire, ...globals });
  return exports;
}

test("apiFetch accepts DELETE 204 and includes the session token", async () => {
  let request;
  const { apiFetch } = loadModule("components/api.tsx", {
    localStorage: { getItem: () => "test-token" },
    fetch: async (url, options) => { request = { url, options }; return new Response(null, { status: 204 }); },
  });
  assert.equal(await apiFetch("/citas/123", { method: "DELETE" }), null);
  assert.equal(request.url, "http://test.local/citas/123");
  assert.equal(request.options.method, "DELETE");
  assert.equal(request.options.headers.Authorization, "Bearer test-token");
});

test("apiFetch reads JSON and rejects API errors", async () => {
  let failed = false;
  const { apiFetch } = loadModule("components/api.tsx", {
    localStorage: { getItem: () => null },
    fetch: async () => failed ? new Response("Unauthorized", { status: 401 }) : Response.json({ ok: true }),
  });
  assert.equal((await apiFetch("/pacientes")).ok, true);
  failed = true;
  await assert.rejects(apiFetch("/pacientes"), /Unauthorized/);
});

const { PatientList, AppointmentList } = loadModule("components/AdminRecords.tsx");
const handlers = { onReload() {}, onCreate() {}, onEdit() {}, onDelete() {}, onApprove() {}, onReject() {} };
const ready = { loading: false, error: "" };
const render = (Component, props) => renderToStaticMarkup(React.createElement(Component, { ...handlers, ...props }));

test("third selection requests a replacement without changing the current pair", () => {
  const { toggleSelection, replaceSelection } = loadModule("components/procedureSelection.ts");
  let state = toggleSelection([], "A");
  state = toggleSelection(state.selected, "B");
  const third = toggleSelection(state.selected, "C");
  assert.equal(third.selected.join(","), "A,B");
  assert.equal(third.pending, "C");
  assert.equal(replaceSelection(third.selected, "A", third.pending).join(","), "C,B");
  assert.equal(toggleSelection(third.selected, "B").selected.join(","), "A");
  assert.equal(replaceSelection(third.selected, "A", "B").join(","), "A,B");
});

test("feedback uses distinct tones, labels and live-region semantics", () => {
  const Feedback = loadModule("components/Feedback.tsx").default;
  const error = render(Feedback, { title: "Revisa los datos", children: "Campo obligatorio" });
  assert.match(error, /role="alert"/);
  assert.match(error, /feedback-error/);
  assert.match(error, /Revisa los datos/);
  const warning = render(Feedback, { tone: "warning", children: "Máximo dos" });
  assert.match(warning, /role="status"/);
  assert.match(warning, /feedback-warning/);
});

test("API messages distinguish session, permissions and conflicts without exposing server data", () => {
  const { ApiError, apiErrorMessage } = loadModule("components/api.tsx");
  assert.match(apiErrorMessage(new ApiError(401, "private"), "Fallback"), /sesión/);
  assert.match(apiErrorMessage(new ApiError(403, "private"), "Fallback"), /permisos/);
  assert.match(apiErrorMessage(new ApiError(409, "private"), "Fallback"), /conflicto/);
  assert.doesNotMatch(apiErrorMessage(new ApiError(500, "private"), "Fallback"), /private/);
});

test("patients render ten rows per page, contact and contextual actions", () => {
  const patients = Array.from({ length: 12 }, (_, i) => ({
    identificacion: String(i), nombre_completo: "Prueba " + i,
    email: "demo@example.test", telefono: "0000000", activo: true,
  }));
  const html = render(PatientList, { patients, state: ready });
  assert.match(html, /Prueba 9/);
  assert.doesNotMatch(html, /Prueba 10/);
  assert.match(html, /Editar paciente Prueba 0/);
  assert.match(html, /Eliminar paciente Prueba 0/);
  assert.match(html, /demo@example.test/);
  assert.match(html, /de 12/);
});

test("loading, empty and failed states are distinct and hide stale records", () => {
  assert.match(render(PatientList, { patients: [], state: ready }), /Aún no hay registros/);
  assert.match(render(PatientList, { patients: [], state: { loading: true, error: "" } }), /Cargando registros/);
  const html = render(PatientList, { patients: [{ nombre_completo: "Stale patient" }], state: { loading: false, error: "Sin conexión" } });
  assert.match(html, /Reintentar/);
  assert.doesNotMatch(html, /Stale patient/);
});

test("pending requests expose approval while ordinary appointments expose editing", () => {
  const appointments = [{ id: 7, nombre_paciente: "Prueba", id_paciente: "000", fecha_programada: "2026-10-06", hora_inicio: "09:00:00", hora_fin: "10:00:00", estado: "pendiente_aprobacion" }];
  const pending = render(AppointmentList, { appointments, pending: true, state: ready });
  assert.match(pending, /Aprobar cita #7/);
  assert.match(pending, /Rechazar cita #7/);
  assert.doesNotMatch(pending, /Editar cita #7/);
  const regular = render(AppointmentList, { appointments, state: ready });
  assert.match(regular, /Editar cita #7/);
  assert.match(regular, /09:00/);
});
