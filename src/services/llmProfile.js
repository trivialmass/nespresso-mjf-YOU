/**
 * Profile matching — purely client-side, no LLM or backend.
 * Sorts the 3 answer traits alphabetically, joins them, then looks up
 * against each profile's traitCombinations. Falls back to last profile.
 */
import { PROFILES } from "../../client-config/profiles.js";
import { PROFILE_IMAGES } from "../../client-config/profileImages.js";

export const generateProfile = (answers) => {
  const traitKey = answers.map(({ answer }) => answer).sort().join(',');

  for (const profile of PROFILES) {
    for (const combo of profile.traitCombinations) {
      if ([...combo].sort().join(',') === traitKey) {
        return { ...profile, image: PROFILE_IMAGES[profile.id] };
      }
    }
  }

  // Fallback to last profile if no exact match
  const fallback = PROFILES[PROFILES.length - 1];
  return { ...fallback, image: PROFILE_IMAGES[fallback.id] };
};
