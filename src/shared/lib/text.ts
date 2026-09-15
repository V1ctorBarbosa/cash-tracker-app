const DiacriticMarks = /[̀-ͯ]/g;

/** Trims free-text input and normalizes a blank result to null -- for optional fields the API stores as null rather than an empty string. */
export function normalizeOptionalText(rawText: string): string | null {
  const trimmed = rawText.trim();
  if (trimmed.length === 0) {
    return null;
  }

  return trimmed;
}

/** Lowercases and strips accents for comparisons that should ignore case and diacritics (e.g. free-text search). */
export function normalizeSearchText(rawText: string): string {
  return rawText.trim().toLowerCase().normalize('NFD').replace(DiacriticMarks, '');
}
