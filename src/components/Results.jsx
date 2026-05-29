import React from 'react';
import './Results.css';
import PoolBg from './PoolBg.jsx';
import { headerBanier } from '../../client-config/brand.js';

const Results = ({ profile }) => (
  <PoolBg overlay>
    <div className="results-card">
      {/* TODO: replace placeholder with actual drink photo from client-config/assets */}
      <div className="results-card__photo" aria-hidden="true" />
      <div className="results-card__body">
        <div className="results-card__drink-block">
          <h1 className="results-card__drink-name">{profile?.drink}</h1>
          <p className="results-card__tagline">{profile?.tagline}</p>
        </div>
        <p className="results-card__description">{profile?.description}</p>
      </div>
    </div>
    <img src={headerBanier} alt="Nespresso × MJF" className="results-footer-logo" />
  </PoolBg>
);

export default Results;
