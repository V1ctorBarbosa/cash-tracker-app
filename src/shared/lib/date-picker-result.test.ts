import { setPendingPickedDate, takePendingPickedDate } from './date-picker-result';

describe('date-picker-result mailbox', () => {
  test('returns null when nothing has been set', () => {
    expect(takePendingPickedDate()).toBeNull();
  });

  test('returns the set date once, then clears it', () => {
    setPendingPickedDate('2026-09-10');

    expect(takePendingPickedDate()).toBe('2026-09-10');
    expect(takePendingPickedDate()).toBeNull();
  });
});
