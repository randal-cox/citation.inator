export const defaultClassPrefix = "citation";
export const partSelector = "[data-citation-part]";

export function validClassPrefix(prefix) {
  return typeof prefix === "string" && /^[a-z][a-z0-9-]{0,31}$/.test(prefix);
}

export function validateClassPrefix(prefix) {
  if (!validClassPrefix(prefix)) throw new TypeError("Use a lowercase citation class prefix.");
}

export function partClassNames(prefix, parts) {
  return parts.split(" ").map(part => `${prefix}-${part}`);
}
