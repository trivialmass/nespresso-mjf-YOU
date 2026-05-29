import React from 'react';
import './Results.css';
import { resultsEmailSent, resultsFooterLink } from '../../client-config/content.js';
import { headerBanier } from '../../client-config/brand.js';

const Results = ({ profile, onRestart }) => {
  return (
    <div className="results-page">
      <header className="results-header">
        <img src={headerBanier} alt="Nespresso × MJF" className="results-logo" />
      </header>

      <div className="results-drink">
        <h1 className="results-drink-name">{profile?.drink}</h1>
        <p className="results-tagline">{profile?.tagline}</p>
      </div>

      <div className="results-description">
        <p>{profile?.description}</p>
      </div>

      <div className="results-footer">
        <p className="results-email-notice">{resultsEmailSent}</p>
        <a
          className="results-footer-link"
          href={resultsFooterLink.href}
          target="_blank"
          rel="noopener noreferrer"
        >{resultsFooterLink.label}</a>
        <button className="results-restart" onClick={onRestart}>
          Recommencer
        </button>
      </div>
    </div>
  );
};

export default Results;
