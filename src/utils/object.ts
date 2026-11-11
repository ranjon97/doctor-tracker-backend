// Converts "" to undefined so optional fields are left out on create and unset on update.
export function emptyStringsToUndefined<T extends Record<string, unknown>>(input: T) {
  const output: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    output[key] = value === '' ? undefined : value;
  }
  return output as { [K in keyof T]: Exclude<T[K], ''> };
}
