import { normalizeOptionalText } from './text';

describe('normalizeOptionalText', () => {
  test('trims surrounding whitespace', () => {
    expect(normalizeOptionalText('  Supermercado  ')).toBe('Supermercado');
  });

  test.each(['', '   '])('returns null for a blank or whitespace-only input %p', (input) => {
    expect(normalizeOptionalText(input)).toBeNull();
  });
});
