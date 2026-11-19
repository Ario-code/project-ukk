export function normalizeClassName(value: string) {
  return value.trim().toLowerCase().replace(/[\s-]+/g, "");
}
