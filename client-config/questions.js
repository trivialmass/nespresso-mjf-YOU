export const sheetConfig = {
  apiKey: import.meta.env.VITE_GOOGLE_SHEETS_API_KEY,
  sheetId: import.meta.env.VITE_GOOGLE_SHEET_ID,
  range: 'A2:D',
};

export const mockQuestions = [
  { question: 'Question 1?', traitRight: 'Trait A', traitLeft: 'Trait B', bgImage: '' },
  { question: 'Question 2?', traitRight: 'Trait C', traitLeft: 'Trait D', bgImage: '' },
  { question: 'Question 3?', traitRight: 'Trait E', traitLeft: 'Trait F', bgImage: '' },
];
