import React, { useState, useEffect, useRef } from 'react';
import QuestionCard from './components/QuestionCard';
import Congradulation from './components/Congradulation';
import Results from './components/Results.jsx';
import { mockQuestions } from '../client-config/questions.js';
import { generateProfile } from './services/llmProfile';
import './Questions.css';
import { headerBanier, logoIN, logoOUT, logoSwipe } from '../client-config/brand.js';

function Questions(userData) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleIndexes, setVisibleIndexes] = useState([0, 1]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState('');
  const [showCongradulation, setShowCongradulation] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [resetPosition, setResetPosition] = useState({ trueFalse: false, answer: null });
  const [swipeTilt, setSwipeTilt] = useState(0);
  const currentCardRef = useRef(null);

  useEffect(() => {
    loadQuestions();
  }, []);

  useEffect(() => {
    setVisibleIndexes([currentIndex, currentIndex + 1, currentIndex + 2]);
  }, [currentIndex, questions.length]);

  useEffect(() => {
    setSwipeTilt(20);
    setTimeout(() => {
      setSwipeTilt(-20);
      setTimeout(() => {
        setSwipeTilt(0);
      }, 300);
    }, 300);
  }, [currentIndex]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedQuestions = mockQuestions;
      if (!fetchedQuestions || fetchedQuestions.length === 0) {
        setError('No questions found. Check client-config/questions.js.');
      } else {
        // Preload all background images before showing the quiz
        const imageUrls = fetchedQuestions.map(q => q.bgImage).filter(Boolean);
        await Promise.all(
          imageUrls.map(url => new Promise(resolve => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = resolve; // don't block if an image fails
            img.src = url;
          }))
        );
        setQuestions(fetchedQuestions);
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to load questions:', err);
      setError(`Failed to load questions: ${err.message || 'Unknown error'}`);
      setLoading(false);
    }
  };

  const handleSwipe = (direction) => {
    const answer = {
      question: questions[currentIndex],
      answer: direction === 'right' ? questions[currentIndex].traitRight : questions[currentIndex].traitLeft,
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

  // Show results screen
  if (showResults) {
    return (
      <Results
        profile={profile}
        onRestart={handleRestart}
      />
    );
  }

  // Show congratulation screen
  if (showCongradulation && profile) {
    return (
      <Congradulation
        profile={profile}
        answers={answers}
        userData={userData}
        onShowResults={() => setShowResults(true)}
      />
    );
  }

  const isComplete = currentIndex >= questions.length;

  const eventNone = "none";
  const eventAuto = "auto";

  return (
    <div className="questions">
      <header className="questions-header">
        <img src={headerBanier} alt="Out In Logo" className="outInLogo" />
        <div className='logosContainer'>
          <img 
            src={logoOUT} 
            alt="Logo OUT" 
            className="logoInOut" 
            onClick={() => currentCardRef.current?.triggerSwipe('left')}
            style={{ cursor: 'pointer' }}
          />
          <img 
            src={logoIN} 
            alt="Logo IN" 
            className="logoInOut" 
            onClick={() => currentCardRef.current?.triggerSwipe('right')}
            style={{ cursor: 'pointer' }}
          />
        </div>
        <img
          src={logoSwipe}
          alt="Logo Swipe"
          className="logoSwipe"
          style={{
            transform: `translate(-50%, -50%) rotate(${swipeTilt}deg)`,
            transition: 'transform 0.3s cubic-bezier(.68,-0.55,.27,1.55)'
          }}
        />
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
                    ref={idx === currentIndex ? currentCardRef : null}
                    question={questions[idx].question}
                    bgImage={questions[idx].bgImage}
                    progressLabel={idx === currentIndex ? `${currentIndex + 1}/3` : undefined}
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
