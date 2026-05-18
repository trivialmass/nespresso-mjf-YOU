/**
 * Service to fetch questions from Google Sheets
 *
 * Setup instructions:
 * 1. Create a Google Sheet with your questions
 * 2. Format: Column A should contain the questions
 * 3. Make the sheet publicly accessible (Share > Anyone with link can view)
 * 4. Enable Google Sheets API in Google Cloud Console
 * 5. Create an API key and add it to .env as VITE_GOOGLE_SHEETS_API_KEY
 * 6. Add your sheet ID to .env as VITE_GOOGLE_SHEET_ID
 */

const API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;
const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID;
const RANGE = "A2:D"; // question | traitRight | traitLeft | bgImage

export const fetchQuestions = async () => {
  // If no API key or Sheet ID is configured, return mock data
  if (!API_KEY || !SHEET_ID || API_KEY === "your_api_key_here") {
    console.warn(
      "⚠️ Google Sheets not configured (missing API key or sheet ID). Using mock data.",
    );
    return getMockQuestions();
  }

  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch questions: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.values || data.values.length === 0) {
      console.warn("No questions found in Google Sheet. Using mock data.");
      return getMockQuestions();
    }

    const questions = data.values
      .map((row) => ({
        question:   row[0],
        traitRight: row[1],
        traitLeft:  row[2],
        bgImage:    row[3] || "",
      }))
      .filter((item) => item.question && item.question.trim())
      .filter((item) => item.traitRight && item.traitRight.trim())
      .filter((item) => item.traitLeft && item.traitLeft.trim());

    return questions;
  } catch (error) {
    console.error("❌ Error fetching questions from Google Sheets:", error);
    console.warn("⚠️ Falling back to mock data.");
    return getMockQuestions();
  }
};

const getMockQuestions = () => {
  return [
    { question: "Vinyle ?",           traitRight: "Classique",      traitLeft: "Innovante",      bgImage: "" },
    { question: "Table étoilée ?",    traitRight: "Premium",        traitLeft: "Accessible",     bgImage: "" },
    { question: "Afterwork ?",        traitRight: "Ludique",        traitLeft: "Sérieuse",       bgImage: "" },
    { question: "Chemise hawaïenne ?",traitRight: "Expressive",     traitLeft: "Minimaliste",    bgImage: "" },
    { question: "On se dit tu ?",     traitRight: "Humaine",        traitLeft: "Institutionnelle",bgImage: "" },
    { question: "Jet-lag ?",          traitRight: "Internationale", traitLeft: "Locale",         bgImage: "" },
    { question: "Hors-piste ?",       traitRight: "Disruptive",     traitLeft: "Traditionnelle", bgImage: "" },
    { question: "Plan B ?",           traitRight: "Agile",          traitLeft: "Stable",         bgImage: "" },
    { question: "Tableau Excel ?",    traitRight: "Rationnelle",    traitLeft: "Émotionnelle",   bgImage: "" },
    { question: "Quitte ou double ?", traitRight: "Audacieuse",     traitLeft: "Sécurisante",    bgImage: "" },
  ];
};
