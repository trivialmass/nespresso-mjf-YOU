import React, { useState } from 'react';
import './App.css';
import { logoGame } from '../client-config/brand.js';
import { quizIntro } from '../client-config/content.js';
import RsvpForm from './components/RsvpForm.jsx';
import SwipeTutorial from './components/SwipeTutorial.jsx';
import Questions from './Questions.jsx';

// TODO: URL-key invitation gating — read ?key=<token> from URL, validate against mailing list
// before rendering RsvpForm. Users without a valid key see only the quiz (no form).

function App() {
  const [step, setStep] = useState('rsvp'); // rsvp | quiz-intro | tutorial | quiz | result
  const [userData, setUserData] = useState(null);

  const handleRsvpSubmit = (formData) => {
    setUserData(formData);
    setStep('quiz-intro');
  };

  const handleStartQuiz = () => setStep('tutorial');
  const handleTutorialReady = () => setStep('quiz');
  const handleRestart = () => {
    setUserData(null);
    setStep('rsvp');
  };

  if (step === 'rsvp') {
    return <RsvpForm onSubmit={handleRsvpSubmit} />;
  }

  if (step === 'quiz-intro') {
    return (
      <div className="quiz-intro-page">
        <div className="quiz-intro-text-block">
          <h1 className="quiz-intro-heading">{quizIntro.heading}</h1>
          <p className="quiz-intro-body-text">{quizIntro.body}</p>
        </div>
        <button className="quiz-intro-cta" onClick={handleStartQuiz}>
          {quizIntro.ctaLabel}
        </button>
        <div className="quiz-intro-logo" aria-label="Nespresso × MJF">
          <svg width="53" height="54" viewBox="0 0 53 54" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_quizintro)">
              <path d="M0 0V54H53V0H0Z" fill="#1C2869"/>
              <path d="M7.8348 12.505V12.3059C13.4886 10.2961 20.2657 11.9362 23.9538 15.605C24.5248 16.098 26.5374 18.3164 27.3237 19.2645C29.0928 21.3786 31.4611 24.7346 33.4736 27.3607V16.6574H36.3473V37.8649C33.1366 35.1914 29.8885 29.8919 27.4547 26.697C27.4547 26.697 22.737 20.2315 20.7619 17.9277C19.2361 16.0222 16.5964 13.927 14.743 13.235C12.2717 12.23 9.76309 12.0784 7.82544 12.505H7.8348Z" fill="white"/>
              <path d="M45.1651 41.6947C39.5113 43.7046 32.7342 42.0645 29.0367 38.3956C28.4657 37.9026 26.4532 35.6842 25.6763 34.7362C23.9071 32.622 21.5388 29.266 19.5263 26.64V37.3433H16.6526V16.1357C19.8633 18.8092 23.1114 24.1087 25.5358 27.3036C25.5358 27.3036 30.2536 33.7692 32.2287 36.0729C33.7545 37.9784 36.3942 40.0736 38.2382 40.7657C40.7095 41.7706 43.2181 41.9223 45.1558 41.4956V41.6947H45.1651Z" fill="white"/>
            </g>
            <defs>
              <clipPath id="clip0_quizintro">
                <rect width="53" height="54" fill="white"/>
              </clipPath>
            </defs>
          </svg>
        </div>
      </div>
    );
  }

  if (step === 'tutorial') {
    return <SwipeTutorial onReady={handleTutorialReady} />;
  }

  if (step === 'quiz' || step === 'result') {
    return (
      <Questions
        userData={userData}
        onRestart={handleRestart}
      />
    );
  }

  return null;
}

export default App;