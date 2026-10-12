import { buildDashboardUrl } from './dashboard';

// This module also exports a TanStack Query hook that imports the Firebase client -- mocked here
// so this file's pure function can be tested without pulling in AsyncStorage's native module.
jest.mock('@/shared/api/firebase', () => ({ auth: {} }));

describe('buildDashboardUrl', () => {
  test('includes only from and to when no trend start is given', () => {
    expect(buildDashboardUrl({ from: '2026-09-01', to: '2026-09-30' })).toBe('/dashboard?from=2026-09-01&to=2026-09-30');
  });

  test('appends trendFrom when given', () => {
    const url = buildDashboardUrl({ from: '2026-09-01', to: '2026-09-30', trendFrom: '2026-04-01' });

    expect(url).toBe('/dashboard?from=2026-09-01&to=2026-09-30&trendFrom=2026-04-01');
  });
});
