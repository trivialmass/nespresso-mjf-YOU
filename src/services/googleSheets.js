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
const RANGE = "A:B"; // Adjust based on your sheet structure

export const fetchQuestions = async () => {
  // If no API key or Sheet ID is configured, return mock data
  if (!API_KEY || !SHEET_ID || API_KEY === "your_api_key_here") {
    console.warn(
      "Using mock data. Configure Google Sheets API to use real data.",
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
    console.table(data.values);

    if (!data.values || data.values.length === 0) {
      console.warn("No questions found in Google Sheet. Using mock data.");
      return getMockQuestions();
    }

    // Extract questions from the first column
    const questions = data.values
      .map((row) => ({
        question: row[0],
        bgImage: row[1],
      }))
      .filter((item) => item.question && item.question.trim());
    return questions;
  } catch (error) {
    console.error("Error fetching questions from Google Sheets:", error);
    console.warn("Falling back to mock data.");
    return getMockQuestions();
  }
};

const getMockQuestions = () => {
  return [
    "Do you believe in astrology?",
    "Are you a morning person?",
    "Do you prefer coffee over tea?",
    "Do you like spicy food?",
    "Are you an introvert?",
  ];
};
