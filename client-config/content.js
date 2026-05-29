// TODO: URL-key invitation gating — before showing the RSVP form, validate a URL param (e.g. ?key=xxx)
// against the mailing list server-side. Only invited guests see the RSVP; quiz can be open to all.

export const rsvp = {
  eyebrow: 'NESPRESSO × MONTREUX JAZZ FESTIVAL',
  heading: 'VOUS ÊTES INVITÉ·E',
  subheading: 'Confirmez votre présence pour accéder à l\'expérience.',
  firstNameLabel: 'Prénom',
  lastNameLabel: 'Nom',
  emailLabel: 'Email',
  attendYes: 'Je serai présent·e',
  attendNo: 'Je ne pourrai pas venir',
  ctaLabel: 'Découvrir mon profil café',
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
