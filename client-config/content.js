// TODO: URL-key invitation gating — before showing the RSVP form, validate a URL param (e.g. ?key=xxx)
// against the mailing list server-side. Only invited guests see the RSVP; quiz can be open to all.

export const rsvp = {
  heading: "you're invited",
  firstNameLabel: 'First name*',
  lastNameLabel: 'Last name*',
  emailLabel: 'Email address*',
  phoneLabel: 'Phone number',
  attendYes: "I'd be delighted to attend",
  attendNo: "I won't be able to make it this time",
  ctaLabel: 'CONFIRM',
};

export const quizIntro = {
  eyebrow: 'NESPRESSO × MONTREUX JAZZ FESTIVAL',
  heading: 'QUEL EST\nVOTRE PROFIL\nCAFÉ ?',
  body: 'Trois questions. Swipez à droite pour IN, à gauche pour OUT. Découvrez votre cocktail café signature.',
  ctaLabel: 'C\'est parti',
};

export const congratsLoading = 'YOUR RESULT IS LOADING';

export const privacy =
  'Vos données sont utilisées uniquement dans le cadre de cet événement Nespresso × MJF. Elles ne sont ni exploitées commercialement ni transmises à des tiers.';

export const resultsEmailSent = 'Votre profil café vous a été envoyé par email.';

export const resultsFooterLink = {
  label: 'nespresso.com',
  href: 'https://www.nespresso.com',
};
