export function normalizeRut(raw: string) {
  const clean = raw
    .replaceAll(".", "")
    .replaceAll("-", "")
    .toUpperCase();

  if (clean.length < 2) return clean;

  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);

  return `${body}-${dv}`;
}

export function isValidRutFormat(rut: string) {
  return /^\d+-[\dK]$/i.test(rut);
}
