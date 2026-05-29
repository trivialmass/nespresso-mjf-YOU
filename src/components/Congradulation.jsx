import React, { useEffect } from 'react';
import './Congradulation.css';
import { congratsLoading } from '../../client-config/content.js';
import { saveResult } from '../services/saveResult.js';

const Congradulation = ({ profile, answers, userData, onShowResults }) => {
  useEffect(() => {
    const run = async () => {
      const saved = await saveResult(userData, answers, profile);
      if (!saved) console.warn('Quiz result save failed, proceeding to show results');
      // Minimum 2s display so the loader feels intentional
      await new Promise(resolve => setTimeout(resolve, 2000));
      onShowResults();
    };
    run();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="loading-page">
      <div className="loading-spinner" aria-label="Loading" />
      <p className="loading-text">{congratsLoading}</p>
    </div>
  );
};

export default Congradulation;
