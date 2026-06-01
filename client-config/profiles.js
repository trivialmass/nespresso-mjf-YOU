/**
 * Nespresso × MJF — Coffee profiles
 *
 * traitCombinations: each entry is an array of 3 trait values [zesty/mellow, creamy/light, vinyl/digital]
 * Matching is exact (not scored): the 3 answers are sorted and joined, then looked up against sorted combos.
 *
 * Q1 ZESTY?  → right: zesty   / left: mellow
 * Q2 CREAMY? → right: creamy  / left: light
 * Q3 VINYL?  → right: vinyl   / left: digital
 */

export const PROFILES = [
  {
    id: 'bold',
    drink: 'Ice Yuzu Tonic',
    tagline: 'Bold, fearless, all-in.',
    description: 'Espresso meets yuzu over iced tonic, with a twist of gin — bold, unapologetic, one of a kind. You don\'t test the water. You dive in. And the pool is always warm.',
    traitCombinations: [
      ['zesty', 'creamy', 'vinyl'],     // IN IN IN
    ],
  },
  {
    id: 'electric',
    drink: 'Ice Yuzu Tonic',
    tagline: 'Electric, exclusive, unexpected.',
    description: 'Espresso meets yuzu over iced tonic, with a twist of gin. You\'re the one who finds the hidden door at the Nespresso Terrasse — and orders something that sparks.',
    traitCombinations: [
      ['zesty', 'creamy', 'digital'],   // IN IN OUT
      ['mellow', 'creamy', 'digital'],  // OUT IN OUT
    ],
  },
  {
    id: 'pincolada',
    drink: 'Ice Piña Colada',
    tagline: 'Smooth, exotic, effortless.',
    description: 'Espresso, coconut, pineapple — three islands, one cup. You drift into the Pool Universe like you own it.',
    traitCombinations: [
      ['zesty', 'light', 'digital'],    // IN OUT OUT
      ['mellow', 'creamy', 'vinyl'],    // OUT IN IN
    ],
  },
  {
    id: 'classic',
    drink: 'Nespresso Martini',
    tagline: 'Classic, refined, timeless.',
    description: 'Under warm lights and deep basslines, you choose the essence. Espresso shaken with vodka and coffee liqueur — pure, iconic, no compromise. You don\'t chase trends, you set the tone.',
    traitCombinations: [
      ['zesty', 'light', 'vinyl'],      // IN OUT IN
      ['mellow', 'light', 'vinyl'],     // OUT OUT IN
    ],
  },
  {
    id: 'pure',
    drink: 'Nespresso Martini',
    tagline: 'Pure, open, undefined.',
    description: 'Espresso, vodka, coffee liqueur — shaken, not overthought. No label needed. The best nights are the ones you didn\'t plan.',
    traitCombinations: [
      ['mellow', 'light', 'digital'],   // OUT OUT OUT
    ],
  },
];

// Used in dev mode (llmProfile.js falls back to this)
export const mockProfile = PROFILES[0];
