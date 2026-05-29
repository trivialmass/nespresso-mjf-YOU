import React from 'react';
import './SwipeTutorial.css';
import { logoIN, logoOUT, logoSwipe } from '../../client-config/brand.js';

const SwipeTutorial = ({ onReady }) => {
  return (
    <div className="tutorial-page">
      <div className="tutorial-overlay" />
      <div className="tutorial-content">
        <div className="tutorial-arrows">
          <div className="tutorial-side tutorial-left">
            <img src={logoOUT} alt="OUT" className="tutorial-arrow-img" />
            <span className="tutorial-label out">OUT</span>
          </div>
          <img src={logoSwipe} alt="Swipe" className="tutorial-swipe-icon" />
          <div className="tutorial-side tutorial-right">
            <span className="tutorial-label in">IN</span>
            <img src={logoIN} alt="IN" className="tutorial-arrow-img" />
          </div>
        </div>
        <p className="tutorial-hint">Swipez pour répondre</p>
        <button className="tutorial-cta" onClick={onReady}>
          C'est parti
        </button>
      </div>
    </div>
  );
};

export default SwipeTutorial;
