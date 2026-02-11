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
            <h3>Your Stats</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">{answers.length}</div>
                <div className="stat-label">Questions</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{yesCount}</div>
                <div className="stat-label">Yes</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{noCount}</div>
                <div className="stat-label">No</div>
              </div>
            </div>
          </div>
        </div>

        <div className="results-actions">
          <button className="restart-button" onClick={onRestart}>
            Take Quiz Again
          </button>
          <button className="share-button" onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: 'My Personality Profile',
                text: `I just took the Trivial Quizz! Check out my profile: ${title}`,
              });
            } else {
              alert('Sharing not supported on this browser');
            }
          }}>
            Share Results
          </button>
        </div>
      </div>
    </div>
  );
};

export default Results;
