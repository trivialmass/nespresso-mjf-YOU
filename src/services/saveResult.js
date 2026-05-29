/**
 * Saves quiz results to the local SQLite backend.
 * Data stays on-premise — no third-party services involved.
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

export const saveResult = async (userData, answers, profile) => {
  try {
    await fetch(`${BACKEND_URL}/api/save-result`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim(),
        email: userData?.email || '',
        phone: userData?.phone || '',
        profile: profile ? JSON.stringify({ id: profile.id, drink: profile.drink, tagline: profile.tagline }) : '',
        answers: answers.map(a => ({ question: a.question?.question || a.question, answer: a.answer })),
      }),
    });
    return true;
  } catch (err) {
    console.error('Save error:', err);
    return false;
  }
};
