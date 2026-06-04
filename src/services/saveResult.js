/**
 * Saves quiz results to the local SQLite backend.
 * Data stays on-premise — no third-party services involved.
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

// Called on form submit — saves registration data immediately.
// The quiz-completion save (saveResult) will upsert the same row with answers/profile.
export const saveRegistration = async (userData) => {
  try {
    await fetch(`${BACKEND_URL}/php-backend/api/save-result.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name:  userData?.firstName  || '',
        last_name:   userData?.lastName   || '',
        name:        `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim(),
        email:       userData?.email      || '',
        event_date:  userData?.eventDate  || '',
        guest_count: userData?.guestCount ?? 0,
        phone:       userData?.phone      || '',
        attending:   userData?.attending  ?? true,
        profile:     '',
        answers:     [],
      }),
    });
  } catch (err) {
    console.error('Registration save error:', err);
  }
};

export const saveResult = async (userData, answers, profile) => {
  try {
    await fetch(`${BACKEND_URL}/php-backend/api/save-result.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name:  userData?.firstName  || '',
        last_name:   userData?.lastName   || '',
        name:        `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim(),
        email:       userData?.email      || '',
        event_date:  userData?.eventDate  || '',
        guest_count: userData?.guestCount ?? 0,
        phone:       userData?.phone      || '',
        attending:   userData?.attending  ?? true,
        profile:     profile ? JSON.stringify({ id: profile.id, drink: profile.drink, tagline: profile.tagline }) : '',
        answers:     answers.map(a => ({ question: a.question?.question || a.question, answer: a.answer })),
      }),
    });
    return true;
  } catch (err) {
    console.error('Save error:', err);
    return false;
  }
};
