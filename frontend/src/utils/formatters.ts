export function formatDateTimeLocal(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

export function formatDateInput(value?: string | null) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

export function formatTimeInput(value?: string | null) {
  if (!value) return "";
  return String(value).slice(0, 5);
}

export function formatCurrency(value?: string | number | null) {
  if (value == null || value === "") return "$0";
  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) return `$${value}`;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(numberValue);
}
