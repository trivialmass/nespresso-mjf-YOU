export const sheetConfig = {
  apiKey: import.meta.env.VITE_GOOGLE_SHEETS_API_KEY,
  sheetId: import.meta.env.VITE_GOOGLE_SHEET_ID,
  range: 'A2:D',
};

// Starter mock questions — replace with final Nespresso quiz content
export const mockQuestions = [
  { question: 'Lungo ou Espresso\u00a0?', traitRight: 'Doux',      traitLeft: 'Intense',   bgImage: '' },
  { question: 'Milk or black\u00a0?',      traitRight: 'Crémeux',   traitLeft: 'Pur',       bgImage: '' },
  { question: 'Sunrise or sunset\u00a0?',  traitRight: 'Classique', traitLeft: 'Original',  bgImage: '' },
];
