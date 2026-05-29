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
        <div className="quiz-intro-band">
          <p className="quiz-intro-eyebrow">{quizIntro.eyebrow}</p>
        </div>
        <div className="quiz-intro-body">
          <h1 className="quiz-intro-heading">{quizIntro.heading}</h1>
          <p className="quiz-intro-text">{quizIntro.body}</p>
          <button className="quiz-intro-cta" onClick={handleStartQuiz}>
            {quizIntro.ctaLabel}
          </button>
        </div>
        <img src={logoGame} alt="Nespresso × MJF" className="quiz-intro-logo" />
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