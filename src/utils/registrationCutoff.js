// Registration for the July 9 event closes 2026-07-03 17:00 Europe/Zurich
// (CEST = UTC+2 in July). July 8 and walk-in have no cutoff.
const JULY_9_CUTOFF_UTC = '2026-07-03T15:00:00Z';

export function isRegistrationClosed(eventDate, now = new Date()) {
  if (eventDate !== 'July 9') return false;
  return now.getTime() >= new Date(JULY_9_CUTOFF_UTC).getTime();
}
