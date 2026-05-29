import React from 'react';
import './SwipeTutorial.css';
import PoolBg from './PoolBg.jsx';
import { headerBanier } from '../../client-config/brand.js';

const SwipeTutorial = ({ onReady }) => (
  <PoolBg overlay>
    <div className="tutorial-content">
      <p className="tutorial-instructions">
        Swipe right<br />for In.<br /><br />Swipe left<br />for Out.
      </p>
      <div className="tutorial-inout">
        <span className="tutorial-out">OUT</span>
        <span className="tutorial-in">IN</span>
      </div>
      <button className="tutorial-cta" onClick={onReady}>
        C'est parti
      </button>
    </div>
    <img src={headerBanier} alt="Nespresso × MJF" className="tutorial-footer-logo" />
  </PoolBg>
);

export default SwipeTutorial;
