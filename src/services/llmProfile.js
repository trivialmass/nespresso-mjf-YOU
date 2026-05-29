/**
 * Service to generate personality profiles via backend proxy
 *
 * The backend server handles the Infomaniak API call to avoid CORS issues.
 */
import getMockProfile from "../utils/getMockProfiles.js";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";

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

      if (!data.profile || !data.profile.drink) {
        console.warn("Backend response missing profile data, using mock");
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
};
