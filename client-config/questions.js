import grooveBg from './assets/groove.png';
import vinylBg from './assets/vinyl.jpg';
import backstageBg from './assets/backstage.png';

/**
 * Quiz questions.
 * traitRight = answer stored when user swipes RIGHT (IN)
 * traitLeft  = answer stored when user swipes LEFT  (OUT)
 *
 * Q1: GROOVE?    → right: groove   / left: chill
 * Q2: VINYL?     → right: vinyl    / left: digital
 * Q3: BACKSTAGE? → right: backstage/ left: frontrow
 */
export const mockQuestions = [
  {
    question: 'GROOVE?',
    traitRight: 'groove',
    traitLeft: 'chill',
    bgImage: grooveBg,
  },
  {
    question: 'VINYL?',
    traitRight: 'vinyl',
    traitLeft: 'digital',
    bgImage: vinylBg,
  },
  {
    question: 'BACKSTAGE?',
    traitRight: 'backstage',
    traitLeft: 'frontrow',
    bgImage: backstageBg,
  },
];
