import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import ReactDOM from 'react-dom';
import './QuestionCard.css';



const QuestionCard = forwardRef(({ question, bgImage, onSwipe, stackIndex = 0, pointEvents, resetPosition }, ref) => {

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);
  const [disabledButton, setDisabledButton] = useState(false);
  const velocityRef = useRef({ x: 0, lastX: 0, lastTime: 0 });

  // Full-screen flash overlay opacity + direction
  const dragAbs = Math.abs(position.x);
  const overlayOpacity = dragAbs > 20 ? Math.min((dragAbs - 20) / 80, 0.85) : 0;
  const overlayDirection = position.x >= 0 ? 'right' : 'left';

  const handleStart = (clientX, clientY) => {
    setIsDragging(true);
    setStartPos({ x: clientX - position.x, y: clientY - position.y });
    velocityRef.current = { x: 0, lastX: clientX, lastTime: Date.now() };
  };

  const handleMove = (clientX, clientY) => {
    if (!isDragging) return;
    const now = Date.now();
    const dt = now - velocityRef.current.lastTime;
    if (dt > 0) {
      velocityRef.current.x = (clientX - velocityRef.current.lastX) / dt;
      velocityRef.current.lastX = clientX;
      velocityRef.current.lastTime = now;
    }
    const newX = clientX - startPos.x;
    const newY = clientY - startPos.y;
    setPosition({ x: newX, y: newY });
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const cardWidth = cardRef.current?.offsetWidth ?? 313;
    const threshold = cardWidth * 0.3;
    const velocity = velocityRef.current.x;
    const VELOCITY_THRESHOLD = 0.4; // px/ms — enables quick flick swipes

    if (Math.abs(position.x) > threshold || Math.abs(velocity) > VELOCITY_THRESHOLD) {
      const direction = position.x > 0 || velocity > 0 ? 'right' : 'left';
      animateSwipe(direction);
      setTimeout(() => onSwipe(direction), 800);
    } else {
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
    setTimeout(() => onSwipe(direction), 800);
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
      }, 550);
    }
  }, [resetPosition]);

  return (
    <>
      {/* Full-screen flash overlay — rendered outside card via portal */}
      {overlayOpacity > 0 && ReactDOM.createPortal(
        <div
          className={`swipe-flash-overlay ${overlayDirection}`}
          style={{ opacity: overlayOpacity }}
        >
          {overlayDirection === 'right' ? 'IN' : 'OUT'}
        </div>,
        document.body
      )}

      <div
        ref={cardRef}
        className={`question-card${bgImage ? ' has-bg' : ''}${isDragging ? ' dragging' : ''}`}
        style={{
          '--bg-image': bgImage ? `url(${bgImage})` : 'none',
          transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px)) rotate(${position.x * 0.03}deg)`,
          zIndex: 10 - stackIndex,
          pointerEvents: pointEvents,
          opacity: 1,
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="card-content">
          <h2>{question?.question}</h2>
        </div>
      </div>
    </>
  );
});

QuestionCard.displayName = 'QuestionCard';

export default QuestionCard;
