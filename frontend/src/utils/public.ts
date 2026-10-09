export function getMinAppointmentDate() {
  const date = new Date();
  date.setDate(date.getDate() + 2);
  return date.toISOString().slice(0, 10);
}

export function enumLabel(value: string) {
  const base = value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  const map: Record<string, string> = {
    "Cedula Chilena": "Cédula chilena",
    "Cedula Extranjero": "Cédula de extranjero",
    "Pasaporte Chileno": "Pasaporte chileno",
    "Pasaporte Extranjero": "Pasaporte extranjero",
    "Documento Extranjero": "Documento extranjero",
  };

  return map[base] ?? base;
}

export function countryCodeToFlag(code: string) {
  return code
    .toUpperCase()
    .split("")
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join("");
}

export function prefixLabel(dial: string, code: string, label: string) {
  return `${countryCodeToFlag(code)} ${label} +${dial}`;
}
