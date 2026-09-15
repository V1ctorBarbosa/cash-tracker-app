// Expo Router has no built-in way for a pushed screen to return a value to its caller. This
// tiny in-memory mailbox bridges the gap: the date picker deposits the chosen date right before
// calling router.back(), and the calling screen collects it on its next focus. Whichever screen
// checks last simply finds nothing to collect -- there's only ever one date picker on screen at a
// time, so no queue or per-request identity is needed.
let pendingPickedDate: string | null = null;

export function setPendingPickedDate(isoDate: string): void {
  pendingPickedDate = isoDate;
}

/** Reads and clears the pending picked date, if any -- call once per screen focus. */
export function takePendingPickedDate(): string | null {
  const isoDate = pendingPickedDate;
  pendingPickedDate = null;
  return isoDate;
}
