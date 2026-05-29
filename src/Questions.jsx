import React, { useState, useEffect, useRef } from 'react';
import QuestionCard from './components/QuestionCard';
import Congradulation from './components/Congradulation';
import Results from './components/Results.jsx';
import PoolBg from './components/PoolBg.jsx';
import { mockQuestions } from '../client-config/questions.js';
import { generateProfile } from './services/llmProfile';
import './Questions.css';

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
  const currentCardRef = useRef(null);

  useEffect(() => {
    loadQuestions();
  }, []);

  useEffect(() => {
    setVisibleIndexes([currentIndex, currentIndex + 1, currentIndex + 2]);
  }, [currentIndex, questions.length]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedQuestions = mockQuestions;
      if (!fetchedQuestions || fetchedQuestions.length === 0) {
        setError('No questions found. Check client-config/questions.js.');
      } else {
        const imageUrls = fetchedQuestions.map(q => q.bgImage).filter(Boolean);
        await Promise.all(
          imageUrls.map(url => new Promise(resolve => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = resolve;
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
    if (currentIndex < questions.length - 1) {
      setTimeout(() => setCurrentIndex(currentIndex + 1), 300);
    } else {
      setTimeout(() => handleComplete([...answers, answer]), 300);
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
        setTimeout(() => setResetPosition({ trueFalse: false, answer: null }), 300);
      }, 0);
    }
  };

  useEffect(() => {
    if (resetPosition?.trueFalse) {
      setResetPosition(prev => ({ ...prev, trueFalse: false }));
    }
  }, [resetPosition]);

  if (showResults) return <Results profile={profile} />;

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

  if (loading) {
    return (
      <PoolBg overlay>
        <div className="questions-loading">
          <div className="spinner" />
          <p>Loading…</p>
        </div>
      </PoolBg>
    );
  }

  if (error) {
    return (
      <PoolBg overlay>
        <div className="questions-error">
          <p>{error}</p>
          <button onClick={loadQuestions}>Retry</button>
        </div>
      </PoolBg>
    );
  }

  const isComplete = currentIndex >= questions.length;

  return (
    <PoolBg overlay>
      <div className="questions-frame">

        {/* ── Top arrow banner — Figma: left:23 top:49 w:347 h:106 ── */}
        <div className="questions-arrow-wrap">
          <svg
            className="questions-arrow-svg"
            viewBox="0 0 347 106"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            preserveAspectRatio="none"
          >
            <path d="M347 53.0067L307.379 0V13.6257H39.6212V0L0 53.0067L39.6212 106V92.3743H307.379V106L347 53.0067Z" fill="#1C2869" />
          </svg>
          {/* OUT — inside arrow at left:36 top:21 */}
          <span
            className="questions-label questions-out"
            onClick={() => currentCardRef.current?.triggerSwipe('left')}
            role="button"
            aria-label="Swipe OUT"
          >
            OUT
          </span>
          {/* IN — inside arrow at left:258 top:21, right-aligned */}
          <span
            className="questions-label questions-in"
            onClick={() => currentCardRef.current?.triggerSwipe('right')}
            role="button"
            aria-label="Swipe IN"
          >
            IN
          </span>
        </div>

        {/* ── Card stack ── */}
        <div className="card-container">
          {!isComplete && (
            visibleIndexes
              .filter(idx => idx < questions.length)
              .reverse()
              .map((idx, stackIdx, arr) => (
                <QuestionCard
                  key={idx}
                  ref={idx === currentIndex ? currentCardRef : null}
                  question={questions[idx]}
                  bgImage={questions[idx].bgImage}
                  onSwipe={handleSwipe}
                  stackIndex={arr.length - 1 - stackIdx}
                  pointEvents={idx === currentIndex ? 'auto' : 'none'}
                  resetPosition={resetPosition && idx === currentIndex ? resetPosition : null}
                />
              ))
          )}
        </div>

        {/* ── Bottom bar — Figma: BACK left:30 | logo center | n/total right:255 @ top:740 ── */}
        <div className="questions-bottom">
          {currentIndex > 0 && answers.length > 0 ? (
            <button className="questions-back" onClick={handleReturn}>BACK</button>
          ) : (
            <span className="questions-back" />
          )}

          <div className="questions-bottom-logo" aria-label="Nespresso × MJF">
            <svg width="53" height="54" viewBox="0 0 53 54" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_qcard)">
                <path d="M0 0V54H53V0H0Z" fill="#1C2869" />
                <path d="M7.8348 12.505V12.3059C13.4886 10.2961 20.2657 11.9362 23.9538 15.605C24.5248 16.098 26.5374 18.3164 27.3237 19.2645C29.0928 21.3786 31.4611 24.7346 33.4736 27.3607V16.6574H36.3473V37.8649C33.1366 35.1914 29.8885 29.8919 27.4547 26.697C27.4547 26.697 22.737 20.2315 20.7619 17.9277C19.2361 16.0222 16.5964 13.927 14.743 13.235C12.2717 12.23 9.76309 12.0784 7.82544 12.505H7.8348Z" fill="white" />
                <path d="M45.1651 41.6947C39.5113 43.7046 32.7342 42.0645 29.0367 38.3956C28.4657 37.9026 26.4532 35.6842 25.6763 34.7362C23.9071 32.622 21.5388 29.266 19.5263 26.64V37.3433H16.6526V16.1357C19.8633 18.8092 23.1114 24.1087 25.5358 27.3036C25.5358 27.3036 30.2536 33.7692 32.2287 36.0729C33.7545 37.9784 36.3942 40.0736 38.2382 40.7657C40.7095 41.7706 43.2181 41.9223 45.1558 41.4956V41.6947H45.1651Z" fill="white" />
              </g>
              <defs>
                <clipPath id="clip0_qcard">
                  <rect width="53" height="54" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </div>

          <span className="questions-pagination">
            {currentIndex + 1}/{questions.length}
          </span>
        </div>

      </div>
    </PoolBg>
  );
}

export default Questions;

