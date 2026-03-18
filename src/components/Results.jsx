import React from 'react';
import './Results.css';

const Results = ({ profile, answers, onRestart }) => {
  const yesCount = answers.filter(a => a.answer === 'yes').length;
  const noCount = answers.filter(a => a.answer === 'no').length;

  // Parse the profile to extract title if it has markdown heading
  const lines = profile.split('\n');
  let title = 'Your Personality Profile';
  let content = profile;
  
  if (lines[0].startsWith('##')) {
    title = lines[0].replace(/^##\s*/, '');
    content = lines.slice(1).join('\n');
  }

  return (
    <div className="results-container">
      <div className="results-card">
        <div className="results-header">
          <h1>{title}</h1>
        </div>

        <div className="results-content">
          <div className="profile-text">
            {content.split('\n\n').map((paragraph, index) => {
              // Check if it's a bold section (starts with **)
              if (paragraph.trim().startsWith('**')) {
                const boldText = paragraph.match(/\*\*(.*?)\*\*/);
                if (boldText) {
                  return (
                    <p key={index} className="profile-highlight">
                      <strong>{boldText[1]}</strong>
                      {paragraph.replace(/\*\*.*?\*\*/, '')}
                    </p>
                  );
                }
              }
              
              // Regular paragraph
              if (paragraph.trim()) {
                return <p key={index}>{paragraph}</p>;
              }
              return null;
            })}
          </div>

          <div className="stats-box">
            <h3>VOS STATISTIQUES</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">{answers.length}</div>
                <div className="stat-label">Questions</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{yesCount}</div>
                <div className="stat-label">OUI</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{noCount}</div>
                <div className="stat-label">NON</div>
              </div>
            </div>
          </div>
        </div>

        <div className="results-actions">
          <button className="restart-button" onClick={onRestart}>
            Refaites le quiz
          </button>
          <button className="share-button" onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: title,
                text: `I just took the trivial YOU! Check out my profile: ${content}`,
              });
            } else {
              alert('Sharing not supported on this browser');
            }
          }}>
            Partager les résultats
          </button>
        </div>
      </div>
      <div className='results-subtext'>
          <p>Votre profile trivial YOU vous a été envoyé par email.</p>
          <p>Merci pour votre participation!</p>
          <a href='https://trivialmass.ch/' target="_blank">trivialmass.com</a>
      </div>
    </div>
  );
};

export default Results;
