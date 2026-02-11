import React, { useState, useRef, useEffect } from 'react';
import './QuestionCard.css';

const QuestionCard = ({ question, onSwipe }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

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
      setTimeout(() => onSwipe(direction), 300);
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
    const exitX = direction === 'right' ? window.innerWidth : -window.innerWidth;
    setPosition({ x: exitX, y: 0 });
    setTimeout(() => onSwipe(direction), 300);
  };

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

  const rotation = position.x / 20;
  const opacity = 1 - Math.abs(position.x) / (window.innerWidth * 0.5);

  return (
    <>
      <div
        ref={cardRef}
        className={`question-card ${isDragging ? 'dragging' : ''}`}
        style={{
          transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`,
          opacity: opacity,
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="card-content">
          <h2>{question}</h2>
        </div>
        
        {/* Swipe indicators */}
        <div 
          className="swipe-indicator left" 
          style={{ opacity: position.x < -50 ? Math.min(Math.abs(position.x) / 200, 1) : 0 }}
        >
          ✗
        </div>
        <div 
          className="swipe-indicator right" 
          style={{ opacity: position.x > 50 ? Math.min(position.x / 200, 1) : 0 }}
        >
          ✓
        </div>
      </div>

      {/* Desktop buttons */}
      <div className="button-controls">
        <button 
          className="control-button no-button" 
          onClick={() => handleButtonClick('left')}
          aria-label="No"
        >
          ✗ No
        </button>
        <button 
          className="control-button yes-button" 
          onClick={() => handleButtonClick('right')}
          aria-label="Yes"
        >
          ✓ Yes
        </button>
      </div>
    </>
  );
};

export default QuestionCard;
