import React, { useState, useEffect } from 'react';
import QuestionCard from './components/QuestionCard';
import Results from './components/Results';
import { fetchQuestions } from './services/googleSheets';
import { generateProfile } from './services/llmProfile';
import './App.css';

function App() {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [profile, setProfile] = useState('');

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const fetchedQuestions = await fetchQuestions();
      setQuestions(fetchedQuestions);
      setLoading(false);
    } catch (err) {
      setError('Failed to load questions. Please try again.');
      setLoading(false);
    }
  };

  const handleSwipe = (direction) => {
    const answer = {
      question: questions[currentIndex],
      answer: direction === 'right' ? 'yes' : 'no',
      timestamp: new Date().toISOString(),
    };

    setAnswers([...answers, answer]);

    // Move to next question
    if (currentIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
      }, 300);
    } else {
      // All questions answered
      setTimeout(() => {
        handleComplete([...answers, answer]);
      }, 300);
    }
  };

  const handleComplete = async (finalAnswers) => {
    try {
      setLoading(true);
      const generatedProfile = await generateProfile(finalAnswers);
      setProfile(generatedProfile);
      setShowResults(true);
      setLoading(false);
    } catch (err) {
      console.error('Error generating profile:', err);
      setError('Failed to generate your profile. Please try again.');
      setLoading(false);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setAnswers([]);
    setShowResults(false);
    setProfile('');
    setError(null);
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <div className="error">
          <p>{error}</p>
          <button onClick={loadQuestions}>Retry</button>
        </div>
      </div>
    );
  }

  // Show results if profile is generated
  if (showResults && profile) {
    return <Results profile={profile} answers={answers} onRestart={handleRestart} />;
  }

  const isComplete = currentIndex >= questions.length;

  return (
    <div className="app">
      <header className="app-header">
        <h1>Trivial Quizz</h1>
        <div className="progress">
          Question {Math.min(currentIndex + 1, questions.length)} of {questions.length}
        </div>
      </header>

      <div className="card-container">
        {!isComplete && (
          <QuestionCard
            key={currentIndex}
            question={questions[currentIndex]}
            onSwipe={handleSwipe}
          />
        )}
        
        {isComplete && (
          <div className="complete-message">
            <h2>🎉 Generating Your Profile...</h2>
            <div className="spinner"></div>
            <p>Analyzing your answers with AI magic ✨</p>
          </div>
        )}
      </div>

      <div className="instructions">
        <p className="mobile-only">← Swipe left for NO | Swipe right for YES →</p>
        <p className="desktop-only">Use the buttons below or drag the card</p>
      </div>
    </div>
  );
}

export default App;
