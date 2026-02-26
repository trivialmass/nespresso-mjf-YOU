/**
 * Service to generate personality profiles via backend proxy
 *
 * The backend server handles the Infomaniak API call to avoid CORS issues.
 */
import getMockProfile from "../utils/getMockProfiles.js";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

export const generateProfile = async (answers) => {
  //Check if env is dev or prod
  const isDev = import.meta.env.MODE === "development";

  if (!isDev) {
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
  } else {
    return getMockProfile(answers);
  }

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
};
