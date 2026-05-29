import { PROFILES } from '../../client-config/profiles.js';

// Returns the first profile as mock (same shape as server response)
const getMockProfile = (_answers) => ({
  id: PROFILES[0].id,
  drink: PROFILES[0].drink,
  tagline: PROFILES[0].tagline,
  description: PROFILES[0].description,
});

export default getMockProfile;
