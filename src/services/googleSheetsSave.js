/**
 * Service to save quiz results to the backend (SQLite)
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";

export const saveQuizResult = async (userData, answers, profile) => {
  try {
    await fetch(`${BACKEND_URL}/api/save-result`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim(),
        company: '',
        email: userData?.email || '',
        profile: profile ? JSON.stringify({ id: profile.id, drink: profile.drink, tagline: profile.tagline }) : '',
        answers: answers.map(a => ({ question: a.question?.question || a.question, answer: a.answer })),
      }),
    });
    return true;
  } catch (error) {
    console.error("Save error:", error);
    return false;
  }
};