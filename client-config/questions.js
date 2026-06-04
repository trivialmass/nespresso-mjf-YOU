import zestyBg from './assets/zesty.png';
import creamyBg from './assets/creamy.png';
import jazzyBg from './assets/jazzy.jpg';

/**
 * Quiz questions.
 * traitRight = answer stored when user swipes RIGHT (IN)
 * traitLeft  = answer stored when user swipes LEFT  (OUT)
 *
 * Q1: ZESTY?  → right: zesty  / left: mellow
 * Q2: CREAMY? → right: creamy / left: light
 * Q3: JAZZY?  → right: vinyl  / left: digital
 */
export const mockQuestions = [
  {
    question: 'ZESTY?',
    traitRight: 'zesty',
    traitLeft: 'mellow',
    bgImage: zestyBg,
  },
  {
    question: 'CREAMY?',
    traitRight: 'creamy',
    traitLeft: 'light',
    bgImage: creamyBg,
  },
  {
    question: 'JAZZY?',
    traitRight: 'vinyl',
    traitLeft: 'digital',
    bgImage: jazzyBg,
  },
];
