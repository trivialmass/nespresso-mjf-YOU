import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import './QuestionCard.css';



const QuestionCard = forwardRef(({ question, bgImage, onSwipe, stackIndex = 0, pointEvents, resetPosition, progressLabel = '' }, ref) => {

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);
  const [disabledButton, setDisabledButton] = useState(false);

  const handleStart = (clientX, clientY) => {
    setIsDragging(true);
    setStartPos({ x: clientX - position.x, y: clientY - position.y });
  };

  const handleMove = (clientX, clientY) => {
    if (!isDragging) return;

    const newX = clientX - startPos.x;
    const newY = clientY - startPos.y;
    setPosition({ x: newX, y: newY });
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = window.innerWidth * 0.3;

    if (Math.abs(position.x) > threshold) {
      const direction = position.x > 0 ? 'right' : 'left';
      animateSwipe(direction);
      setTimeout(() => onSwipe(direction), 800);
    } else {
      // Snap back
      setPosition({ x: 0, y: 0 });
    }
  };

  const animateSwipe = (direction) => {
    const exitX = direction === 'right' ? window.innerWidth : -window.innerWidth;
    setPosition({ x: exitX, y: position.y });
  };

  // Mouse events
  const handleMouseDown = (e) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e) => {
    handleMove(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  // Touch events
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  // Button handlers
  const handleButtonClick = (direction) => {
    setDisabledButton(true);
    const exitX = direction === 'right' ? window.innerWidth : -window.innerWidth;
    setPosition({ x: exitX, y: 0 });
    setTimeout(() => onSwipe(direction), 300);
  };

  // Expose handleButtonClick to parent via ref
  useImperativeHandle(ref, () => ({
    triggerSwipe: handleButtonClick
  }));

  useEffect(() => {
    if (disabledButton) {
      setTimeout(() => setDisabledButton(false), 2000);
    }
  }, [disabledButton]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, position]);

  // Reset position for last card with question from right side if user says yes and from left side if user says no
  useEffect(() => {
    if (
      resetPosition &&
      resetPosition['trueFalse'] &&
      resetPosition['answer']
    ) {
      const direction = resetPosition.answer === 'yes' ? 'right' : 'left';
      const exitX = direction === 'right' ? window.innerWidth : -window.innerWidth;
      setPosition({ x: exitX, y: 0 });
      setTimeout(() => {
        setPosition({ x: 0, y: 0 });
      }, 700);
    }
  }, [resetPosition]);

  return (
    <div
      ref={cardRef}
      className={`question-card${bgImage ? ' has-bg' : ''}${isDragging ? ' dragging' : ''}`}
      style={{
        '--bg-image': bgImage ? `url(${bgImage})` : 'none',
        transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px)) rotate(${position.x * 0.03}deg)`,
        zIndex: 10 - stackIndex,
        pointerEvents: pointEvents,
        opacity: stackIndex === 0 ? 1 : 0.85 - stackIndex * 0.1,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {progressLabel && (
        <span className="card-progress">{progressLabel}</span>
      )}

      {/* IN indicator — shown when dragging right */}
      <span
        className="swipe-indicator right"
        style={{ opacity: position.x > 20 ? Math.min((position.x - 20) / 80, 1) : 0 }}
      >
        IN
      </span>
      {/* OUT indicator — shown when dragging left */}
      <span
        className="swipe-indicator left"
        style={{ opacity: position.x < -20 ? Math.min((-position.x - 20) / 80, 1) : 0 }}
      >
        OUT
      </span>

      <div className="card-content">
        <h2>{question?.question}</h2>
      </div>

      <div className="button-controls">
        <button
          className="control-button no-button"
          onClick={() => !disabledButton && handleButtonClick('left')}
          disabled={disabledButton}
        >
          OUT
        </button>
        <button
          className="control-button yes-button"
          onClick={() => !disabledButton && handleButtonClick('right')}
          disabled={disabledButton}
        >
          IN
        </button>
      </div>
    </div>
  );
});

QuestionCard.displayName = 'QuestionCard';

export default QuestionCard;
