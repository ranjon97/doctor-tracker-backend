const MAX_SEARCH_TOKENS = 5;
const TOKEN_SPLITTER = /[^\p{L}\p{N}]+/u;

function tokenize(value: string): string[] {
  return value.toLowerCase().split(TOKEN_SPLITTER).filter(Boolean);
}

// Escapes user input so it is always matched literally inside a RegExp.
export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Builds the lowercase keyword list stored on each document.
 * Phone numbers are also stored as plain digits so "01711" matches "01711-234567".
 */
export function buildKeywords(fields: { text?: (string | undefined)[]; phones?: (string | undefined)[] }) {
  const keywords = new Set<string>();

  for (const value of fields.text ?? []) {
    if (value) tokenize(value).forEach((token) => keywords.add(token));
  }

  for (const phone of fields.phones ?? []) {
    const digits = phone?.replace(/\D/g, '');
    if (digits) keywords.add(digits);
  }

  return [...keywords];
}

/**
 * Converts a free text search into an indexed prefix match on the keywords
 * array. Every typed word must match the start of at least one keyword, and an
 * anchored, case sensitive regex lets MongoDB use the index for a range scan.
 */
export function buildSearchFilter(search?: string) {
  if (!search) return {};

  const tokens = tokenize(search).slice(0, MAX_SEARCH_TOKENS);
  if (tokens.length === 0) return {};

  return {
    keywords: { $all: tokens.map((token) => new RegExp(`^${escapeRegex(token)}`)) },
  };
}
