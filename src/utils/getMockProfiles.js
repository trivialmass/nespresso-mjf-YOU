import { PROFILES } from '../../client-config/profiles.js';
import { PROFILE_IMAGES } from '../../client-config/profileImages.js';

// Returns the first profile as mock (same shape as server response)
const getMockProfile = (_answers) => ({
  id: PROFILES[0].id,
  drink: PROFILES[0].drink,
  tagline: PROFILES[0].tagline,
  description: PROFILES[0].description,
  image: PROFILE_IMAGES[PROFILES[0].id],
});

export default getMockProfile;
