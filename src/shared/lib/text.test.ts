import { normalizeOptionalText, normalizeSearchText } from './text';

describe('normalizeOptionalText', () => {
  test('trims surrounding whitespace', () => {
    expect(normalizeOptionalText('  Supermercado  ')).toBe('Supermercado');
  });

  test.each(['', '   '])('returns null for a blank or whitespace-only input %p', (input) => {
    expect(normalizeOptionalText(input)).toBeNull();
  });
});

describe('normalizeSearchText', () => {
  test('lowercases the input', () => {
    expect(normalizeSearchText('SUPERMERCADO')).toBe('supermercado');
  });

  test('strips accents', () => {
    expect(normalizeSearchText('Padaria à José')).toBe('padaria a jose');
  });

  test('trims surrounding whitespace', () => {
    expect(normalizeSearchText('  Mercado  ')).toBe('mercado');
  });
});
