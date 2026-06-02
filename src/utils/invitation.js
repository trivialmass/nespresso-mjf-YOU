const PATTERNS = {
  invitation_z_july_8: { date: 'July 8', dayLabel: 'Wednesday July 8th', concerts: 'Sacha Keable & Tyla', maxGuests: 0 },
  invitation_o_july_8: { date: 'July 8', dayLabel: 'Wednesday July 8th', concerts: 'Sacha Keable & Tyla', maxGuests: 1 },
  invitation_t_july_8: { date: 'July 8', dayLabel: 'Wednesday July 8th', concerts: 'Sacha Keable & Tyla', maxGuests: 2 },
  invitation_z_july_9: { date: 'July 9', dayLabel: 'Thursday July 9th',  concerts: 'Joy Crookes & John Legend', maxGuests: 0 },
  invitation_o_july_9: { date: 'July 9', dayLabel: 'Thursday July 9th',  concerts: 'Joy Crookes & John Legend', maxGuests: 1 },
  invitation_t_july_9: { date: 'July 9', dayLabel: 'Thursday July 9th',  concerts: 'Joy Crookes & John Legend', maxGuests: 2 },
};

export function parseInvitation(pathname = window.location.pathname) {
  const slug = pathname.replace(/^\//, '').replace(/\/$/, '');
  const match = PATTERNS[slug];
  if (!match) return { valid: false, date: null, dayLabel: null, concerts: null, maxGuests: null };
  return { valid: true, ...match };
}
