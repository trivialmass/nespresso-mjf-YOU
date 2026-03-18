import React, { useState, useEffect, use } from 'react';
import QuestionCard from './components/QuestionCard';
import Congradulation from './components/Congradulation';
import { fetchQuestions } from './services/googleSheets';
import { generateProfile } from './services/llmProfile';
import './Questions.css';
import outIn from './logo/outIn.svg';

function Questions() {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleIndexes, setVisibleIndexes] = useState([0, 1]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState('');
  const [showCongradulation, setShowCongradulation] = useState(false);
  const [resetPosition, setResetPosition] = useState({ trueFalse: false, answer: null });

  useEffect(() => {
    loadQuestions();
  }, []);

  useEffect(() => {
    setVisibleIndexes([currentIndex, currentIndex + 1, currentIndex + 2]);
  }, [currentIndex, questions.length]);

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
      setShowCongradulation(true);
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
    setShowCongradulation(false);
    setProfile('');
    setError(null);
  };

  const handleReturn = () => {
    if (currentIndex > 0 && answers.length > 0) {
      setCurrentIndex(currentIndex - 1);
      setAnswers(prev => prev.slice(0, -1));
      setTimeout(() => {
        setResetPosition({
          trueFalse: true,
          answer: answers[answers.length - 1]?.answer || null
        });
        setTimeout(() => {
          setResetPosition({ trueFalse: false, answer: null });
        }, 300);
      }, 0);
    }
  };

  useEffect(() => {
    if (resetPosition && resetPosition.trueFalse) {
      setResetPosition(prev => ({
        ...prev,
        trueFalse: false
      }));
    }
  }, [resetPosition]);

  const handleReturnToLastQuestion = () => {
    setShowCongradulation(false);
    setCurrentIndex(questions.length - 1);
    setAnswers(answers.slice(0, -1));
    setProfile('');
  };

  if (loading) {
    return (
      <div className="questions">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="questions">
        <div className="error">
          <p>{error}</p>
          <button onClick={loadQuestions}>Retry</button>
        </div>
      </div>
    );
  }

  // Show congratulation screen
  if (showCongradulation && profile) {
    return (
      <Congradulation
        profile={profile}
        answers={answers}
        onRestart={handleRestart}
        onReturnToLastQuestion={handleReturnToLastQuestion}
      />
    );
  }

  const isComplete = currentIndex >= questions.length;

  const eventNone = "none";
  const eventAuto = "auto";

  return (
    <div className="questions">
      <header className="questions-header">
        <img src={outIn} alt="Out In Logo" className="outInLogo" />
      </header>

      <div className="card-container">
        {!isComplete && (
          <>
            {
              visibleIndexes
                .filter(idx => idx < questions.length)
                .reverse()
                .map((idx, stackIdx, arr) => (
                  <QuestionCard
                    key={idx}
                    question={questions[idx]['question']}
                    bgImage={questions[idx]['bgImage']}
                    onSwipe={handleSwipe}
                    stackIndex={arr.length - 1 - stackIdx}
                    pointEvents={idx === currentIndex ? eventAuto : eventNone}
                    resetPosition={resetPosition && idx === currentIndex ? resetPosition : null} />
                ))
            }
          </>
        )}

        {isComplete && (
          <div className="complete-message">
            <h2>🎉 Generating Your Profile...</h2>
            <div className="spinner"></div>
            <p>Analyzing your answers with AI magic ✨</p>
          </div>
        )}
      </div>

      {/* if it is first question, hide the return button */}
      {currentIndex > 0 && answers.length > 0 && (
        <button
          className='buttonReturnQuestions'
          onClick={handleReturn}
          disabled={loading}
        >
          Retour
        </button>
      )}

      <p className='paginationQuestions'>
        {currentIndex + 1} / {questions.length}
      </p>
    </div>
  );
}

export default Questions;
