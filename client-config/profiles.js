/**
 * Nespresso × MJF — Coffee profiles
 *
 * traitCombinations: each entry is an array of 3 trait values [zesty/mellow, creamy/light, vinyl/digital]
 * Matching is exact (not scored): the 3 answers are sorted and joined, then looked up against sorted combos.
 *
 * Q1 ZESTY?  → right: zesty   / left: mellow
 * Q2 CREAMY? → right: creamy  / left: light
 * Q3 JAZZY?  → right: vinyl   / left: digital
 *
 * Combination table:
 * In  In  In  → 3x In   (bold)
 * In  In  Out → Zesty   (electric)
 * In  Out In  → Zesty   (electric)
 * In  Out Out → Zesty   (electric)
 * Out In  In  → Creamy  (pincolada)
 * Out In  Out → Creamy  (pincolada)
 * Out Out In  → Jazzy   (classic)
 * Out Out Out → 3x Out  (pure)
 */

export const PROFILES = [
  {
    id: 'bold',
    drink: '3x In, Ice Yuzu Tonic',
    tagline: 'Bold, fearless, all-in.',
    description: 'Espresso meets yuzu over iced tonic — bold, unapologetic, one of a kind. You don\'t test the water. You dive in. And the pool is always warm.',
    traitCombinations: [
      ['zesty', 'creamy', 'vinyl'],     // IN IN IN
    ],
  },
  {
    id: 'electric',
    drink: 'Zesty, Ice Yuzu Tonic',
    tagline: 'Electric, exclusive, unexpected.',
    description: 'Espresso meets yuzu over iced tonic — sharp, sparkling, impossible to ignore. You\'re the one who finds the unexpected twist in every night — and makes it look effortless.',
    traitCombinations: [
      ['zesty', 'creamy', 'digital'],   // IN IN OUT
      ['zesty', 'light', 'vinyl'],      // IN OUT IN
      ['zesty', 'light', 'digital'],    // IN OUT OUT
    ],
  },
  {
    id: 'pincolada',
    drink: 'Creamy, Ice Piña Colada',
    tagline: 'Smooth, exotic, effortless.',
    description: 'Espresso, coconut, pineapple — three islands, one cup. You make every room feel like a holiday.',
    traitCombinations: [
      ['mellow', 'creamy', 'vinyl'],    // OUT IN IN
      ['mellow', 'creamy', 'digital'],  // OUT IN OUT
    ],
  },
  {
    id: 'classic',
    drink: 'Jazzy, Nespresso Martini',
    tagline: 'Classic, refined, timeless.',
    description: 'Under warm lights and deep basslines, you choose the essence. Espresso shaken over ice — pure, iconic, no compromise. You don\'t chase trends, you set the tone.',
    traitCombinations: [
      ['mellow', 'light', 'vinyl'],     // OUT OUT IN
    ],
  },
  {
    id: 'pure',
    drink: '3x Out, Nespresso Martini',
    tagline: 'Pure, open, undefined.',
    description: 'Espresso shaken over ice — no label needed. The best nights are the ones you didn\'t plan.',
    traitCombinations: [
      ['mellow', 'light', 'digital'],   // OUT OUT OUT
    ],
  },
];

// Used in dev mode (llmProfile.js falls back to this)
export const mockProfile = PROFILES[0];
