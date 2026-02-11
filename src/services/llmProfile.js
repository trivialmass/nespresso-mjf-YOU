/**
 * Service to generate personality profiles via backend proxy
 *
 * The backend server handles the Infomaniak API call to avoid CORS issues.
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

export const generateProfile = async (answers) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/generate-profile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ answers }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to generate profile");
    }

    const data = await response.json();

    if (!data.profile || data.profile.length < 50) {
      console.warn("Backend response too short, using mock profile");
      return getMockProfile(answers);
    }

    return data.profile;
  } catch (error) {
    console.error("Error generating profile via backend:", error);
    console.warn(
      "Is the backend server running? Start it with: npm run server",
    );
    console.warn("Falling back to mock profile.");
    return getMockProfile(answers);
  }
};

const createPrompt = (answers) => {
  const answerText = answers
    .map((a, i) => `${i + 1}. ${a.question} → ${a.answer.toUpperCase()}`)
    .join("\n");

  return `You are a witty, insightful personality analyst who creates fun, engaging personality profiles.

Based on these quiz answers, create a unique and personalized personality profile (2-3 paragraphs):

Quiz Answers:
${answerText}

Create an engaging profile that:
- Starts with a catchy title/archetype with an emoji (like "🌟 The Adventurous Dreamer" or "🎯 The Methodical Visionary")
- Describes their personality traits based on the specific answers
- Includes a "Your Vibe" section with 3 emojis and traits
- Ends with a fun prediction or advice
- Be creative, humorous, and positive
- Make it UNIQUE every time

Format exactly like this:
## [Emoji] [Archetype Title]

[Personality description - 2-3 sentences about who they are based on answers]

Your vibe: [emoji] [trait] • [emoji] [trait] • [emoji] [trait]

**Prediction:** [One fun, specific prediction or advice]`;
};

const getMockProfile = (answers) => {
  const yesCount = answers.filter((a) => a.answer === "yes").length;
  const noCount = answers.filter((a) => a.answer === "no").length;

  const ratio = yesCount / (yesCount + noCount);

  let archetype = "";
  let description = "";

  if (ratio > 0.7) {
    archetype = "🌟 The Enthusiastic Adventurer";
    description = `You're someone who embraces life with open arms! Your tendency to say "yes" to questions shows you're optimistic, open-minded, and ready for new experiences. You probably have a packed calendar and are always the friend who's up for trying that new restaurant or spontaneous road trip.

Your vibe: 🎉 Energetic • 🌈 Optimistic • 🚀 Spontaneous

**Prediction:** This year, your adventurous spirit will lead you to an unexpected opportunity. Keep saying yes (but maybe also learn when to say no to sleep deprivation)!`;
  } else if (ratio < 0.3) {
    archetype = "🎯 The Thoughtful Realist";
    description = `You're selective about what you commit to, and that's actually a superpower! Your careful approach means you value quality over quantity. You're probably the friend who gives the best advice and always has a well-thought-out plan B (and C, and D).

Your vibe: 🧠 Analytical • 🎨 Intentional • 🌙 Thoughtful

**Prediction:** Your discerning nature will help you avoid a major mishap this year that everyone else falls for. Trust your gut – it's usually right!`;
  } else {
    archetype = "⚖️ The Balanced Harmonizer";
    description = `You've mastered the art of balance! Your mix of yes and no answers shows you're neither overly cautious nor recklessly spontaneous. You probably consider things carefully but aren't afraid to take calculated risks. You're the friend everyone comes to for balanced advice.

Your vibe: 🌸 Balanced • 💫 Adaptable • 🎭 Versatile

**Prediction:** Your ability to see both sides will make you the unexpected mediator in a group situation. Your friends secretly think you should run for office.`;
  }

  return `## ${archetype}\n\n${description}`;
};
